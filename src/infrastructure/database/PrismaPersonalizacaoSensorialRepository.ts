import type { IPersonalizacaoSensorialRepository } from "../../domain/repositories/IPersonalizacaoSensorialRepository.js";
import { PersonalizacaoSensorial, TamanhoFonte } from "../../domain/entities/PersonalizacaoSensorial.js";
import { PrismaClient } from "@prisma/client";

export class PrismaPersonalizacaoSensorialRepository implements IPersonalizacaoSensorialRepository {
  private readonly prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  public async buscarPorCrianca(criancaId: string): Promise<PersonalizacaoSensorial | null> {
    const personalizacaoDb = await this.prisma.personalizacaoSensorial.findUnique({
      where: { criancaId },
    });

    if (!personalizacaoDb) {
      return null;
    }

    return this.mapToDomain(personalizacaoDb);
  }

  public async salvar(personalizacao: PersonalizacaoSensorial): Promise<void> {
    const data: any = {
      paletaCores: personalizacao.paletaCores ?? null,
      tamanhoFonte: personalizacao.tamanhoFonte,
      icones: personalizacao.icones ?? null,
      sons: personalizacao.sons,
      animacoes: personalizacao.animacoes,
      contrasteAlto: personalizacao.contrasteAlto,
      updatedAt: new Date(),
    };

    const existente = await this.prisma.personalizacaoSensorial.findUnique({
      where: { criancaId: personalizacao.criancaId },
    });

    if (existente) {
      await this.prisma.personalizacaoSensorial.update({
        where: { criancaId: personalizacao.criancaId },
        data,
      });
    } else {
      await this.prisma.personalizacaoSensorial.create({
        data: {
          id: personalizacao.id,
          criancaId: personalizacao.criancaId,
          ...data,
        },
      });
    }
  }

  public async excluir(criancaId: string): Promise<void> {
    await this.prisma.personalizacaoSensorial.delete({
      where: { criancaId },
    });
  }

  private mapToDomain(personalizacaoDb: any): PersonalizacaoSensorial {
    return PersonalizacaoSensorial.reconstitute(
      personalizacaoDb.id,
      personalizacaoDb.criancaId,
      personalizacaoDb.tamanhoFonte as TamanhoFonte,
      personalizacaoDb.paletaCores || undefined,
      personalizacaoDb.icones || undefined,
      personalizacaoDb.sons,
      personalizacaoDb.animacoes,
      personalizacaoDb.contrasteAlto,
    );
  }
}
