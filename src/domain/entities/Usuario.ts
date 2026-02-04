import { Entity } from "./Entity.js";
import { Email, TipoPerfil } from "../value-objects/index.js";

export class Usuario extends Entity {
  private readonly _nome: string;
  private readonly _email: Email;
  private readonly _tipoPerfil: TipoPerfil;
  private readonly _senhaHash: string;
  private readonly _escolaId: string | undefined;

  private constructor(
    id: string | undefined,
    nome: string,
    email: Email,
    tipoPerfil: TipoPerfil,
    senhaHash: string,
    escolaId?: string,
  ) {
    super(id);
    this._nome = nome;
    this._email = email;
    this._tipoPerfil = tipoPerfil;
    this._senhaHash = senhaHash;
    this._escolaId = escolaId;
  }

  public static create(
    nome: string,
    email: Email,
    tipoPerfil: TipoPerfil,
    senhaHash: string,
    escolaId?: string,
  ): Usuario {
    if (!nome || nome.trim().length === 0) {
      throw new Error("Nome é obrigatório");
    }
    return new Usuario(undefined, nome, email, tipoPerfil, senhaHash, escolaId);
  }

  public static reconstitute(
    id: string,
    nome: string,
    email: Email,
    tipoPerfil: TipoPerfil,
    senhaHash: string,
    escolaId?: string,
  ): Usuario {
    return new Usuario(id, nome, email, tipoPerfil, senhaHash, escolaId);
  }

  public isAdmin(): boolean {
    return this._tipoPerfil.isAdmin();
  }

  public belongsToEscola(escolaId: string): boolean {
    return this._escolaId !== undefined && this._escolaId === escolaId;
  }

  public get nome(): string {
    return this._nome;
  }

  public get email(): Email {
    return this._email;
  }

  public get tipoPerfil(): TipoPerfil {
    return this._tipoPerfil;
  }

  public get senhaHash(): string {
    return this._senhaHash;
  }

  public get escolaId(): string | undefined {
    return this._escolaId;
  }
}
