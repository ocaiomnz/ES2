import { Usuario } from "../entities/Usuario.js";

export interface IUsuarioRepository {
  buscarPorId(id: string): Promise<Usuario | undefined>;
  buscarPorEmail(email: string): Promise<Usuario | undefined>;
  salvar(usuario: Usuario): Promise<void>;
  listar(filtros?: { tipoPerfil?: string; escolaId?: string }): Promise<Usuario[]>;
  remover(id: string): Promise<void>;
  emailJaExiste(email: string): Promise<boolean>;
}
