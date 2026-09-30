import { prisma } from '@/lib/prisma';
import Link from 'next/link';

// TODO: trocar dados mockados de sessão por auth() real (NextAuth).
// TODO: portar o visual validado no protótipo (pills de status/SLA, tabela)
// para componentes reutilizáveis em src/components/.
export default async function MeusChamadosPage() {
  const usuarioDemo = await prisma.usuario.findFirst();
  if (!usuarioDemo) {
    return <p className="p-8">Nenhum usuário cadastrado ainda — rode o seed (`npm run prisma:seed`).</p>;
  }

  const where =
    usuarioDemo.papel === 'GESTOR'
      ? { empresaId: usuarioDemo.empresaId }
      : { usuarioId: usuarioDemo.id };

  const chamados = await prisma.chamado.findMany({
    where,
    include: { classificacao: true, tecnico: true },
    orderBy: { criadoEm: 'desc' },
  });

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Meus chamados</h1>
        <Link href="/usuario/chamados/novo" className="px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm font-semibold">
          + Novo chamado
        </Link>
      </div>
      <div className="border rounded-xl divide-y">
        {chamados.length === 0 && <p className="p-6 text-neutral-500 text-sm">Nenhum chamado por aqui ainda.</p>}
        {chamados.map((c: (typeof chamados)[number]) => (
          <Link key={c.id} href={`/usuario/chamados/${c.id}`} className="flex justify-between p-4 hover:bg-neutral-50 text-sm">
            <span className="font-medium">{c.resumo}</span>
            <span className="text-neutral-500">{c.status}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
