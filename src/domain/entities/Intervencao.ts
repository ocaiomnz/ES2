import { Entity } from "./Entity.js";

export class Intervencao extends Entity {
  private readonly _dataHora: Date;
  private readonly _estrategia: string; // Ex.: "Técnica de respiração", "Mudança de ambiente"
  private readonly _aplicadaPor: string; // Nome do aplicador
  private _resultado: string | undefined; // Ex.: "Crise reduzida"

  private constructor(
    id: string | undefined,
    dataHora: Date,
    estrategia: string,
    aplicadaPor: string,
    resultado?: string,
  ) {
    super(id);
    this._dataHora = dataHora;
    this._estrategia = estrategia;
    this._aplicadaPor = aplicadaPor;
    this._resultado = resultado;
  }

  public static create(
    dataHora: Date,
    estrategia: string,
    aplicadaPor: string,
  ): Intervencao {
    if (!estrategia || estrategia.trim().length === 0) {
      throw new Error("Estratégia é obrigatória");
    }
    if (!aplicadaPor || aplicadaPor.trim().length === 0) {
      throw new Error("Aplicador é obrigatório");
    }
    return new Intervencao(undefined, dataHora, estrategia, aplicadaPor);
  }

  public static fromPersistence(input: {
    id?: string | undefined;
    dataHora: string;
    estrategia: string;
    aplicadaPor: string;
    resultado?: string | undefined;
  }): Intervencao {
    return new Intervencao(
      input.id,
      new Date(input.dataHora),
      input.estrategia,
      input.aplicadaPor,
      input.resultado,
    );
  }

  public registrarResultado(resultado: string): void {
    this._resultado = resultado;
  }

  public get dataHora(): Date {
    return this._dataHora;
  }

  public get estrategia(): string {
    return this._estrategia;
  }

  public get aplicadaPor(): string {
    return this._aplicadaPor;
  }

  public get resultado(): string | undefined {
    return this._resultado;
  }
}
