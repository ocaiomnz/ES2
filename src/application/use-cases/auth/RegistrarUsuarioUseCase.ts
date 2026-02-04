import type { IUsuarioRepository } from "../../../domain/repositories/IUsuarioRepository.js";
import { Usuario } from "../../../domain/entities/Usuario.js";
import { Email } from "../../../domain/value-objects/Email.js";
import { TipoPerfil } from "../../../domain/value-objects/TipoPerfil.js";
import type { PasswordHasher } from "../../../infrastructure/security/PasswordHasher.js";

export interface RegistrarUsuarioInput {
  nome: string;
  email: string;
  senha: string;
  tipoPerfil: string;
  escolaId?: string;
}

export interface RegistrarUsuarioOutput {
  usuarioId: string;
  nome: string;
  email: string;
  tipoPerfil: string;
}

export class RegistrarUsuarioUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async execute(
    input: RegistrarUsuarioInput,
  ): Promise<RegistrarUsuarioOutput> {
    const validacao = this.passwordHasher.validatePasswordStrength(input.senha);
    if (!validacao.isValid) {
      throw new Error(`Senha fraca: ${validacao.errors.join(", ")}`);
    }

    const emailJaExiste = await this.usuarioRepository.emailJaExiste(
      input.email,
    );
    if (emailJaExiste) {
      throw new Error("Email já cadastrado no sistema");
    }

    const email = Email.create(input.email);
    const tipoPerfil = TipoPerfil.fromString(input.tipoPerfil);

    const senhaHash = await this.passwordHasher.hash(input.senha);

    const usuario = Usuario.create(
      input.nome,
      email,
      tipoPerfil,
      senhaHash,
      input.escolaId,
    );

    await this.usuarioRepository.salvar(usuario);

    return {
      usuarioId: usuario.id!,
      nome: usuario.nome,
      email: usuario.email.enderecoEmail,
      tipoPerfil: usuario.tipoPerfil.tipo,
    };
  }
}
