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
├── public/              # Arquivos estáticos (HTML, JS, CSS)
└── server.ts            # Ponto de entrada da aplicação
prisma/
├── schema.prisma        # Modelo do banco de dados
└── migrations/          # Migrações do Prisma
```

## Scripts

- `npm run dev` — Inicia o servidor em modo desenvolvimento com recarregamento automático.
- `npx prisma migrate dev` — Executa as migrações do banco de dados.
- `npx prisma studio` — Interface visual para o banco de dados.

## Observações

- As rotas e casos de uso estão organizados por domínio e responsabilidade.
- O projeto utiliza TypeScript, Express, Prisma ORM e JWT para autenticação.
- Para detalhes de cada endpoint, consulte as rotas em `src/infrastructure/http/routes/`.
