import { ValueObject } from "./ValueObject.js";

export enum StatusAtendimentoEnum {
  PENDENTE = "PENDENTE",
  EM_ATENDIMENTO = "EM_ATENDIMENTO",
  RESOLVIDO = "RESOLVIDO",
}

export class StatusAtendimento extends ValueObject {
  private readonly _status: StatusAtendimentoEnum;

  private constructor(status: StatusAtendimentoEnum) {
    super();
    this._status = status;
  }

  public static pendente(): StatusAtendimento {
    return new StatusAtendimento(StatusAtendimentoEnum.PENDENTE);
  }

  public static emAtendimento(): StatusAtendimento {
    return new StatusAtendimento(StatusAtendimentoEnum.EM_ATENDIMENTO);
  }

  public static resolvido(): StatusAtendimento {
    return new StatusAtendimento(StatusAtendimentoEnum.RESOLVIDO);
  }

  public static fromString(value: string): StatusAtendimento {
    const enumValue = value.toUpperCase() as StatusAtendimentoEnum;
    if (!Object.values(StatusAtendimentoEnum).includes(enumValue)) {
      throw new Error(`Status de atendimento inválido: ${value}`);
    }
    return new StatusAtendimento(enumValue);
  }

  public get status(): StatusAtendimentoEnum {
    return this._status;
  }

  public podeTransitarPara(novoStatus: StatusAtendimento): boolean {
    const transicoesValidas: Record<
      StatusAtendimentoEnum,
      StatusAtendimentoEnum[]
    > = {
      [StatusAtendimentoEnum.PENDENTE]: [StatusAtendimentoEnum.EM_ATENDIMENTO],
      [StatusAtendimentoEnum.EM_ATENDIMENTO]: [StatusAtendimentoEnum.RESOLVIDO],
      [StatusAtendimentoEnum.RESOLVIDO]: [],
    };
    return transicoesValidas[this._status].includes(novoStatus.status);
  }

  protected obterComponentesDeIgualdade(): Record<string, any> {
    return {
      status: this._status,
    };
  }
}
