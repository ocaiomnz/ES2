import { Entity } from "./Entity.js";
import {
  GrauSuporte,
  GrauTEA,
  DataNascimento,
} from "../value-objects/index.js";

export class Crianca extends Entity {
  private _dataNascimento: DataNascimento;
  private _grauTEA: GrauTEA;
  private _grauSuporte: GrauSuporte;
  private _escolaId: string | undefined;
  private _responsavelIds: string[];

  private constructor(
    id: string | undefined,
    dataNascimento: DataNascimento,
    grauTEA: GrauTEA,
    grauSuporte: GrauSuporte,
    escolaId?: string,
    responsavelIds?: string[],
  ) {
    super(id);
    this._dataNascimento = dataNascimento;
    this._grauTEA = grauTEA;
    this._grauSuporte = grauSuporte;
    this._escolaId = escolaId;
    this._responsavelIds = responsavelIds ?? [];
  }

  public static create(
    dataNascimento: DataNascimento,
    grauTEA: GrauTEA,
    grauSuporte: GrauSuporte,
    escolaId?: string,
    responsavelIds?: string[],
  ): Crianca {
    return new Crianca(
      undefined,
      dataNascimento,
      grauTEA,
      grauSuporte,
      escolaId,
      responsavelIds,
    );
  }

  public static fromPersistence(input: {
    id?: string | undefined;
    dataNascimento: string;
    grauTEA: string;
    grauSuporte: string;
    escolaId?: string;
    responsavelIds?: string[];
  }): Crianca {
    return new Crianca(
      input.id,
      DataNascimento.create(new Date(input.dataNascimento)),
      GrauTEA.fromString(input.grauTEA),
      GrauSuporte.fromString(input.grauSuporte),
      input.escolaId,
      input.responsavelIds,
    );
  }

  public solicitarSuporte(): boolean {
    // Lógica de negócio: verificar se pode solicitar suporte

    console.log(`Suporte solicitado para criança ${this._id}`);
    return true;
  }

  public visualizarCalendario(): string {
    // Lógica para buscar eventos do calendário

    return `Calendário da criança ${this._id}`;
  }

  public get dataNascimento(): DataNascimento {
    return this._dataNascimento;
  }

  public get grauTEA(): GrauTEA {
    return this._grauTEA;
  }

  public get grauSuporte(): GrauSuporte {
    return this._grauSuporte;
  }

  public get escolaId(): string | undefined {
    return this._escolaId;
  }

  public get responsavelIds(): readonly string[] {
    return this._responsavelIds;
  }

  public alterarResponsavel(responsavelId: string): void {
    if (!this._responsavelIds.includes(responsavelId)) {
      this._responsavelIds.push(responsavelId);
    }
  }

  public alterarEscola(escolaId: string | undefined): void {
    this._escolaId = escolaId;
  }
  public alterarGrauTEA(grauTEA: GrauTEA): void {
    this._grauTEA = grauTEA;
  }
  public alterarGrauSuporte(grauSuporte: GrauSuporte): void {
    this._grauSuporte = grauSuporte;
  }
  public alterarDataNascimento(dataNascimento: DataNascimento): void {
    this._dataNascimento = dataNascimento;
  }
}
