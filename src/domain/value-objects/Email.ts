import { ValueObject } from "./ValueObject.js";

export class Email extends ValueObject {
  private readonly _enderecoEmail: string;

  private constructor(enderecoEmail: string) {
    super();
    this._enderecoEmail = enderecoEmail;
  }

  public static create(enderecoEmail: string): Email {
    if (!this.isValidEmail(enderecoEmail)) {
      throw new Error(`Email inválido: ${enderecoEmail}`);
    }
    return new Email(enderecoEmail);
  }

  private static isValidEmail(enderecoEmail: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(enderecoEmail);
  }

  public get enderecoEmail(): string {
    return this._enderecoEmail;
  }

  protected obterComponentesDeIgualdade(): Record<string, any> {
    return {
      enderecoEmail: this._enderecoEmail,
    };
  }
}
