import type { ICriancaRepository } from "../../domain/repositories/ICriancaRepository.js";
import { AgregadoCrianca } from "../../domain/aggregates/AgregadoCrianca.js";
import {
  serializarAgregadoCrianca,
  desserializarAgregadoCrianca,
} from "./mappers/AgregadoCriancaMapper.js";
import type { PersistedAgregadoCrianca } from "./mappers/AgregadoCriancaMapper.js";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

export class PrismaCriancaRepository implements ICriancaRepository {
  private readonly prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  public async buscarPorId(id: string): Promise<AgregadoCrianca | undefined> {
    const row: any = await this.prisma.crianca
      .findUnique({
        where: { id },
        include: {
          RegistroCrise: true,
          PedidoSuporte: {
            include: {
              RegistroCrise: true,
            },
          },
          Intervencao: true,
          CriancaResponsavel: true,
        },
      })
      .catch(() => undefined);

    if (!row) return undefined;

    return desserializarAgregadoCrianca(this.mapRowToPersisted(row));
  }

 
  public async salvar(agregado: AgregadoCrianca): Promise<void> {
    const p = serializarAgregadoCrianca(agregado);
    const txOperations: any[] = [];


    const criancaData: any = {
      dataNascimento: p.crianca.dataNascimento,
      grauTEA: p.crianca.grauTEA,
      grauSuporte: p.crianca.grauSuporte,
      updatedAt: new Date(),
    };

    if (p.crianca.escolaId) {
      criancaData.escolaId = p.crianca.escolaId;
    }

    if (!p.crianca.id) {
      throw new Error("ID da criança é obrigatório para salvar");
    }

    txOperations.push(
      this.prisma.crianca.upsert({
        where: { id: p.crianca.id },
        create: {
          id: p.crianca.id,
          ...criancaData,
        },
        update: criancaData,
      }),
    );

   txOperations.push(
      this.prisma.criancaResponsavel.deleteMany({
        where: { criancaId: p.crianca.id! },
      }),
    );

    if (p.crianca.responsavelIds && p.crianca.responsavelIds.length > 0) {
      for (const responsavelId of p.crianca.responsavelIds) {
        txOperations.push(
          this.prisma.criancaResponsavel.create({
            data: {
              id: crypto.randomUUID(),
              criancaId: p.crianca.id!,
              responsavelId,
            },
          }),
        );
      }
    }

    txOperations.push(
      this.prisma.registroCrise.deleteMany({
        where: { criancaId: p.crianca.id! },
      }),
    );

    for (const c of p.crises || []) {
      txOperations.push(
        this.prisma.registroCrise.create({
          data: {
            id: c.id!,
            criancaId: p.crianca.id,
            dataHora: c.dataHora,
            intensidade: c.intensidade,
            descricao: c.descricao ?? null,
            gatilhoIdentificado: c.gatilhoIdentificado ?? null,
            foiEficaz: c.foiEficaz ?? null,
            updatedAt: new Date(),
          },
        }),
      );
    }

    txOperations.push(
      this.prisma.pedidoSuporte.deleteMany({
        where: { criancaId: p.crianca.id! },
      }),
    );

    for (const ps of p.pedidosSuporte || []) {
      txOperations.push(
        this.prisma.pedidoSuporte.create({
          data: {
            id: ps.id!,
            criancaId: p.crianca.id,
            dataHora: ps.dataHora,
            status: ps.status,
            registroCriseId: ps.registroCrise.id ?? null,
            updatedAt: new Date(),
          },
        }),
      );
    }

    txOperations.push(
      this.prisma.intervencao.deleteMany({
        where: { criancaId: p.crianca.id! },
      }),
    );

    for (const i of p.intervencoes || []) {
      txOperations.push(
        this.prisma.intervencao.create({
          data: {
            id: i.id!,
            criancaId: p.crianca.id,
            dataHora: i.dataHora,
            estrategia: i.estrategia,
            aplicadaPor: i.aplicadaPor,
            resultado: i.resultado ?? null,
            updatedAt: new Date(),
          },
        }),
      );
    }

    await this.prisma.$transaction(txOperations);
  }

  public async buscarPorFiltro(
    filtro: { nome?: string } = {},
  ): Promise<AgregadoCrianca[]> {
    const rows: any[] = await this.prisma.crianca
      .findMany({
        where: {},
        include: {
          RegistroCrise: true,
          PedidoSuporte: {
            include: {
              RegistroCrise: true,
            },
          },
          Intervencao: true,
          CriancaResponsavel: true,
        },
      })
      .catch(() => []);

    return rows.map((row) =>
      desserializarAgregadoCrianca(this.mapRowToPersisted(row)),
    );
  }

  public async buscarPorEscola(escolaId: string): Promise<AgregadoCrianca[]> {
    const rows: any[] = await this.prisma.crianca
      .findMany({
        where: { escolaId },
        include: {
          RegistroCrise: true,
          PedidoSuporte: {
            include: {
              RegistroCrise: true,
            },
          },
          Intervencao: true,
          CriancaResponsavel: true,
        },
      })
      .catch(() => []);

    return rows.map((row) =>
      desserializarAgregadoCrianca(this.mapRowToPersisted(row)),
    );
  }

  private mapRowToPersisted(row: any): PersistedAgregadoCrianca {
    const responsavelIds = (row.CriancaResponsavel || []).map(
      (cr: any) => cr.responsavelId,
    );

    return {
      crianca: {
        id: row.id,
        dataNascimento:
          row.dataNascimento instanceof Date
            ? row.dataNascimento.toISOString()
            : String(row.dataNascimento),
        grauTEA: row.grauTEA,
        grauSuporte: row.grauSuporte,
        escolaId: row.escolaId || undefined,
        responsavelIds: responsavelIds.length > 0 ? responsavelIds : undefined,
      },
      crises: (row.RegistroCrise || []).map((c: any) => ({
        id: c.id,
        dataHora:
          c.dataHora instanceof Date
            ? c.dataHora.toISOString()
            : String(c.dataHora),
        intensidade: c.intensidade,
        descricao: c.descricao,
        gatilhoIdentificado: c.gatilhoIdentificado,
        foiEficaz: c.foiEficaz,
      })),
      pedidosSuporte: (row.PedidoSuporte || []).map((p: any) => ({
        id: p.id,
        dataHora:
          p.dataHora instanceof Date
            ? p.dataHora.toISOString()
            : String(p.dataHora),
        status: p.status,
        registroCrise: p.RegistroCrise
          ? {
              id: p.RegistroCrise.id,
              dataHora:
                p.RegistroCrise.dataHora instanceof Date
                  ? p.RegistroCrise.dataHora.toISOString()
                  : String(p.RegistroCrise.dataHora),
              intensidade: p.RegistroCrise.intensidade,
              descricao: p.RegistroCrise.descricao,
              gatilhoIdentificado: p.RegistroCrise.gatilhoIdentificado,
              foiEficaz: p.RegistroCrise.foiEficaz,
            }
          : undefined,
      })),
      intervencoes: (row.Intervencao || []).map((i: any) => ({
        id: i.id,
        dataHora:
          i.dataHora instanceof Date
            ? i.dataHora.toISOString()
            : String(i.dataHora),
        estrategia: i.estrategia,
        aplicadaPor: i.aplicadaPor,
        resultado: i.resultado,
      })),
    };
  }

  public async remover(id: string): Promise<void> {
    await this.prisma.crianca.delete({
      where: { id },
    });
  }
}
