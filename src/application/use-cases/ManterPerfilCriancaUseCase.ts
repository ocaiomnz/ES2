import type { ICriancaRepository } from "../../domain/repositories/ICriancaRepository.js";
import type { IUsuarioRepository } from "../../domain/repositories/IUsuarioRepository.js";
import { TipoPerfilEnum } from "../../domain/value-objects/TipoPerfil.js";
import { DataNascimento, GrauTEA, GrauSuporte } from "../../domain/value-objects/index.js";

export type EditarCriancaInput = {
  usuarioId: string;
  criancaId: string;
  dataNascimento?: Date;
  grauTEA?: string;
  grauSuporte?: string;
  escolaId?: string;
  responsavelIds?: string[];
};

export class EditarCriancaUseCase {
  constructor(
    private readonly criancaRepo: ICriancaRepository,
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  public async execute(input: EditarCriancaInput): Promise<void> {
    const usuario = await this.usuarioRepo.buscarPorId(input.usuarioId);
    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    const agregado = await this.criancaRepo.buscarPorId(input.criancaId);
    if (!agregado) {
      throw new Error("Criança não encontrada");
    }

    const crianca = agregado.crianca;
    const perfil = usuario.tipoPerfil.tipo;

    if (perfil === TipoPerfilEnum.ADMIN) {
      // Admin pode editar qualquer criança
    } else if (perfil === TipoPerfilEnum.PROFESSOR) {
      if (!usuario.escolaId || usuario.escolaId !== crianca.escolaId) {
        throw new Error("Permissão negada: professor não pertence à mesma escola");
      }
    } else if (perfil === TipoPerfilEnum.RESPONSAVEL) {
      if (!crianca.responsavelIds.includes(usuario.id)) {
        throw new Error("Permissão negada: usuário não é responsável pela criança");
      }
    } else {
      throw new Error("Permissão negada");
    }

    if (input.dataNascimento) {
      crianca.alterarDataNascimento(DataNascimento.create(input.dataNascimento));
    }

    if (input.grauTEA) {
      crianca.alterarGrauTEA(GrauTEA.fromString(input.grauTEA));
    }

    if (input.grauSuporte) {
      crianca.alterarGrauSuporte(GrauSuporte.fromString(input.grauSuporte));
    }

    if (input.escolaId !== undefined) {
      crianca.alterarEscola(input.escolaId || undefined);
    }

    await this.criancaRepo.salvar(agregado);
  }
}

