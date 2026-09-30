import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { notificar } from '@/lib/email';

const mensagemSchema = z.object({
  autorTipo: z.enum(['USUARIO', 'TECNICO']),
  autorId: z.string().uuid(),
  mensagem: z.string().min(1),
  anexoUrl: z.string().url().optional(),
});

// POST /api/chamados/[id]/mensagens — nova interação no chat do chamado
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const parsed = mensagemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { autorTipo, autorId, mensagem, anexoUrl } = parsed.data;

  const chamado = await prisma.chamado.findUniqueOrThrow({
    where: { id },
    include: { usuario: true, tecnico: true },
  });

  const novaMensagem = await prisma.mensagem.create({
    data: {
      chamadoId: id,
      autorTipo,
      usuarioId: autorTipo === 'USUARIO' ? autorId : null,
      tecnicoId: autorTipo === 'TECNICO' ? autorId : null,
      mensagem,
      anexoUrl,
    },
  });

  // Notifica a outra ponta da conversa (seção 6).
  const destinatario = autorTipo === 'USUARIO' ? chamado.tecnico?.email : chamado.usuario.email;
  if (destinatario) {
    await notificar({
      chamadoId: chamado.id,
      destinatario,
      evento: 'nova_mensagem',
      assunto: `Nova mensagem no chamado #${chamado.numero}`,
      corpoHtml: `<p>${mensagem}</p>`,
    });
  }

  return NextResponse.json(novaMensagem, { status: 201 });
}
