import { Resend } from 'resend';
import { prisma } from './prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

type EventoNotificacao =
  | 'novo_chamado'
  | 'chamado_assumido'
  | 'nova_mensagem'
  | 'mudanca_status'
  | 'chamado_resolvido';

/**
 * Envia a notificação e já grava o log (tabela LogNotificacao — seção 6
 * da especificação), para que falhas de entrega possam ser auditadas.
 */
export async function notificar(params: {
  chamadoId: string;
  destinatario: string;
  evento: EventoNotificacao;
  assunto: string;
  corpoHtml: string;
}) {
  const { chamadoId, destinatario, evento, assunto, corpoHtml } = params;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'helpdesk@seudominio.com',
      to: destinatario,
      subject: assunto,
      html: corpoHtml,
    });

    await prisma.logNotificacao.create({
      data: { chamadoId, destinatario, tipoEvento: evento, statusEnvio: 'SUCESSO' },
    });
  } catch (err) {
    await prisma.logNotificacao.create({
      data: { chamadoId, destinatario, tipoEvento: evento, statusEnvio: 'FALHA' },
    });
    console.error(`Falha ao notificar (${evento}) para ${destinatario}:`, err);
  }
}
