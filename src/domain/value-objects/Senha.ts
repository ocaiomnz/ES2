import { ValueObject } from "./ValueObject.js";

export class Senha extends ValueObject {
  private readonly _valor: string;

  private constructor(valor: string) {
    super();
    this._valor = valor;
  }

  public static criar(valor: string): Senha {
    if (!Senha.isStrongPassword(valor)) {
      throw new Error(
        "Senha deve ter pelo menos 8 caracteres, 1 maiúscula, 1 minúscula e 1 número",
      );
    }
    return new Senha(valor);
  }

  private static isStrongPassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    return (
      password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers
    );
  }

  public get valor(): string {
    return this._valor;
  }

  protected obterComponentesDeIgualdade(): Record<string, any> {
    return {
      valor: this._valor,
    };
  }
}
