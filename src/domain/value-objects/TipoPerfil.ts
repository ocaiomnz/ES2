import { ValueObject } from "./ValueObject.js";

export enum TipoPerfilEnum {
  PROFESSOR = "PROFESSOR",
  PAI = "PAI/RESPONSAVEL",
  RESPONSAVEL = "RESPONSAVEL",
  ADMIN = "ADMIN",
  CRIANCA = "CRIANCA",
}

export class TipoPerfil extends ValueObject {
  private readonly _tipo: TipoPerfilEnum;

  private constructor(tipo: TipoPerfilEnum) {
    super();
    this._tipo = tipo;
  }

  public static professor(): TipoPerfil {
    return new TipoPerfil(TipoPerfilEnum.PROFESSOR);
  }

  public static pai(): TipoPerfil {
    return new TipoPerfil(TipoPerfilEnum.PAI);
  }

  public static admin(): TipoPerfil {
    return new TipoPerfil(TipoPerfilEnum.ADMIN);
  }
  public static crianca(): TipoPerfil {
    return new TipoPerfil(TipoPerfilEnum.CRIANCA);
  }

  public static fromString(value: string): TipoPerfil {
    const enumValue = value.toUpperCase() as TipoPerfilEnum;
    if (!Object.values(TipoPerfilEnum).includes(enumValue)) {
      throw new Error(`Tipo de perfil inválido: ${value}`);
    }
    return new TipoPerfil(enumValue);
  }

  public get tipo(): TipoPerfilEnum {
    return this._tipo;
  }

  public isAdmin(): boolean {
    return this._tipo === TipoPerfilEnum.ADMIN;
  }

  protected obterComponentesDeIgualdade(): Record<string, any> {
    return {
      tipo: this._tipo,
    };
  }
}
