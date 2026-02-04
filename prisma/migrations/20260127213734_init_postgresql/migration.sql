-- CreateTable
CREATE TABLE "Usuario" (
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
CREATE TABLE "Escola" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Escola_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crianca" (
    "id" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "grauTEA" TEXT NOT NULL,
    "grauSuporte" TEXT NOT NULL,
    "escolaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crianca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CriancaResponsavel" (
    "id" TEXT NOT NULL,
    "criancaId" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CriancaResponsavel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
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
CREATE TABLE "AmbienteEscolar" (
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
CREATE TABLE "RegistroCrise" (
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
CREATE TABLE "PedidoSuporte" (
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
CREATE TABLE "Intervencao" (
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
CREATE TABLE "PersonalizacaoSensorial" (
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
