import { AgregadoCrianca } from "../aggregates/AgregadoCrianca.js";

export interface ICriancaRepository {
  buscarPorId(id: string): Promise<AgregadoCrianca | undefined>;
  salvar(agregado: AgregadoCrianca): Promise<void>;
  buscarPorFiltro?(filtro: { nome?: string }): Promise<AgregadoCrianca[]>;
  buscarPorEscola?(escolaId: string): Promise<AgregadoCrianca[]>;
  remover?(id: string): Promise<void>;
}
