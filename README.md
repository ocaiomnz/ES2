# SAPEA

Sistema para gestão de ambientes escolares, suporte e acompanhamento de crianças, com autenticação, controle de usuários, eventos, crises e ambientes.

## Pré-requisitos

- Node.js 18+
- npm
- Banco de dados PostgreSQL (configurado via Prisma)

## Preparação do Ambiente

1. Clone o repositório:

```bash
git clone https://github.com/ocaiomnz/ES2.git
cd ES2
```

2. Instale as dependências:

```bash
npm install
```

3. Setup do banco:

```bash
npx prisma generate
npx prisma migrate dev
```

4. Rodar

```bash
npm run dev
```

## Estrutura do Projeto

```
src/
├── application/         # Casos de uso (use-cases) e DTOs
│   ├── use-cases/
│   └── dtos/
├── domain/              # Entidades, agregados, repositórios e value objects
│   ├── entities/
│   ├── aggregates/
│   ├── repositories/
│   └── value-objects/
├── infrastructure/      # Banco de dados (Prisma), rotas HTTP, middlewares, segurança
│   ├── database/
│   ├── http/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── routes/
│   └── security/
├── public/              # Frontend
│   ├── index.html       # SPA principal (todas as telas)
│   ├── pages/           # Páginas individuais (login, telacrianca, etc.)
│   ├── javascripts/     # main.js, api.js
│   └── stylesheets/     # design-system.css, main.css
└── server.ts            # Ponto de entrada da aplicação
prisma/
├── schema.prisma        # Modelo do banco de dados
└── migrations/          # Migrações do Prisma
```

## Scripts

- `npm run dev` — Inicia o servidor em modo desenvolvimento com recarregamento automático.
- `npx prisma migrate dev` — Executa as migrações do banco de dados.
- `npm run db:seed` — Aplica a seed de teste (esquema + dados mínimos).
- `npm run db:seed-dados-atual` — Aplica a seed com todos os dados atuais do banco (use em outra máquina após `migrate deploy`).
- `npx prisma studio` — Interface visual para o banco de dados.

### Usar banco com dados atuais em outra máquina

1. Configure o `DATABASE_URL` no `.env` (PostgreSQL da nova máquina).
2. Aplique as migrações: `npm run db:migrate` (ou `npx prisma migrate deploy`).
3. Carregue os dados: `npm run db:seed-dados-atual`.

O arquivo `prisma/seed-dados-atual.sql` contém apenas INSERTs (sem DROP/CREATE). Use em banco vazio para evitar conflito de chaves primárias.

## Observações

- As rotas e casos de uso estão organizados por domínio e responsabilidade.
- O projeto utiliza TypeScript, Express, Prisma ORM e JWT para autenticação.
- Para detalhes de cada endpoint, consulte as rotas em `src/infrastructure/http/routes/`.
