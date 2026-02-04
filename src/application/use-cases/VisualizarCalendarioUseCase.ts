import type { ICriancaRepository } from "../../domain/repositories/ICriancaRepository.js";
import type { IEventoRepository } from "../../domain/repositories/IEventoRepository.js";
import { Evento } from "../../domain/entities/Evento.js";

export type EventoCalendarioDTO = {
  id?: string;
  titulo: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  status: string;
  nivelRisco?: string;
};

export class VisualizarCalendarioUseCase {
  constructor(
    private readonly criancaRepo: ICriancaRepository,
    private readonly eventoRepo: IEventoRepository,
  ) {}

  public async execute(criancaId: string): Promise<EventoCalendarioDTO[]> {
    const agregado = await this.criancaRepo.buscarPorId(criancaId);
    if (!agregado) throw new Error("Criança não encontrada");

    const eventos = await this.eventoRepo.listarPorCrianca(criancaId);

    return eventos.map((e: Evento) => ({
      id: e.id,
      titulo: e.titulo,
      dataHoraInicio: e.dataHoraInicio.toISOString(),
      dataHoraFim: e.dataHoraFim.toISOString(),
      status: e.status,
      nivelRisco: e.nivelRisco.nivel,
    }));
  }
}
