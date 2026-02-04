import { ValueObject } from "./ValueObject.js";

export class Localizacao extends ValueObject {
  private constructor() {
    super();
  }

  public static criar(): Localizacao {
    throw new Error(
      "Localizacao está em desenvolvimento e será implementada em breve.",
    );
  }

  protected obterComponentesDeIgualdade(): Record<string, any> {
    throw new Error(
      "Localizacao está em desenvolvimento e será implementada em breve.",
    );
  }
}
