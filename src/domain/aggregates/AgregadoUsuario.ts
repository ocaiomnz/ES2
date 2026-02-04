import { Usuario } from "../entities/Usuario.js";

export class AgregadoUsuario {
  private readonly _usuario: Usuario;

  private constructor(usuario: Usuario) {
    this._usuario = usuario;
  }

  public static criar(usuario: Usuario): AgregadoUsuario {
    return new AgregadoUsuario(usuario);
  }

  public get usuario(): Usuario {
    return this._usuario;
  }
}
