import type { IUsuarioRepository } from "../../../domain/repositories/IUsuarioRepository.js";

export interface ObterUsuarioAutenticadoOutput {
  id: string;
  nome: string;
  email: string;
  tipoPerfil: string;
  escolaId?: string;
}

export class ObterUsuarioAutenticadoUseCase {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  public async execute(
    usuarioId: string,
  ): Promise<ObterUsuarioAutenticadoOutput> {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);

    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    const output: any = {
      id: usuario.id!,
      nome: usuario.nome,
      email: usuario.email.enderecoEmail,
      tipoPerfil: usuario.tipoPerfil.tipo,
    };

    if (usuario.escolaId) {
      output.escolaId = usuario.escolaId;
    }

    return output;
  }
}
