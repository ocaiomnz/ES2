import { Entity } from "./Entity.js";
import { StatusAtendimento, Localizacao } from "../value-objects/index.js";
import { RegistroCrise } from "./RegistroCrise.js";
import { IntensidadeDaCrise } from "../value-objects/index.js";

export class PedidoSuporte extends Entity {
  private readonly _dataHora: Date;
  //private readonly _localizacao: Localizacao; TO-DO
  private _status: StatusAtendimento;
  private readonly _registroCrise: RegistroCrise;

  private constructor(
    id: string | undefined,
    dataHora: Date,
    //localizacao: Localizacao,
    status: StatusAtendimento,
    registroCrise: RegistroCrise,
  ) {
    super(id);
    this._dataHora = dataHora;
    //this._localizacao = localizacao; TO-DO
    this._status = status;
    this._registroCrise = registroCrise;
  }

  public static create(
    dataHora: Date,
    //localizacao: Localizacao,
    intensidade: IntensidadeDaCrise,
    descricaoCrise?: string,
  ): PedidoSuporte {
    if (dataHora > new Date()) {
      throw new Error("Data/hora não pode ser futura");
    }
    const registroCrise = RegistroCrise.create(
      dataHora,
      intensidade,
      descricaoCrise,
    );
    const status = StatusAtendimento.pendente();
    return new PedidoSuporte(
      undefined,
      dataHora,
      //localizacao,
      status,
      registroCrise,
    );
  }

  public static fromPersistence(input: {
    id?: string | undefined;
    dataHora: string;
    status: string;
    registroCrise: {
      id?: string | undefined;
      dataHora: string;
      intensidade: string;
      descricao?: string | undefined;
      gatilhoIdentificado?: string | undefined;
      foiEficaz?: boolean | undefined;
    };
  }): PedidoSuporte {
    const dataHora = new Date(input.dataHora);
    const status = StatusAtendimento.fromString(input.status);
    const registroCrise = RegistroCrise.fromPersistence(input.registroCrise);

    return new PedidoSuporte(input.id, dataHora, status, registroCrise);
  }

  public notificarSuporte(): void {
    console.log(`Notificação de suporte enviada para o pedido ${this._id}`);
  }

  public atualizarStatus(novoStatus: StatusAtendimento): void {
    if (!this._status.podeTransitarPara(novoStatus)) {
      throw new Error(
        `Transição inválida de ${this._status.status} para ${novoStatus.status}`,
      );
    }
    this._status = novoStatus;
  }

  public get dataHora(): Date {
    return this._dataHora;
  }

  // public get localizacao(): Localizacao {
  //   return this._localizacao; TO-DO
  // }

  public get status(): StatusAtendimento {
    return this._status;
  }

  public get registroCrise(): RegistroCrise {
    return this._registroCrise;
  }
}
