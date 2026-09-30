import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { fecharSlaNaResolucao } from '@/lib/sla';
import { notificar } from '@/lib/email';

const statusValidos = ['ABERTO', 'EM_ATENDIMENTO', 'AGUARDANDO_USUARIO', 'RESOLVIDO', 'FECHADO'] as const;

const atualizarSchema = z.object({
  status: z.enum(statusValidos),
});

// PATCH /api/chamados/[id] — troca de status (usado pelo técnico)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const parsed = atualizarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const chamado = await prisma.chamado.findUniqueOrThrow({
    where: { id },
    include: { classificacao: { include: { slaPolitica: true } }, usuario: true },
  });

  const novoStatus = parsed.data.status;
  const agora = new Date();

  const data: Record<string, unknown> = { status: novoStatus };

  // Pausa/retoma o SLA (seção 5.3): pausa ao entrar em "aguardando_usuario",
  // acumula o tempo pausado ao sair desse status.
  if (novoStatus === 'AGUARDANDO_USUARIO' && !chamado.slaPausadoDesde) {
    data.slaPausadoDesde = agora;
  }
  if (chamado.slaPausadoDesde && novoStatus !== 'AGUARDANDO_USUARIO') {
    const pausadoAgoraMin = (agora.getTime() - chamado.slaPausadoDesde.getTime()) / 60000;
    data.slaTempoPausadoTotalMin = chamado.slaTempoPausadoTotalMin + pausadoAgoraMin;
    data.slaPausadoDesde = null;
  }

  if (!chamado.slaPrimeiraRespostaEm && novoStatus === 'EM_ATENDIMENTO') {
    data.slaPrimeiraRespostaEm = agora;
  }

  if (novoStatus === 'RESOLVIDO' && chamado.classificacao.slaPolitica) {
    const resultado = fecharSlaNaResolucao(chamado, chamado.classificacao.slaPolitica, agora);
    data.slaEstourado = resultado.slaEstourado; // valor histórico, gravado uma única vez
    data.resolvidoEm = agora;
  }

  const atualizado = await prisma.chamado.update({ where: { id }, data });

  await notificar({
    chamadoId: atualizado.id,
    destinatario: chamado.usuario.email,
    evento: novoStatus === 'RESOLVIDO' ? 'chamado_resolvido' : 'mudanca_status',
    assunto: `Chamado #${chamado.numero} — status atualizado`,
    corpoHtml: `<p>O status do seu chamado mudou para: <b>${novoStatus}</b></p>`,
  });

  return NextResponse.json(atualizado);
}
