-- CreateEnum
CREATE TYPE "StatusEmpresa" AS ENUM ('ATIVA', 'INATIVA');

-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('FUNCIONARIO', 'GESTOR');

-- CreateEnum
CREATE TYPE "StatusConta" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "Calendario" AS ENUM ('COMERCIAL', 'H24');

-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "StatusChamado" AS ENUM ('ABERTO', 'EM_ATENDIMENTO', 'AGUARDANDO_USUARIO', 'RESOLVIDO', 'FECHADO');

-- CreateEnum
CREATE TYPE "AutorTipo" AS ENUM ('USUARIO', 'TECNICO', 'SISTEMA');

-- CreateEnum
CREATE TYPE "StatusEnvio" AS ENUM ('SUCESSO', 'FALHA');

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "status" "StatusEmpresa" NOT NULL DEFAULT 'ATIVA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "PapelUsuario" NOT NULL DEFAULT 'FUNCIONARIO',
    "status" "StatusConta" NOT NULL DEFAULT 'ATIVO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tecnico" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "status" "StatusConta" NOT NULL DEFAULT 'ATIVO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tecnico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grupo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TecnicoGrupo" (
    "tecnicoId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,

    CONSTRAINT "TecnicoGrupo_pkey" PRIMARY KEY ("tecnicoId","grupoId")
);

-- CreateTable
CREATE TABLE "Classificacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,

    CONSTRAINT "Classificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlaPolitica" (
    "id" TEXT NOT NULL,
    "classificacaoId" TEXT NOT NULL,
    "tempoPrimeiraRespostaMin" INTEGER NOT NULL,
    "tempoResolucaoMin" INTEGER NOT NULL,
    "calendario" "Calendario" NOT NULL DEFAULT 'COMERCIAL',

    CONSTRAINT "SlaPolitica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chamado" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "empresaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "classificacaoId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "tecnicoId" TEXT,
    "identificadorMaquina" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "telefoneContato" TEXT NOT NULL,
    "prioridade" "Prioridade" NOT NULL DEFAULT 'MEDIA',
    "status" "StatusChamado" NOT NULL DEFAULT 'ABERTO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "resolvidoEm" TIMESTAMP(3),
    "slaPrimeiraRespostaEm" TIMESTAMP(3),
    "slaPausadoDesde" TIMESTAMP(3),
    "slaTempoPausadoTotalMin" INTEGER NOT NULL DEFAULT 0,
    "slaEstourado" BOOLEAN,

    CONSTRAINT "Chamado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensagem" (
    "id" TEXT NOT NULL,
    "chamadoId" TEXT NOT NULL,
    "autorTipo" "AutorTipo" NOT NULL,
    "usuarioId" TEXT,
    "tecnicoId" TEXT,
    "mensagem" TEXT NOT NULL,
    "anexoUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogNotificacao" (
    "id" TEXT NOT NULL,
    "chamadoId" TEXT NOT NULL,
    "destinatario" TEXT NOT NULL,
    "tipoEvento" TEXT NOT NULL,
    "enviadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusEnvio" "StatusEnvio" NOT NULL,

    CONSTRAINT "LogNotificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_cnpj_key" ON "Empresa"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tecnico_email_key" ON "Tecnico"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Grupo_nome_key" ON "Grupo"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "SlaPolitica_classificacaoId_key" ON "SlaPolitica"("classificacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "Chamado_numero_key" ON "Chamado"("numero");

-- CreateIndex
CREATE INDEX "Chamado_empresaId_idx" ON "Chamado"("empresaId");

-- CreateIndex
CREATE INDEX "Chamado_grupoId_status_idx" ON "Chamado"("grupoId", "status");

-- CreateIndex
CREATE INDEX "Chamado_tecnicoId_status_idx" ON "Chamado"("tecnicoId", "status");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TecnicoGrupo" ADD CONSTRAINT "TecnicoGrupo_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Tecnico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TecnicoGrupo" ADD CONSTRAINT "TecnicoGrupo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classificacao" ADD CONSTRAINT "Classificacao_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlaPolitica" ADD CONSTRAINT "SlaPolitica_classificacaoId_fkey" FOREIGN KEY ("classificacaoId") REFERENCES "Classificacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_classificacaoId_fkey" FOREIGN KEY ("classificacaoId") REFERENCES "Classificacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Tecnico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_chamadoId_fkey" FOREIGN KEY ("chamadoId") REFERENCES "Chamado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Tecnico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogNotificacao" ADD CONSTRAINT "LogNotificacao_chamadoId_fkey" FOREIGN KEY ("chamadoId") REFERENCES "Chamado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
