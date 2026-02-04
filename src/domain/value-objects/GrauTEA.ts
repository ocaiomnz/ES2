import { ValueObject } from "./ValueObject.js";

export enum GrauTEAEnum {
  LEVE = "LEVE",
  MODERADO = "MODERADO",
  SEVERO = "SEVERO",
}

export class GrauTEA extends ValueObject {
  private readonly _grau: GrauTEAEnum;

  private constructor(grau: GrauTEAEnum) {
    super();
    this._grau = grau;
  }

  public static leve(): GrauTEA {
    return new GrauTEA(GrauTEAEnum.LEVE);
  }

  public static moderado(): GrauTEA {
    return new GrauTEA(GrauTEAEnum.MODERADO);
  }

  public static severo(): GrauTEA {
    return new GrauTEA(GrauTEAEnum.SEVERO);
  }

  public static fromString(value: string): GrauTEA {
    const enumValue = value.toUpperCase() as GrauTEAEnum;
    if (!Object.values(GrauTEAEnum).includes(enumValue)) {
      throw new Error(`Grau TEA inválido: ${value}`);
    }
    return new GrauTEA(enumValue);
  }

  public get grau(): GrauTEAEnum {
    return this._grau;
  }

  protected obterComponentesDeIgualdade(): Record<string, any> {
    return {
      grau: this._grau,
    };
  }
}
