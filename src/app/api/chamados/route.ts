import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { escolherTecnicoParaChamado } from '@/lib/distribuicao';
import { notificar } from '@/lib/email';
// import { auth } from '@/lib/auth'; // TODO: plugar sessão real (NextAuth)

const novoChamadoSchema = z.object({
  classificacaoId: z.string().uuid(),
  identificadorMaquina: z.string().min(1),
  resumo: z.string().min(5),
  telefoneContato: z.string().min(8),
});

// GET /api/chamados — lista chamados visíveis ao usuário logado
// (funcionário: só os seus · gestor: todos da empresa · técnico: fila do grupo · admin: todos)
export async function GET(req: NextRequest) {
  // TODO: obter usuário/papel da sessão autenticada em vez de query params
  const { searchParams } = new URL(req.url);
  const empresaId = searchParams.get('empresaId');
  const usuarioId = searchParams.get('usuarioId');
  const papel = searchParams.get('papel'); // 'funcionario' | 'gestor'

  if (!empresaId) {
    return NextResponse.json({ error: 'empresaId é obrigatório' }, { status: 400 });
  }

  const where =
    papel === 'gestor' ? { empresaId } : { empresaId, usuarioId: usuarioId ?? undefined };

  const chamados = await prisma.chamado.findMany({
    where,
    include: { classificacao: true, grupo: true, tecnico: true },
    orderBy: { criadoEm: 'desc' },
  });

  return NextResponse.json(chamados);
}

// POST /api/chamados — abre um novo chamado (lado do usuário)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = novoChamadoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // TODO: pegar usuarioId/empresaId da sessão autenticada, não do body
  const { usuarioId, ...dados } = body as { usuarioId: string } & typeof parsed.data;

  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } });

  const classificacao = await prisma.classificacao.findUniqueOrThrow({
    where: { id: dados.classificacaoId },
  });

  // Roteamento automático (seção 5.1): grupo vem da classificação escolhida.
  const tecnicoId = await escolherTecnicoParaChamado(classificacao.grupoId);

  const chamado = await prisma.chamado.create({
    data: {
      empresaId: usuario.empresaId,
      usuarioId: usuario.id,
      classificacaoId: classificacao.id,
      grupoId: classificacao.grupoId,
      tecnicoId,
      identificadorMaquina: dados.identificadorMaquina,
      resumo: dados.resumo,
      telefoneContato: dados.telefoneContato,
      status: tecnicoId ? 'EM_ATENDIMENTO' : 'ABERTO',
    },
    include: { tecnico: true, grupo: true },
  });

  if (chamado.tecnico) {
    await notificar({
      chamadoId: chamado.id,
      destinatario: chamado.tecnico.email,
      evento: 'novo_chamado',
      assunto: `Novo chamado #${chamado.numero} — ${chamado.grupo.nome}`,
      corpoHtml: `<p>Um novo chamado foi atribuído a você: <b>${chamado.resumo}</b></p>`,
    });
  }

  return NextResponse.json(chamado, { status: 201 });
}
