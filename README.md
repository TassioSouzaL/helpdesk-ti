# HelpDesk TI — Projeto Base

Estrutura inicial gerada a partir do documento **Especificação Técnica — Plataforma
de Chamados de TI (v1.1)** e do protótipo navegável validado anteriormente.

## Stack

Next.js (App Router + TypeScript) · PostgreSQL via Prisma · Tailwind CSS · Resend (e-mail)

## O que já está implementado

- **`prisma/schema.prisma`** — modelo de dados completo: Empresa, Usuário (com papel
  funcionário/gestor), Técnico, Grupo, Classificação, Política de SLA, Chamado,
  Mensagem e Log de Notificação.
- **`src/lib/distribuicao.ts`** — round-robin ponderado por carga (atribui ao técnico
  disponível com menos chamados em aberto).
- **`src/lib/sla.ts`** — cálculo de SLA com pausa automática em "aguardando usuário" e
  gravação do resultado como histórico imutável na resolução.
- **`src/lib/email.ts`** — envio de notificação + log de auditoria de entrega.
- **API routes**: criar/listar chamados (com roteamento automático por classificação),
  trocar status (com lógica de SLA embutida), adicionar mensagem ao chat do chamado.
- **Páginas iniciais**: lista de chamados do usuário, fila do técnico, lista de
  empresas no admin — como ponto de partida para portar o visual do protótipo.
- **`prisma/seed.ts`** — dados de exemplo iguais aos usados no protótipo.

## O que falta implementar (próximos passos)

1. **Autenticação real** — este projeto ainda usa dados "demo" fixos nas páginas.
   Configurar NextAuth/Auth.js com login por e-mail/senha para usuário, técnico e admin.
2. **Portar o visual do protótipo** — as páginas atuais são funcionais, mas simples.
   Recriar os componentes visuais (pills de status/SLA, chat, tabelas) validados no
   protótipo navegável como componentes React reutilizáveis em `src/components/`.
3. **Formulário de novo chamado** (`/usuario/chamados/novo`) — falta a página, a API já existe.
4. **Tela de detalhe do chamado com chat** — falta a página, a API já existe.
5. **Páginas de cadastro do admin** (usuários, técnicos, grupos, classificações, SLA).
6. **Upload de anexos** — decidir provedor de storage (Supabase Storage, S3) e plugar
   no campo `anexoUrl` de `Mensagem`.
7. **Dashboard de métricas (fase 2)** — só depois do MVP estar estável.

## Como rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# edite DATABASE_URL com sua conexão PostgreSQL (ex: Supabase)

# 3. Criar as tabelas no banco
npm run prisma:migrate

# 4. Popular com dados de exemplo
npm run prisma:seed

# 5. Rodar o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

## Hospedagem sugerida

- **Vercel** para o Next.js (deploy automático via GitHub)
- **Supabase** para o PostgreSQL (e também storage de anexos, se optar por ele)
- **Resend** para o envio de e-mails transacionais
