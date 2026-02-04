import bcrypt from "bcryptjs";

export class PasswordHasher {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 10) {
    this.saltRounds = saltRounds;
  }

  public async hash(plainPassword: string): Promise<string> {
    if (!plainPassword || plainPassword.trim().length === 0) {
      throw new Error("Senha não pode ser vazia");
    }

    if (plainPassword.length < 6) {
      throw new Error("Senha deve ter no mínimo 6 caracteres");
    }

    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  public async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    if (!plainPassword || !hashedPassword) {
      return false;
    }

    return bcrypt.compare(plainPassword, hashedPassword);
  }

  public validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!password) {
      errors.push("Senha é obrigatória");
      return { isValid: false, errors };
    }

    if (password.length < 6) {
      errors.push("Senha deve ter no mínimo 6 caracteres");
    }

    if (password.length > 128) {
      errors.push("Senha deve ter no máximo 128 caracteres");
    }

    // Verificar se contém pelo menos uma letra
    if (!/[a-zA-Z]/.test(password)) {
      errors.push("Senha deve conter pelo menos uma letra");
    }

    // Verificar se contém pelo menos um número
    if (!/\d/.test(password)) {
      errors.push("Senha deve conter pelo menos um número");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
