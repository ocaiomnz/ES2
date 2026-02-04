import { Evento } from "../entities/Evento.js";

export interface IEventoRepository {
  listarPorCrianca(
    criancaId: string,
    periodo?: { inicio?: Date; fim?: Date },
  ): Promise<Evento[]>;

  buscarPorId(id: string): Promise<Evento | null>;
  salvar(evento: Evento): Promise<void>;

  excluir?(id: string): Promise<void>;
}
