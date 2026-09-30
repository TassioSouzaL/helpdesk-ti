import Link from 'next/link';

// TODO: substituir por redirect automático baseado na sessão (usuário → /usuario,
// técnico → /tecnico, admin → /admin). Por ora, um hub simples para navegação manual.
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">HelpDesk TI</h1>
        <p className="text-neutral-500">Escolha uma área para continuar (login ainda não implementado):</p>
        <div className="flex gap-3 justify-center">
          <Link href="/usuario/chamados" className="px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm font-semibold">
            Área do usuário
          </Link>
          <Link href="/tecnico/fila" className="px-4 py-2 rounded-lg border text-sm font-semibold">
            Área do técnico
          </Link>
          <Link href="/admin/empresas" className="px-4 py-2 rounded-lg border text-sm font-semibold">
            Área do admin
          </Link>
        </div>
      </div>
    </main>
  );
}
