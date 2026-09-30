import { prisma } from './prisma';

/**
 * Round-robin ponderado por carga (seção 5.2 da especificação):
 * atribui o chamado ao técnico DISPONÍVEL do grupo responsável que
 * estiver com o MENOR número de chamados em aberto no momento.
 *
 * Retorna o id do técnico escolhido, ou null se ninguém do grupo
 * estiver disponível (o chamado fica na fila do grupo sem dono).
 */
export async function escolherTecnicoParaChamado(grupoId: string): Promise<string | null> {
  const tecnicosDoGrupo = await prisma.tecnico.findMany({
    where: {
      status: 'ATIVO',
      disponivel: true,
      grupos: { some: { grupoId } },
    },
    select: { id: true },
  });

  if (tecnicosDoGrupo.length === 0) return null;

  // Conta chamados em aberto (não resolvidos/fechados) por técnico candidato.
  const cargas = await Promise.all(
    tecnicosDoGrupo.map(async (t: { id: string }) => {
      const totalAberto = await prisma.chamado.count({
        where: {
          tecnicoId: t.id,
          status: { in: ['ABERTO', 'EM_ATENDIMENTO', 'AGUARDANDO_USUARIO'] },
        },
      });
      return { tecnicoId: t.id, totalAberto };
    })
  );

  cargas.sort((a, b) => a.totalAberto - b.totalAberto);
  return cargas[0].tecnicoId;
}
