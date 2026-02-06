import type { ICriancaRepository } from "../../domain/repositories/ICriancaRepository.js";
import type { IUsuarioRepository } from "../../domain/repositories/IUsuarioRepository.js";
import { TipoPerfilEnum } from "../../domain/value-objects/TipoPerfil.js";

export type CriancaDTO = {
  id: string;
  nome?: string;
  dataNascimento: string;
  grauTEA: string;
  grauSuporte: string;
  escolaId?: string;
  responsavelIds: string[];
};

export class VisualizarCriancaUseCase {
  constructor(
    private readonly criancaRepo: ICriancaRepository,
    private readonly usuarioRepo: IUsuarioRepository
  ) {}

  public async execute(
    usuarioId: string,
    criancaId: string
  ): Promise<CriancaDTO> {
    const usuario = await this.usuarioRepo.buscarPorId(usuarioId);
    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    const agregado = await this.criancaRepo.buscarPorId(criancaId);
    if (!agregado) {
      throw new Error("Criança não encontrada");
    }

    const crianca = agregado.crianca;
    const perfil = usuario.tipoPerfil.tipo;

    if (perfil === TipoPerfilEnum.ADMIN) {
      // Admin pode ver qualquer criança
    } else if (
      perfil === TipoPerfilEnum.PROFESSOR ||
      perfil === TipoPerfilEnum.EQUIPE_ESCOLAR
    ) {
      if (!usuario.escolaId || usuario.escolaId !== crianca.escolaId) {
        throw new Error(
          "Permissão negada: não pertence à mesma escola da criança"
        );
      }
    } else if (
      perfil === TipoPerfilEnum.RESPONSAVEL ||
      perfil === TipoPerfilEnum.PAI
    ) {
      if (!crianca.responsavelIds.includes(usuario.id)) {
        throw new Error(
          "Permissão negada: usuário não é responsável pela criança"
        );
      }
    } else {
      throw new Error("Permissão negada");
    }

    const dto: CriancaDTO = {
      id: crianca.id,
      dataNascimento: crianca.dataNascimento.data.toISOString(),
      grauTEA: crianca.grauTEA.grau,
      grauSuporte: crianca.grauSuporte.grau,
      responsavelIds: [...crianca.responsavelIds],
    };

    if (crianca.nome) {
      dto.nome = crianca.nome;
    }

    if (crianca.escolaId) {
      dto.escolaId = crianca.escolaId;
    }

    return dto;
  }

  public async listarPorUsuario(usuarioId: string): Promise<CriancaDTO[]> {
    const usuario = await this.usuarioRepo.buscarPorId(usuarioId);
    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    const perfil = usuario.tipoPerfil.tipo;
    let agregados;

    if (perfil === TipoPerfilEnum.ADMIN) {
      agregados = (await this.criancaRepo.buscarPorFiltro?.({})) || [];
    } else if (
      perfil === TipoPerfilEnum.PROFESSOR ||
      perfil === TipoPerfilEnum.EQUIPE_ESCOLAR
    ) {
      if (!usuario.escolaId) {
        return [];
      }
      agregados =
        (await this.criancaRepo.buscarPorEscola?.(usuario.escolaId)) || [];
    } else if (
      perfil === TipoPerfilEnum.RESPONSAVEL ||
      perfil === TipoPerfilEnum.PAI
    ) {
      const todasCriancas =
        (await this.criancaRepo.buscarPorFiltro?.({})) || [];
      agregados = todasCriancas.filter((a) =>
        a.crianca.responsavelIds.includes(usuario.id)
      );
    } else {
      return [];
    }

    return agregados.map((a) => {
      const dto: CriancaDTO = {
        id: a.crianca.id,
        dataNascimento: a.crianca.dataNascimento.data.toISOString(),
        grauTEA: a.crianca.grauTEA.grau,
        grauSuporte: a.crianca.grauSuporte.grau,
        responsavelIds: [...a.crianca.responsavelIds],
      };

      if (a.crianca.nome) {
        dto.nome = a.crianca.nome;
      }

      if (a.crianca.escolaId) {
        dto.escolaId = a.crianca.escolaId;
      }

      return dto;
    });
  }
}
