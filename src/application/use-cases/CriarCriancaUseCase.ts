import type { ICriancaRepository } from "../../domain/repositories/ICriancaRepository.js";
import type { IUsuarioRepository } from "../../domain/repositories/IUsuarioRepository.js";
import { Crianca } from "../../domain/entities/Crianca.js";
import { AgregadoCrianca } from "../../domain/aggregates/AgregadoCrianca.js";
import { DataNascimento, GrauTEA, GrauSuporte } from "../../domain/value-objects/index.js";
import { TipoPerfilEnum } from "../../domain/value-objects/TipoPerfil.js";

export type CriarCriancaInput = {
  usuarioId: string;
  dataNascimento: Date;
  grauTEA: string;
  grauSuporte: string;
  escolaId?: string;
  responsavelIds?: string[];
};

export class CriarCriancaUseCase {
  constructor(
    private readonly criancaRepo: ICriancaRepository,
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  public async execute(input: CriarCriancaInput): Promise<string> {
    const usuario = await this.usuarioRepo.buscarPorId(input.usuarioId);
    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    const perfil = usuario.tipoPerfil.tipo;
    if (perfil !== TipoPerfilEnum.PROFESSOR && perfil !== TipoPerfilEnum.RESPONSAVEL) {
      throw new Error("Permissão negada: apenas equipe escolar ou responsáveis podem cadastrar crianças");
    }

    if (perfil === TipoPerfilEnum.PROFESSOR && !input.escolaId) {
      throw new Error("escolaId é obrigatório para equipe escolar");
    }

    if (perfil === TipoPerfilEnum.RESPONSAVEL && !input.responsavelIds?.includes(input.usuarioId)) {
      if (!input.responsavelIds) {
        input.responsavelIds = [input.usuarioId];
      } else {
        input.responsavelIds.push(input.usuarioId);
      }
    }

    const dataNascimento = DataNascimento.create(input.dataNascimento);
    const grauTEA = GrauTEA.fromString(input.grauTEA);
    const grauSuporte = GrauSuporte.fromString(input.grauSuporte);

    const crianca = Crianca.create(
      dataNascimento,
      grauTEA,
      grauSuporte,
      input.escolaId,
      input.responsavelIds,
    );

    const agregado = AgregadoCrianca.criar(crianca);
    await this.criancaRepo.salvar(agregado);

    return crianca.id;
  }
}
