import { AgregadoCrianca } from "../../../domain/aggregates/AgregadoCrianca.js";
import { Crianca } from "../../../domain/entities/Crianca.js";
import { RegistroCrise } from "../../../domain/entities/RegistroCrise.js";
import { PedidoSuporte } from "../../../domain/entities/PedidoSuporte.js";
import { Intervencao } from "../../../domain/entities/Intervencao.js";
import {
  DataNascimento,
  GrauTEA,
  GrauSuporte,
  IntensidadeDaCrise,
  StatusAtendimento,
} from "../../../domain/value-objects/index.js";

export type PersistedAgregadoCrianca = {
  crianca: {
    id?: string | undefined;
    dataNascimento: string; // ISO
    grauTEA: string;
    grauSuporte: string;
    escolaId?: string | undefined;
    responsavelIds?: string[];
  };
  crises?: {
    id?: string | undefined;
    dataHora: string; // ISO
    intensidade: string;
    descricao?: string | undefined;
    gatilhoIdentificado?: string | undefined;
    foiEficaz?: boolean | undefined;
  }[];
  pedidosSuporte?: {
    id?: string | undefined;
    dataHora: string; // ISO
    status: string;
    registroCrise: {
      id?: string | undefined;
      dataHora: string; // ISO
      intensidade: string;
      descricao?: string | undefined;
      gatilhoIdentificado?: string | undefined;
      foiEficaz?: boolean | undefined;
    };
  }[];
  intervencoes?: {
    id?: string | undefined;
    dataHora: string; // ISO
    estrategia: string;
    aplicadaPor: string;
    resultado?: string | undefined;
  }[];
};

export function desserializarAgregadoCrianca(
  persisted: PersistedAgregadoCrianca,
): AgregadoCrianca {
  const criancaData: any = {
    id: persisted.crianca.id,
    dataNascimento: persisted.crianca.dataNascimento,
    grauTEA: persisted.crianca.grauTEA,
    grauSuporte: persisted.crianca.grauSuporte,
  };

  if (persisted.crianca.escolaId) {
    criancaData.escolaId = persisted.crianca.escolaId;
  }

  if (persisted.crianca.responsavelIds) {
    criancaData.responsavelIds = persisted.crianca.responsavelIds;
  }

  const crianca = Crianca.fromPersistence(criancaData);

  const crises = (persisted.crises ?? []).map((c) =>
    RegistroCrise.fromPersistence(c),
  );

  const pedidos = (persisted.pedidosSuporte ?? []).map((p) =>
    PedidoSuporte.fromPersistence(p),
  );

  const intervencoes = (persisted.intervencoes ?? []).map((i) =>
    Intervencao.fromPersistence(i),
  );

  return AgregadoCrianca.fromPersistence({
    crianca,
    crises,
    pedidosSuporte: pedidos,
    intervencoes,
  });
}

export function serializarAgregadoCrianca(
  agregado: AgregadoCrianca,
): PersistedAgregadoCrianca {
  const crianca = agregado.crianca;

  const criancaData: any = {
    id: crianca.id,
    dataNascimento: crianca.dataNascimento.data.toISOString(),
    grauTEA: crianca.grauTEA.grau,
    grauSuporte: crianca.grauSuporte.grau,
  };

  if (crianca.escolaId) {
    criancaData.escolaId = crianca.escolaId;
  }

  if (crianca.responsavelIds && crianca.responsavelIds.length > 0) {
    criancaData.responsavelIds = [...crianca.responsavelIds];
  }

  return {
    crianca: criancaData,
    crises: agregado.crises.map((c) => ({
      id: c.id,
      dataHora: c.dataHora.toISOString(),
      intensidade: c.intensidade.intensidade,
      descricao: c.descricao ?? undefined,
      gatilhoIdentificado: c.gatilhoIdentificado ?? undefined,
      foiEficaz: c.foiEficaz ?? undefined,
    })),
    pedidosSuporte: agregado.pedidosSuporte.map((p) => ({
      id: p.id,
      dataHora: p.dataHora.toISOString(),
      status: p.status.status,
      registroCrise: {
        id: p.registroCrise.id,
        dataHora: p.registroCrise.dataHora.toISOString(),
        intensidade: p.registroCrise.intensidade.intensidade,
        descricao: p.registroCrise.descricao ?? undefined,
        gatilhoIdentificado: p.registroCrise.gatilhoIdentificado ?? undefined,
        foiEficaz: p.registroCrise.foiEficaz ?? undefined,
      },
    })),
    intervencoes: agregado.intervencoes.map((i) => ({
      id: i.id,
      dataHora: i.dataHora.toISOString(),
      estrategia: i.estrategia,
      aplicadaPor: i.aplicadaPor,
      resultado: i.resultado ?? undefined,
    })),
  };
}
