import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('senha123', 10);

  const [redes, software, so] = await Promise.all([
    prisma.grupo.create({ data: { nome: 'Redes' } }),
    prisma.grupo.create({ data: { nome: 'Software' } }),
    prisma.grupo.create({ data: { nome: 'Sistema Operacional' } }),
  ]);

  const classFalhaConexao = await prisma.classificacao.create({
    data: { nome: 'Falha de conexão / Internet', grupoId: redes.id },
  });
  await prisma.classificacao.create({ data: { nome: 'Impressora em rede', grupoId: redes.id } });
  await prisma.classificacao.create({ data: { nome: 'Erro em sistema interno', grupoId: software.id } });
  await prisma.classificacao.create({ data: { nome: 'Instalação de programa', grupoId: software.id } });
  await prisma.classificacao.create({ data: { nome: 'Computador não liga', grupoId: so.id } });
  await prisma.classificacao.create({ data: { nome: 'Lentidão / travamento', grupoId: so.id } });

  await prisma.slaPolitica.create({
    data: { classificacaoId: classFalhaConexao.id, tempoPrimeiraRespostaMin: 30, tempoResolucaoMin: 480 },
  });

  const empresa = await prisma.empresa.create({
    data: { nome: 'Comércio Silva Ltda', cnpj: '11.111.111/0001-11' },
  });

  const ana = await prisma.usuario.create({
    data: { empresaId: empresa.id, nome: 'Ana Torres', email: 'ana@comerciosilva.com', telefone: '(84) 99123-4501', senhaHash, papel: 'FUNCIONARIO' },
  });
  await prisma.usuario.create({
    data: { empresaId: empresa.id, nome: 'Carlos Mendes', email: 'carlos@comerciosilva.com', telefone: '(84) 99123-4502', senhaHash, papel: 'GESTOR' },
  });

  const bruno = await prisma.tecnico.create({
    data: { nome: 'Bruno Lima', email: 'bruno@helpdesk.com', senhaHash, grupos: { create: [{ grupoId: redes.id }] } },
  });

  await prisma.chamado.create({
    data: {
      empresaId: empresa.id,
      usuarioId: ana.id,
      classificacaoId: classFalhaConexao.id,
      grupoId: redes.id,
      tecnicoId: bruno.id,
      identificadorMaquina: 'RECEP-04',
      resumo: 'Internet caindo a cada 10 minutos na recepção.',
      telefoneContato: '(84) 99123-4501',
      prioridade: 'ALTA',
      status: 'EM_ATENDIMENTO',
      mensagens: {
        create: [
          { autorTipo: 'USUARIO', usuarioId: ana.id, mensagem: 'A internet aqui da recepção está caindo direto.' },
          { autorTipo: 'TECNICO', tecnicoId: bruno.id, mensagem: 'Vou verificar o link com a operadora.' },
        ],
      },
    },
  });

  console.log('Seed concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
