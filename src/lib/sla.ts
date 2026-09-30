import type { Chamado, SlaPolitica } from '@prisma/client';

export type NivelSla = 'ok' | 'atencao' | 'alerta' | 'critico';

/**
 * Minutos efetivamente decorridos desde a abertura do chamado,
 * descontando o tempo em que ficou pausado (status "aguardando_usuario").
 * Ver seção 5.3 da especificação — o SLA nunca deve punir o técnico
 * por um atraso do usuário.
 */
export function minutosDecorridosEfetivos(chamado: Chamado, agora: Date = new Date()): number {
  const totalMin = (agora.getTime() - chamado.criadoEm.getTime()) / 60000;

  let pausadoMin = chamado.slaTempoPausadoTotalMin;
  if (chamado.slaPausadoDesde) {
    // ainda está pausado agora — soma o tempo em curso da pausa atual
    pausadoMin += (agora.getTime() - chamado.slaPausadoDesde.getTime()) / 60000;
  }

  return Math.max(0, totalMin - pausadoMin);
}

/**
 * Classifica o nível de alerta do SLA com base no % do prazo de resolução
 * já consumido. Níveis definidos na seção 5.3: 70% (atenção), 90% (alerta),
 * 100%+ (crítico/estourado).
 */
export function calcularNivelSla(
  chamado: Chamado,
  politica: Pick<SlaPolitica, 'tempoResolucaoMin'>,
  agora: Date = new Date()
): NivelSla {
  if (chamado.status === 'RESOLVIDO' || chamado.status === 'FECHADO') {
    // usa o valor histórico gravado no momento da resolução, não recalcula
    return chamado.slaEstourado ? 'critico' : 'ok';
  }

  const decorrido = minutosDecorridosEfetivos(chamado, agora);
  const pct = decorrido / politica.tempoResolucaoMin;

  if (pct >= 1) return 'critico';
  if (pct >= 0.9) return 'alerta';
  if (pct >= 0.7) return 'atencao';
  return 'ok';
}

/**
 * Chamar ao marcar o chamado como RESOLVIDO: grava o resultado final
 * do SLA de forma imutável para fins de relatório (seção 5.3 e 8.4).
 */
export function fecharSlaNaResolucao(
  chamado: Chamado,
  politica: Pick<SlaPolitica, 'tempoResolucaoMin'>,
  agora: Date = new Date()
): { slaEstourado: boolean } {
  const decorrido = minutosDecorridosEfetivos(chamado, agora);
  return { slaEstourado: decorrido > politica.tempoResolucaoMin };
}
