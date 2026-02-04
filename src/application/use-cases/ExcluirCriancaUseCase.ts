import type { ICriancaRepository } from "../../domain/repositories/ICriancaRepository.js";
import type { IUsuarioRepository } from "../../domain/repositories/IUsuarioRepository.js";
import { TipoPerfilEnum } from "../../domain/value-objects/TipoPerfil.js";

export class ExcluirCriancaUseCase {
  constructor(
    private readonly criancaRepo: ICriancaRepository,
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  public async execute(usuarioId: string, criancaId: string): Promise<void> {
    const usuario = await this.usuarioRepo.buscarPorId(usuarioId);
    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    const agregado = await this.criancaRepo.buscarPorId(criancaId);
    if (!agregado) {
      throw new Error("Criança não encontrada");
    }

    const perfil = usuario.tipoPerfil.tipo;

    if (perfil !== TipoPerfilEnum.ADMIN && perfil !== TipoPerfilEnum.PROFESSOR) {
      throw new Error("Permissão negada: apenas admin ou equipe escolar podem excluir crianças");
    }

    if (perfil === TipoPerfilEnum.PROFESSOR) {
      const crianca = agregado.crianca;
      if (!usuario.escolaId || usuario.escolaId !== crianca.escolaId) {
        throw new Error("Permissão negada: professor não pertence à mesma escola");
      }
    }

    await this.criancaRepo.remover?.(criancaId);
  }
}
