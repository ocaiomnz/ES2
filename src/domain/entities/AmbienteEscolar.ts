import { Entity } from "./Entity.js";

export class AmbienteEscolar extends Entity {
  private readonly _escolaId: string;
  private _nome: string;
  private _descricao: string | undefined;
  private _midias: string[] | undefined; // URLs de imagens/vídeos do tour

  private constructor(
    id: string | undefined,
    escolaId: string,
    nome: string,
    descricao?: string,
    midias?: string[],
  ) {
    super(id);
    this._escolaId = escolaId;
    this._nome = nome;
    this._descricao = descricao;
    this._midias = midias && midias.length > 0 ? [...midias] : undefined;
  }

  public static create(
    escolaId: string,
    nome: string,
    descricao?: string,
    midias?: string[],
  ): AmbienteEscolar {
    if (!escolaId || escolaId.trim().length === 0) {
      throw new Error("escolaId é obrigatório para AmbienteEscolar");
    }
    if (!nome || nome.trim().length === 0) {
      throw new Error("Nome do ambiente é obrigatório");
    }
    return new AmbienteEscolar(undefined, escolaId, nome, descricao, midias);
  }

  public static reconstitute(
    id: string,
    escolaId: string,
    nome: string,
    descricao?: string,
    midias?: string[],
  ): AmbienteEscolar {
    return new AmbienteEscolar(id, escolaId, nome, descricao, midias);
  }

  public get escolaId(): string {
    return this._escolaId;
  }

  public get nome(): string {
    return this._nome;
  }

  public get descricao(): string | undefined {
    return this._descricao;
  }

  public get midias(): readonly string[] | undefined {
    return this._midias;
  }

  public atualizarDados(
    nome?: string,
    descricao?: string,
    midias?: string[],
  ): void {
    if (nome && nome.trim().length === 0) {
      throw new Error("Nome do ambiente não pode ser vazio");
    }
    if (nome) this._nome = nome;
    if (typeof descricao !== "undefined") this._descricao = descricao;
    if (typeof midias !== "undefined") {
      this._midias = midias.length > 0 ? [...midias] : undefined;
    }
  }
}
