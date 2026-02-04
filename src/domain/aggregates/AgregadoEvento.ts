import { Evento } from "../entities/Evento.js";

export class AgregadoEvento {
  private readonly _evento: Evento;

  private constructor(evento: Evento) {
    this._evento = evento;
  }

  public static criar(evento: Evento): AgregadoEvento {
    return new AgregadoEvento(evento);
  }

  public get evento(): Evento {
    return this._evento;
  }
}
