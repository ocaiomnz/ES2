import { ValueObject } from "./ValueObject.js";

export enum NivelRiscoEnum {
  VERDE = "VERDE",
  AMARELO = "AMARELO",
  VERMELHO = "VERMELHO",
}

export class NivelRisco extends ValueObject {
  private readonly _nivel: NivelRiscoEnum;

  private constructor(nivel: NivelRiscoEnum) {
    super();
    this._nivel = nivel;
  }

  public static verde(): NivelRisco {
    return new NivelRisco(NivelRiscoEnum.VERDE);
  }

  public static amarelo(): NivelRisco {
    return new NivelRisco(NivelRiscoEnum.AMARELO);
  }

  public static vermelho(): NivelRisco {
    return new NivelRisco(NivelRiscoEnum.VERMELHO);
  }

  public static fromString(value: string): NivelRisco {
    const enumValue = value.toUpperCase() as NivelRiscoEnum;
    if (!Object.values(NivelRiscoEnum).includes(enumValue)) {
      throw new Error(`Nível de risco inválido: ${value}`);
    }
    return new NivelRisco(enumValue);
  }

  public get nivel(): NivelRiscoEnum {
    return this._nivel;
  }

  protected obterComponentesDeIgualdade(): Record<string, any> {
    return {
      nivel: this._nivel,
    };
  }
}
