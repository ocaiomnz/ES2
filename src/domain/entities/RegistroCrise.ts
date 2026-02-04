import { Entity } from "./Entity.js";
import { IntensidadeDaCrise } from "../value-objects/index.js";

export class RegistroCrise extends Entity {
  private readonly _dataHora: Date;
  private readonly _intensidade: IntensidadeDaCrise;
  private readonly _descricao: string | undefined;
  private readonly _gatilhoIdentificado: string | undefined;
  private _foiEficaz: boolean | undefined;

  private constructor(
    id: string | undefined,
    dataHora: Date,
    intensidade: IntensidadeDaCrise,
    descricao?: string,
    gatilhoIdentificado?: string,
    foiEficaz?: boolean,
  ) {
    super(id);
    this._dataHora = dataHora;
    this._intensidade = intensidade;
    this._descricao = descricao;
    this._gatilhoIdentificado = gatilhoIdentificado;
    this._foiEficaz = foiEficaz;
  }

  public static create(
    dataHora: Date,
    intensidade: IntensidadeDaCrise,
    descricao?: string,
    gatilhoIdentificado?: string,
  ): RegistroCrise {
    if (dataHora > new Date()) {
      throw new Error("Data/hora não pode ser futura");
    }
    return new RegistroCrise(
      undefined,
      dataHora,
      intensidade,
      descricao,
      gatilhoIdentificado,
    );
  }

  public static fromPersistence(input: {
    id?: string | undefined;
    dataHora: string;
    intensidade: string;
    descricao?: string | undefined;
    gatilhoIdentificado?: string | undefined;
    foiEficaz?: boolean | undefined;
  }): RegistroCrise {
    const dataHora = new Date(input.dataHora);
    const intensidade = IntensidadeDaCrise.fromString(input.intensidade);
    return new RegistroCrise(
      input.id,
      dataHora,
      intensidade,
      input.descricao,
      input.gatilhoIdentificado,
      input.foiEficaz,
    );
  }

  public exportarDados(): string {
    return `Relatório de Crise - ID: ${this.id}, Data: ${this._dataHora}, Intensidade: ${this._intensidade.intensidade}`;
  }

  public marcarEficacia(eficaz: boolean): void {
    this._foiEficaz = eficaz;
  }

  public get dataHora(): Date {
    return this._dataHora;
  }

  public get intensidade(): IntensidadeDaCrise {
    return this._intensidade;
  }

  public get descricao(): string | undefined {
    return this._descricao;
  }

  public get gatilhoIdentificado(): string | undefined {
    return this._gatilhoIdentificado;
  }

  public get foiEficaz(): boolean | undefined {
    return this._foiEficaz;
  }
}
