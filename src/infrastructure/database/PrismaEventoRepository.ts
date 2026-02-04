import type { IEventoRepository } from "../../domain/repositories/IEventoRepository.js";
import { Evento, StatusEvento } from "../../domain/entities/Evento.js";
import { NivelRisco } from "../../domain/value-objects/NivelRisco.js";
import { PrismaClient } from "@prisma/client";

export class PrismaEventoRepository implements IEventoRepository {
  private readonly prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  public async listarPorCrianca(
    criancaId: string,
    periodo?: { inicio?: Date; fim?: Date },
  ): Promise<Evento[]> {
    const where: any = { criancaId };

    if (periodo?.inicio || periodo?.fim) {
      where.dataHoraInicio = {};
      if (periodo.inicio) {
        where.dataHoraInicio.gte = periodo.inicio;
      }
      if (periodo.fim) {
        where.dataHoraInicio.lte = periodo.fim;
      }
    }

    const eventosDb = await this.prisma.evento.findMany({
      where,
      orderBy: { dataHoraInicio: "asc" },
    });

    return eventosDb.map((evt) => this.mapToDomain(evt));
  }

  public async buscarPorId(id: string): Promise<Evento | null> {
    const eventoDb = await this.prisma.evento.findUnique({
      where: { id },
    });

    if (!eventoDb) {
      return null;
    }

    return this.mapToDomain(eventoDb);
  }

  public async salvar(evento: Evento): Promise<void> {
    const data = {
      criancaId: evento.criancaId,
      titulo: evento.titulo,
      dataHoraInicio: evento.dataHoraInicio,
      dataHoraFim: evento.dataHoraFim,
      nivelRisco: evento.nivelRisco.nivel,
      status: evento.status,
      updatedAt: new Date(),
    };

    const existente = await this.prisma.evento.findUnique({
      where: { id: evento.id },
    });

    if (existente) {
      await this.prisma.evento.update({
        where: { id: evento.id },
        data,
      });
    } else {
      await this.prisma.evento.create({
        data: {
          ...data,
          id: evento.id,
        },
      });
    }
  }

  public async excluir(id: string): Promise<void> {
    await this.prisma.evento.delete({
      where: { id },
    });
  }

  private mapToDomain(eventoDb: any): Evento {
    return Evento.reconstitute(
      eventoDb.id,
      eventoDb.criancaId,
      eventoDb.titulo,
      new Date(eventoDb.dataHoraInicio),
      new Date(eventoDb.dataHoraFim),
      NivelRisco.fromString(eventoDb.nivelRisco),
      eventoDb.status as StatusEvento,
    );
  }
}
