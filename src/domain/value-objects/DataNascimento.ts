import { ValueObject } from "./ValueObject.js";


export class DataNascimento extends ValueObject {
  private readonly _data: Date;

  private constructor(data: Date) {
    super();
    this._data = new Date(data); 
  }

  public static create(
    data: Date,
    idadeMinima: number = 0,
    idadeMaxima: number = 18,
  ): DataNascimento {
    const hoje = new Date();
    if (data > hoje) {
      throw new Error("Data de nascimento não pode ser futura");
    }
    const idade = hoje.getFullYear() - data.getFullYear();
    if (idade < idadeMinima) {
      throw new Error(`Idade mínima é ${idadeMinima} anos`);
    }
    if (idade > idadeMaxima) {
      throw new Error(`Idade máxima é ${idadeMaxima} anos`);
    }
    return new DataNascimento(data);
  }

  public get data(): Date {
    return new Date(this._data); 
  }

  public calcularIdade(): number {
    const hoje = new Date();
    let idade = hoje.getFullYear() - this._data.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = this._data.getMonth();
    if (
      mesAtual < mesNascimento ||
      (mesAtual === mesNascimento && hoje.getDate() < this._data.getDate())
    ) {
      idade--;
    }
    return idade;
  }

  protected obterComponentesDeIgualdade(): Record<string, any> {
    return {
      data: this._data.getTime(),
    };
  }
}
