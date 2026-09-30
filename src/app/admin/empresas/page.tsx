import { prisma } from '@/lib/prisma';

// TODO: formulário de cadastro (o protótipo mostra o botão "+ Nova empresa";
// aqui falta o form + server action de criação).
export default async function EmpresasPage() {
  const empresas = await prisma.empresa.findMany({
    include: { _count: { select: { usuarios: true, chamados: true } } },
  });

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">Empresas</h1>
      <table className="w-full text-sm border rounded-xl overflow-hidden">
        <thead className="bg-neutral-100 text-left">
          <tr>
            <th className="p-3">Empresa</th>
            <th className="p-3">Funcionários</th>
            <th className="p-3">Chamados</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map((e: (typeof empresas)[number]) => (
            <tr key={e.id} className="border-t">
              <td className="p-3 font-medium">{e.nome}</td>
              <td className="p-3">{e._count.usuarios}</td>
              <td className="p-3">{e._count.chamados}</td>
              <td className="p-3">{e.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
