import type { IUsuarioRepository } from "../../../domain/repositories/IUsuarioRepository.js";
import type { PasswordHasher } from "../../../infrastructure/security/PasswordHasher.js";
import type { JwtService } from "../../../infrastructure/security/JwtService.js";

export interface LoginInput {
  email: string;
  senha: string;
}

export interface LoginOutput {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    tipoPerfil: string;
    escolaId?: string;
  };
}

export class LoginUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  public async execute(input: LoginInput): Promise<LoginOutput> {
    const usuario = await this.usuarioRepository.buscarPorEmail(input.email);

    if (!usuario) {
      throw new Error("Email ou senha inválidos");
    }

    const senhaValida = await this.passwordHasher.compare(
      input.senha,
      usuario.senhaHash,
    );

    if (!senhaValida) {
      throw new Error("Email ou senha inválidos");
    }

    const payload: any = {
      userId: usuario.id!,
      email: usuario.email.enderecoEmail,
      tipoPerfil: usuario.tipoPerfil.tipo,
    };

    if (usuario.escolaId) {
      payload.escolaId = usuario.escolaId;
    }

    const token = this.jwtService.sign(payload);

    const usuarioData: any = {
      id: usuario.id!,
      nome: usuario.nome,
      email: usuario.email.enderecoEmail,
      tipoPerfil: usuario.tipoPerfil.tipo,
    };

    if (usuario.escolaId) {
      usuarioData.escolaId = usuario.escolaId;
    }

    return {
      token,
      usuario: usuarioData,
    };
  }
}
