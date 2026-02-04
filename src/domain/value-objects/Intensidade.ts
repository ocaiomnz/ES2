import { ValueObject } from "./ValueObject.js";

export enum IntensidadeEnum {
  BAIXA = "BAIXA",
  MEDIA = "MEDIA",
  ALTA = "ALTA",
}

export class IntensidadeDaCrise extends ValueObject {
  private readonly _intensidade: IntensidadeEnum;

  private constructor(intensidade: IntensidadeEnum) {
    super();
    this._intensidade = intensidade;
  }

  public static baixa(): IntensidadeDaCrise {
    return new IntensidadeDaCrise(IntensidadeEnum.BAIXA);
  }

  public static media(): IntensidadeDaCrise {
    return new IntensidadeDaCrise(IntensidadeEnum.MEDIA);
  }

  public static alta(): IntensidadeDaCrise {
    return new IntensidadeDaCrise(IntensidadeEnum.ALTA);
  }

  public static fromString(value: string): IntensidadeDaCrise {
    const enumValue = value.toUpperCase() as IntensidadeEnum;
    if (!Object.values(IntensidadeEnum).includes(enumValue)) {
      throw new Error(`Intensidade inválida: ${value}`);
    }
    return new IntensidadeDaCrise(enumValue);
  }

  public get intensidade(): IntensidadeEnum {
    return this._intensidade;
  }

  protected obterComponentesDeIgualdade(): Record<string, any> {
    return {
      intensidade: this._intensidade,
    };
  }
}
