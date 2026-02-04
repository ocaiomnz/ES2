import type { IAmbienteEscolarRepository } from "../../domain/repositories/IAmbienteEscolarRepository.js";
import { AmbienteEscolar } from "../../domain/entities/AmbienteEscolar.js";
import { PrismaClient } from "@prisma/client";

export class PrismaAmbienteEscolarRepository
  implements IAmbienteEscolarRepository
{
  private readonly prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  public async listarPorEscola(escolaId: string): Promise<AmbienteEscolar[]> {
    const ambientesDb = await this.prisma.ambienteEscolar.findMany({
      where: { escolaId },
      orderBy: { nome: "asc" },
    });

    return ambientesDb.map((amb) => this.mapToDomain(amb));
  }

  public async buscarPorId(id: string): Promise<AmbienteEscolar | null> {
    const ambienteDb = await this.prisma.ambienteEscolar.findUnique({
      where: { id },
    });

    if (!ambienteDb) {
      return null;
    }

    return this.mapToDomain(ambienteDb);
  }

  public async salvar(ambiente: AmbienteEscolar): Promise<void> {
    const data: any = {
      escolaId: ambiente.escolaId,
      nome: ambiente.nome,
      updatedAt: new Date(),
    };

    if (ambiente.descricao !== undefined) {
      data.descricao = ambiente.descricao;
    }

    if (ambiente.midias !== undefined) {
      data.midias = ambiente.midias.length > 0 ? ambiente.midias.join(",") : null;
    }

    const existente = await this.prisma.ambienteEscolar.findUnique({
      where: { id: ambiente.id },
    });

    if (existente) {
      await this.prisma.ambienteEscolar.update({
        where: { id: ambiente.id },
        data,
      });
    } else {
      await this.prisma.ambienteEscolar.create({
        data: {
          ...data,
          id: ambiente.id,
        },
      });
    }
  }

  public async excluir(id: string): Promise<void> {
    await this.prisma.ambienteEscolar.delete({
      where: { id },
    });
  }

  private mapToDomain(ambienteDb: any): AmbienteEscolar {
    const midias =
      ambienteDb.midias && ambienteDb.midias.trim().length > 0
        ? ambienteDb.midias.split(",")
        : undefined;

    return AmbienteEscolar.reconstitute(
      ambienteDb.id,
      ambienteDb.escolaId,
      ambienteDb.nome,
      ambienteDb.descricao || undefined,
      midias,
    );
  }
}
