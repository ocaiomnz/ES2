import { Crianca } from "../entities/Crianca.js";
import { RegistroCrise } from "../entities/RegistroCrise.js";
import { PedidoSuporte } from "../entities/PedidoSuporte.js";
import { Intervencao } from "../entities/Intervencao.js";
import { StatusAtendimentoEnum } from "../value-objects/StatusAtendimento.js";

export class AgregadoCrianca {
  private readonly _crianca: Crianca;
  private readonly _crises: RegistroCrise[];
  private readonly _pedidosSuporte: PedidoSuporte[];
  private readonly _intervencoes: Intervencao[];

  private constructor(
    crianca: Crianca,
    crises: RegistroCrise[],
    pedidosSuporte: PedidoSuporte[],
    intervencoes: Intervencao[],
  ) {
    this._crianca = crianca;
    this._crises = [...crises];
    this._pedidosSuporte = [...pedidosSuporte];
    this._intervencoes = [...intervencoes];
    this.validarInvariantes();
  }

  public static criar(crianca: Crianca): AgregadoCrianca {
    return new AgregadoCrianca(crianca, [], [], []);
  }

  public static fromPersistence(input: {
    crianca: Crianca;
    crises: RegistroCrise[];
    pedidosSuporte: PedidoSuporte[];
    intervencoes: Intervencao[];
  }): AgregadoCrianca {
    return new AgregadoCrianca(
      input.crianca,
      input.crises,
      input.pedidosSuporte,
      input.intervencoes,
    );
  }

  public adicionarCrise(crise: RegistroCrise): AgregadoCrianca {
    const crisesNaoResolvidas = this._crises.filter(
      (c) => c.foiEficaz === undefined,
    );
    if (crisesNaoResolvidas.length > 0) {
      throw new Error(
        "Não é possível adicionar uma nova crise: já existe uma crise em andamento",
      );
    }

    const novoAgregado = new AgregadoCrianca(
      this._crianca,
      [...this._crises, crise],
      this._pedidosSuporte,
      this._intervencoes,
    );
    return novoAgregado;
  }

  public adicionarPedidoSuporte(pedido: PedidoSuporte): AgregadoCrianca {
    const criseNaoResolvida = this._crises.find(
      (c) => c.foiEficaz === undefined,
    );
    if (!criseNaoResolvida) {
      throw new Error(
        "Não é possível adicionar pedido de suporte: não há crise não resolvida",
      );
    }

    const novoAgregado = new AgregadoCrianca(
      this._crianca,
      this._crises,
      [...this._pedidosSuporte, pedido],
      this._intervencoes,
    );
    return novoAgregado;
  }

  public adicionarIntervencao(intervencao: Intervencao): AgregadoCrianca {
    const novoAgregado = new AgregadoCrianca(
      this._crianca,
      this._crises,
      this._pedidosSuporte,
      [...this._intervencoes, intervencao],
    );
    return novoAgregado;
  }
  // TO-DO adicionar mais invariantes conforme regras de negócio

  private validarInvariantes(): void {
    // Invariante 1: Máximo uma crise não resolvida
    const crisesNaoResolvidas = this._crises.filter(
      (c) => c.foiEficaz === undefined,
    );
    if (crisesNaoResolvidas.length > 1) {
      throw new Error("Invariante violada: múltiplas crises não resolvidas");
    }

    // Invariante 2: Pedidos de suporte só com crises não resolvidas
    if (this._pedidosSuporte.length > 0 && crisesNaoResolvidas.length === 0) {
      throw new Error(
        "Invariante violada: pedidos de suporte sem crise não resolvida",
      );
    }
  }

  public get crianca(): Crianca {
    return this._crianca;
  }

  public get crises(): readonly RegistroCrise[] {
    return this._crises;
  }

  public get pedidosSuporte(): readonly PedidoSuporte[] {
    return this._pedidosSuporte;
  }

  public get intervencoes(): readonly Intervencao[] {
    return this._intervencoes;
  }
}
