import type { INotificacaoService } from "../../services/INotificacaoService.js";
import type { IEventoRepository } from "../../../domain/repositories/IEventoRepository.js";
import { Evento } from "../../../domain/entities/Evento.js";
import { NivelRisco } from "../../../domain/value-objects/NivelRisco.js";

export type CriarEventoCalendarioInput = {
  criancaId: string;
  titulo: string;
  dataHoraInicio: Date;
  dataHoraFim: Date;
  nivelRisco: string;
};

export type AtualizarEventoCalendarioInput = {
  eventoId: string;
  titulo?: string;
  dataHoraInicio?: Date | undefined;
  dataHoraFim?: Date | undefined;
  nivelRisco?: string;
};

export class ManterCalendarioUseCase {
  constructor(
    private readonly eventoRepo: IEventoRepository,
    private readonly notificacaoService?: INotificacaoService,
  ) {}

  public async criar(input: CriarEventoCalendarioInput): Promise<void> {
    const nivel = NivelRisco.fromString(input.nivelRisco);
    const evento = Evento.create(
      input.criancaId,
      input.titulo,
      input.dataHoraInicio,
      input.dataHoraFim,
      nivel,
    );

    await this.eventoRepo.salvar(evento);

    await this.notificarMudancaRotina(
      input.criancaId,
      evento.id,
      input.nivelRisco,
      input.dataHoraInicio,
    );
  }

  public async atualizar(input: AtualizarEventoCalendarioInput): Promise<void> {
    const evento = await this.eventoRepo.buscarPorId(input.eventoId);
    if (!evento) {
      throw new Error("Evento não encontrado para atualização");
    }

    const novoNivel = input.nivelRisco
      ? NivelRisco.fromString(input.nivelRisco)
      : undefined;

    evento.atualizarDados(
      input.titulo,
      input.dataHoraInicio,
      input.dataHoraFim,
      novoNivel,
    );

    await this.eventoRepo.salvar(evento);

    await this.notificarMudancaRotina(
      evento.criancaId,
      evento.id,
      input.nivelRisco,
      input.dataHoraInicio ?? evento.dataHoraInicio,
    );
  }

  public async excluir(eventoId: string): Promise<void> {
    await this.eventoRepo.excluir?.(eventoId);
  }

  private async notificarMudancaRotina(
    criancaId: string,
    eventoId: string,
    nivelRisco?: string,
    dataHoraEvento?: Date,
  ): Promise<void> {
    if (!this.notificacaoService || !nivelRisco || !dataHoraEvento) {
      return;
    }

    await this.notificacaoService.notificarMudancaRotina({
      criancaId,
      eventoId,
      nivelRisco,
      dataHoraEvento,
    });
  }
}
