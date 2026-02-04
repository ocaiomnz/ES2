import type { IPersonalizacaoSensorialRepository } from "../../domain/repositories/IPersonalizacaoSensorialRepository.js";
import type { ICriancaRepository } from "../../domain/repositories/ICriancaRepository.js";
import type { IUsuarioRepository } from "../../domain/repositories/IUsuarioRepository.js";
import { PersonalizacaoSensorial, TamanhoFonte } from "../../domain/entities/PersonalizacaoSensorial.js";
import { TipoPerfilEnum } from "../../domain/value-objects/TipoPerfil.js";

export type PersonalizacaoDTO = {
  id: string;
  criancaId: string;
  paletaCores?: string;
  tamanhoFonte: string;
  icones?: string;
  sons: boolean;
  animacoes: boolean;
  contrasteAlto: boolean;
};

export type AtualizarPersonalizacaoInput = {
  usuarioId: string;
  criancaId: string;
  paletaCores?: string;
  tamanhoFonte?: string;
  icones?: string;
  sons?: boolean;
  animacoes?: boolean;
  contrasteAlto?: boolean;
};

export class GerenciarPersonalizacaoSensorialUseCase {
  constructor(
    private readonly personalizacaoRepo: IPersonalizacaoSensorialRepository,
    private readonly criancaRepo: ICriancaRepository,
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  public async obter(usuarioId: string, criancaId: string): Promise<PersonalizacaoDTO | null> {
    await this.verificarPermissao(usuarioId, criancaId);

    let personalizacao = await this.personalizacaoRepo.buscarPorCrianca(criancaId);

    if (!personalizacao) {
      personalizacao = PersonalizacaoSensorial.create(criancaId);
      await this.personalizacaoRepo.salvar(personalizacao);
    }

    const dto: PersonalizacaoDTO = {
      id: personalizacao.id,
      criancaId: personalizacao.criancaId,
      tamanhoFonte: personalizacao.tamanhoFonte,
      sons: personalizacao.sons,
      animacoes: personalizacao.animacoes,
      contrasteAlto: personalizacao.contrasteAlto,
    };

    if (personalizacao.paletaCores) {
      dto.paletaCores = personalizacao.paletaCores;
    }

    if (personalizacao.icones) {
      dto.icones = personalizacao.icones;
    }

    return dto;
  }

  public async atualizar(input: AtualizarPersonalizacaoInput): Promise<void> {
    await this.verificarPermissao(input.usuarioId, input.criancaId);

    let personalizacao = await this.personalizacaoRepo.buscarPorCrianca(input.criancaId);

    if (!personalizacao) {
      personalizacao = PersonalizacaoSensorial.create(input.criancaId);
    }

    if (input.paletaCores !== undefined) {
      personalizacao.alterarPaletaCores(input.paletaCores || undefined);
    }

    if (input.tamanhoFonte) {
      const tamanho = input.tamanhoFonte.toUpperCase() as TamanhoFonte;
      if (!Object.values(TamanhoFonte).includes(tamanho)) {
        throw new Error("Tamanho de fonte inválido");
      }
      personalizacao.alterarTamanhoFonte(tamanho);
    }

    if (input.icones !== undefined) {
      personalizacao.alterarIcones(input.icones || undefined);
    }

    if (input.sons !== undefined) {
      personalizacao.alterarSons(input.sons);
    }

    if (input.animacoes !== undefined) {
      personalizacao.alterarAnimacoes(input.animacoes);
    }

    if (input.contrasteAlto !== undefined) {
      personalizacao.alterarContrasteAlto(input.contrasteAlto);
    }

    await this.personalizacaoRepo.salvar(personalizacao);
  }

  private async verificarPermissao(usuarioId: string, criancaId: string): Promise<void> {
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
      return;
    }

    if (perfil === TipoPerfilEnum.PROFESSOR) {
      if (!usuario.escolaId || usuario.escolaId !== crianca.escolaId) {
        throw new Error("Permissão negada: professor não pertence à mesma escola");
      }
      return;
    }

    if (perfil === TipoPerfilEnum.RESPONSAVEL) {
      if (!crianca.responsavelIds.includes(usuario.id)) {
        throw new Error("Permissão negada: usuário não é responsável pela criança");
      }
      return;
    }

    throw new Error("Permissão negada");
  }
}
