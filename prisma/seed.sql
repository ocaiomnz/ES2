DROP TABLE IF EXISTS "PersonalizacaoSensorial" CASCADE;
DROP TABLE IF EXISTS "Intervencao" CASCADE;
DROP TABLE IF EXISTS "PedidoSuporte" CASCADE;
DROP TABLE IF EXISTS "RegistroCrise" CASCADE;
DROP TABLE IF EXISTS "AmbienteEscolar" CASCADE;
DROP TABLE IF EXISTS "Evento" CASCADE;
DROP TABLE IF EXISTS "CriancaResponsavel" CASCADE;
DROP TABLE IF EXISTS "Crianca" CASCADE;
DROP TABLE IF EXISTS "Usuario" CASCADE;
DROP TABLE IF EXISTS "Escola" CASCADE;

-- CreateTable
CREATE TABLE IF NOT EXISTS  "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "tipoPerfil" TEXT NOT NULL,
    "escolaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Escola" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Escola_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Crianca" (
    "id" TEXT NOT NULL,
    "nome" TEXT,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "grauTEA" TEXT NOT NULL,
    "grauSuporte" TEXT NOT NULL,
    "escolaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crianca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CriancaResponsavel" (
    "id" TEXT NOT NULL,
    "criancaId" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CriancaResponsavel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Evento" (
    "id" TEXT NOT NULL,
    "criancaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "dataHoraInicio" TIMESTAMP(3) NOT NULL,
    "dataHoraFim" TIMESTAMP(3) NOT NULL,
    "nivelRisco" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AmbienteEscolar" (
    "id" TEXT NOT NULL,
    "escolaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "midias" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmbienteEscolar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "RegistroCrise" (
    "id" TEXT NOT NULL,
    "criancaId" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "intensidade" TEXT NOT NULL,
    "descricao" TEXT,
    "gatilhoIdentificado" TEXT,
    "foiEficaz" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroCrise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PedidoSuporte" (
    "id" TEXT NOT NULL,
    "criancaId" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "registroCriseId" TEXT,
    "localizacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PedidoSuporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Intervencao" (
    "id" TEXT NOT NULL,
    "criancaId" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "estrategia" TEXT NOT NULL,
    "aplicadaPor" TEXT NOT NULL,
    "resultado" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intervencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PersonalizacaoSensorial" (
    "id" TEXT NOT NULL,
    "criancaId" TEXT NOT NULL,
    "paletaCores" TEXT,
    "tamanhoFonte" TEXT NOT NULL DEFAULT 'MEDIO',
    "icones" TEXT,
    "sons" BOOLEAN NOT NULL DEFAULT false,
    "animacoes" BOOLEAN NOT NULL DEFAULT false,
    "contrasteAlto" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalizacaoSensorial_pkey" PRIMARY KEY ("id")
);

DROP INDEX IF EXISTS "Usuario_email_key";
DROP INDEX IF EXISTS "CriancaResponsavel_criancaId_responsavelId_key";
DROP INDEX IF EXISTS "PedidoSuporte_registroCriseId_key";
DROP INDEX IF EXISTS "PersonalizacaoSensorial_criancaId_key";


-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CriancaResponsavel_criancaId_responsavelId_key" ON "CriancaResponsavel"("criancaId", "responsavelId");

-- CreateIndex
CREATE UNIQUE INDEX "PedidoSuporte_registroCriseId_key" ON "PedidoSuporte"("registroCriseId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalizacaoSensorial_criancaId_key" ON "PersonalizacaoSensorial"("criancaId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crianca" ADD CONSTRAINT "Crianca_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriancaResponsavel" ADD CONSTRAINT "CriancaResponsavel_criancaId_fkey" FOREIGN KEY ("criancaId") REFERENCES "Crianca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriancaResponsavel" ADD CONSTRAINT "CriancaResponsavel_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_criancaId_fkey" FOREIGN KEY ("criancaId") REFERENCES "Crianca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbienteEscolar" ADD CONSTRAINT "AmbienteEscolar_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCrise" ADD CONSTRAINT "RegistroCrise_criancaId_fkey" FOREIGN KEY ("criancaId") REFERENCES "Crianca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoSuporte" ADD CONSTRAINT "PedidoSuporte_criancaId_fkey" FOREIGN KEY ("criancaId") REFERENCES "Crianca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoSuporte" ADD CONSTRAINT "PedidoSuporte_registroCriseId_fkey" FOREIGN KEY ("registroCriseId") REFERENCES "RegistroCrise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervencao" ADD CONSTRAINT "Intervencao_criancaId_fkey" FOREIGN KEY ("criancaId") REFERENCES "Crianca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizacaoSensorial" ADD CONSTRAINT "PersonalizacaoSensorial_criancaId_fkey" FOREIGN KEY ("criancaId") REFERENCES "Crianca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========== DADOS DE TESTE ==========
-- Senha para todos os usuários: senha123
-- IMPORTANTE: Não inserir PedidoSuporte sem RegistroCrise com foiEficaz NULL (invariante AgregadoCrianca)

INSERT INTO "Escola" ("id", "nome", "endereco", "createdAt", "updatedAt") VALUES
  ('11111111-1111-1111-1111-111111111111', 'Escola Modelo SAPEA', 'Rua Exemplo, 100', NOW(), NOW());

INSERT INTO "Usuario" ("id", "nome", "email", "senhaHash", "tipoPerfil", "escolaId", "createdAt", "updatedAt") VALUES
  ('22222222-2222-2222-2222-222222222201', 'Maria Professora', 'prof@escola.com', '$2b$10$yjlPQw0YagpTeFwi2rvuge0piUbBIUj4nJRND4Xrv3ENbEwsu.Gme', 'EQUIPE_ESCOLAR', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222202', 'João Responsável', 'responsavel@email.com', '$2b$10$yjlPQw0YagpTeFwi2rvuge0piUbBIUj4nJRND4Xrv3ENbEwsu.Gme', 'RESPONSAVEL', NULL, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222203', 'Admin Sistema', 'admin@sapea.com', '$2b$10$yjlPQw0YagpTeFwi2rvuge0piUbBIUj4nJRND4Xrv3ENbEwsu.Gme', 'ADMIN', NULL, NOW(), NOW());

INSERT INTO "Crianca" ("id", "nome", "dataNascimento", "grauTEA", "grauSuporte", "escolaId", "createdAt", "updatedAt") VALUES
  ('33333333-3333-3333-3333-333333333301', 'Lucas', '2015-05-10 00:00:00', 'LEVE', 'NIVEL_1', '11111111-1111-1111-1111-111111111111', NOW(), NOW());

INSERT INTO "CriancaResponsavel" ("id", "criancaId", "responsavelId") VALUES
  ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222202');

INSERT INTO "AmbienteEscolar" ("id", "escolaId", "nome", "descricao", "midias", "createdAt", "updatedAt") VALUES
  ('55555555-5555-5555-5555-555555555501', '11111111-1111-1111-1111-111111111111', 'Sala de Aula', 'Ambiente principal de estudos', NULL, NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555502', '11111111-1111-1111-1111-111111111111', 'Refeitório', 'Onde os alunos fazem as refeições', NULL, NOW(), NOW());

INSERT INTO "Evento" ("id", "criancaId", "titulo", "dataHoraInicio", "dataHoraFim", "nivelRisco", "status", "descricao", "createdAt", "updatedAt") VALUES
  ('66666666-6666-6666-6666-666666666601', '33333333-3333-3333-3333-333333333301', 'Aula de Português', (CURRENT_DATE + INTERVAL '8 hours'), (CURRENT_DATE + INTERVAL '9 hours'), 'VERDE', 'PENDENTE', NULL, NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666602', '33333333-3333-3333-3333-333333333301', 'Lanche', (CURRENT_DATE + INTERVAL '10 hours 30 minutes'), (CURRENT_DATE + INTERVAL '11 hours'), 'VERDE', 'PENDENTE', NULL, NOW(), NOW());

-- RegistroCrise com foiEficaz=TRUE (resolvida) - OK para invariante. Nenhum PedidoSuporte órfão.
INSERT INTO "RegistroCrise" ("id", "criancaId", "dataHora", "intensidade", "descricao", "gatilhoIdentificado", "foiEficaz", "createdAt", "updatedAt") VALUES
  ('77777777-7777-7777-7777-777777777701', '33333333-3333-3333-3333-333333333301', (CURRENT_DATE - INTERVAL '2 days'), 'MEDIA', 'Episódio de ansiedade', 'Mudança de rotina', TRUE, NOW(), NOW());
