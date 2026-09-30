import { prisma } from '@/lib/prisma';

// TODO: implementar sessão real do técnico e os filtros "Minha fila / Fila do
// grupo / Resolvidos" validados no protótipo navegável.
export default async function FilaTecnicoPage() {
  const chamados = await prisma.chamado.findMany({
    where: { status: { in: ['ABERTO', 'EM_ATENDIMENTO', 'AGUARDANDO_USUARIO'] } },
    include: { empresa: true, classificacao: true, tecnico: true },
    orderBy: { criadoEm: 'asc' },
  });

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">Fila de chamados</h1>
      <div className="border rounded-xl divide-y">
        {chamados.map((c: (typeof chamados)[number]) => (
          <div key={c.id} className="flex justify-between p-4 text-sm">
            <div>
              <p className="font-medium">{c.resumo}</p>
              <p className="text-neutral-500">{c.empresa.nome} · {c.classificacao.nome}</p>
            </div>
            <span className="text-neutral-500">{c.tecnico ? c.tecnico.nome : 'Não atribuído'}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
