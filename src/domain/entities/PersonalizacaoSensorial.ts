import { Entity } from "./Entity.js";

export enum TamanhoFonte {
  PEQUENO = "PEQUENO",
  MEDIO = "MEDIO",
  GRANDE = "GRANDE",
}

export class PersonalizacaoSensorial extends Entity {
  private readonly _criancaId: string;
  private _paletaCores: string | undefined;
  private _tamanhoFonte: TamanhoFonte;
  private _icones: string | undefined;
  private _sons: boolean;
  private _animacoes: boolean;
  private _contrasteAlto: boolean;

  private constructor(
    id: string | undefined,
    criancaId: string,
    tamanhoFonte: TamanhoFonte = TamanhoFonte.MEDIO,
    paletaCores?: string,
    icones?: string,
    sons: boolean = false,
    animacoes: boolean = false,
    contrasteAlto: boolean = false,
  ) {
    super(id);
    this._criancaId = criancaId;
    this._paletaCores = paletaCores;
    this._tamanhoFonte = tamanhoFonte;
    this._icones = icones;
    this._sons = sons;
    this._animacoes = animacoes;
    this._contrasteAlto = contrasteAlto;
  }

  public static create(criancaId: string): PersonalizacaoSensorial {
    if (!criancaId || criancaId.trim().length === 0) {
      throw new Error("criancaId é obrigatório");
    }
    return new PersonalizacaoSensorial(undefined, criancaId);
  }

  public static reconstitute(
    id: string,
    criancaId: string,
    tamanhoFonte: TamanhoFonte,
    paletaCores?: string,
    icones?: string,
    sons?: boolean,
    animacoes?: boolean,
    contrasteAlto?: boolean,
  ): PersonalizacaoSensorial {
    return new PersonalizacaoSensorial(
      id,
      criancaId,
      tamanhoFonte,
      paletaCores,
      icones,
      sons ?? false,
      animacoes ?? false,
      contrasteAlto ?? false,
    );
  }

  public alterarPaletaCores(paletaCores: string | undefined): void {
    this._paletaCores = paletaCores;
  }

  public alterarTamanhoFonte(tamanhoFonte: TamanhoFonte): void {
    this._tamanhoFonte = tamanhoFonte;
  }

  public alterarIcones(icones: string | undefined): void {
    this._icones = icones;
  }

  public alterarSons(ativado: boolean): void {
    this._sons = ativado;
  }

  public alterarAnimacoes(ativado: boolean): void {
    this._animacoes = ativado;
  }

  public alterarContrasteAlto(ativado: boolean): void {
    this._contrasteAlto = ativado;
  }

  public get criancaId(): string {
    return this._criancaId;
  }

  public get paletaCores(): string | undefined {
    return this._paletaCores;
  }

  public get tamanhoFonte(): TamanhoFonte {
    return this._tamanhoFonte;
  }

  public get icones(): string | undefined {
    return this._icones;
  }

  public get sons(): boolean {
    return this._sons;
  }

  public get animacoes(): boolean {
    return this._animacoes;
  }

  public get contrasteAlto(): boolean {
    return this._contrasteAlto;
  }
}
