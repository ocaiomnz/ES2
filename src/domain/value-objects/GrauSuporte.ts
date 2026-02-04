import { ValueObject } from "./ValueObject.js";

export enum GrauSuporteEnum {
  NIVEL_1 = "NIVEL_1", 
  NIVEL_2 = "NIVEL_2", 
  NIVEL_3 = "NIVEL_3", 
}

export class GrauSuporte extends ValueObject {
  private readonly _grau: GrauSuporteEnum;

  private constructor(grau: GrauSuporteEnum) {
    super();
    this._grau = grau;
  }

  public static nivel1(): GrauSuporte {
    return new GrauSuporte(GrauSuporteEnum.NIVEL_1);
  }

  public static nivel2(): GrauSuporte {
    return new GrauSuporte(GrauSuporteEnum.NIVEL_2);
  }
  
  public static nivel3(): GrauSuporte {
    return new GrauSuporte(GrauSuporteEnum.NIVEL_3);
  }

  public static fromString(value: string): GrauSuporte {
    const enumValue = value.toUpperCase() as GrauSuporteEnum;
    if (!Object.values(GrauSuporteEnum).includes(enumValue)) {
      throw new Error(
        `Grau de suporte inválido: ${value}. Use NIVEL_1, NIVEL_2 ou NIVEL_3.`,
      );
    }
    return new GrauSuporte(enumValue);
  }

  public get grau(): GrauSuporteEnum {
    return this._grau;
  }

  protected obterComponentesDeIgualdade(): Record<string, any> {
    return {
      grau: this._grau,
    };
  }
}
