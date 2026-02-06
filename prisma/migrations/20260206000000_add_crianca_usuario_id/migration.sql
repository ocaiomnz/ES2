-- AlterTable
ALTER TABLE "Crianca" ADD COLUMN "usuarioId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Crianca_usuarioId_key" ON "Crianca"("usuarioId");

-- AddForeignKey
ALTER TABLE "Crianca" ADD CONSTRAINT "Crianca_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
