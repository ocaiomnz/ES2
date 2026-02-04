import { Entity } from "./Entity.js";
import { NivelRisco } from "../value-objects/index.js";

export enum StatusEvento {
  PENDENTE = "PENDENTE",
  CONFIRMADO = "CONFIRMADO",
  CANCELADO = "CANCELADO",
}

export class Evento extends Entity {
  private readonly _criancaId: string;
  private _titulo: string;
  private _dataHoraInicio: Date;
  private _dataHoraFim: Date;
  private _nivelRisco: NivelRisco;
  private _status: StatusEvento;

  private constructor(
    id: string | undefined,
    criancaId: string,
    titulo: string,
    dataHoraInicio: Date,
    dataHoraFim: Date,
    nivelRisco: NivelRisco,
    status: StatusEvento = StatusEvento.PENDENTE,
  ) {
    super(id);
    this._criancaId = criancaId;
    this._titulo = titulo;
    this._dataHoraInicio = dataHoraInicio;
    this._dataHoraFim = dataHoraFim;
    this._nivelRisco = nivelRisco;
    this._status = status;
  }

  public static create(
    criancaId: string,
    titulo: string,
    dataHoraInicio: Date,
    dataHoraFim: Date,
    nivelRisco: NivelRisco,
  ): Evento {
    if (!criancaId || criancaId.trim().length === 0) {
      throw new Error("criancaId é obrigatório para Evento");
    }
    if (!titulo || titulo.trim().length === 0) {
      throw new Error("Título é obrigatório");
    }
    if (dataHoraInicio >= dataHoraFim) {
      throw new Error("Data de início deve ser anterior à data de fim");
    }
    return new Evento(
      undefined,
      criancaId,
      titulo,
      dataHoraInicio,
      dataHoraFim,
      nivelRisco,
    );
  }

  public static reconstitute(
    id: string,
    criancaId: string,
    titulo: string,
    dataHoraInicio: Date,
    dataHoraFim: Date,
    nivelRisco: NivelRisco,
    status: StatusEvento,
  ): Evento {
    return new Evento(
      id,
      criancaId,
      titulo,
      dataHoraInicio,
      dataHoraFim,
      nivelRisco,
      status,
    );
  }

  public notificarAlteracao(): void {
    // Lógica para notificar responsáveis sobre alteração
    console.log(`Notificação enviada para alteração no evento ${this._titulo}`);
  }

  public get criancaId(): string {
    return this._criancaId;
  }

  public reagendar(novaDataInicio: Date, novaDataFim: Date): void {
    if (novaDataInicio >= novaDataFim) {
      throw new Error(
        "Nova data de início deve ser anterior à nova data de fim",
      );
    }
    this._dataHoraInicio = novaDataInicio;
    this._dataHoraFim = novaDataFim;
    this.notificarAlteracao();
  }

  public atualizarDados(
    titulo?: string,
    novaDataInicio?: Date,
    novaDataFim?: Date,
    novoNivelRisco?: NivelRisco,
  ): void {
    if (titulo && titulo.trim().length === 0) {
      throw new Error("Título não pode ser vazio");
    }
    if (titulo) this._titulo = titulo;

    if (novaDataInicio && novaDataFim) {
      this.reagendar(novaDataInicio, novaDataFim);
    } else if (novaDataInicio || novaDataFim) {
      throw new Error(
        "Para reagendar, informe data e Hora de Inicio e Fim",
      );
    }

    if (novoNivelRisco) {
      this._nivelRisco = novoNivelRisco;
      this.notificarAlteracao();
    }
  }

  public get titulo(): string {
    return this._titulo;
  }

  public get dataHoraInicio(): Date {
    return this._dataHoraInicio;
  }

  public get dataHoraFim(): Date {
    return this._dataHoraFim;
  }

  public get nivelRisco(): NivelRisco {
    return this._nivelRisco;
  }

  public get status(): StatusEvento {
    return this._status;
  }

  public set status(value: StatusEvento) {
    this._status = value;
  }
}
