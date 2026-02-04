export interface NotificacaoMudancaRotinaPayload {
  criancaId: string;
  eventoId: string;
  nivelRisco?: string;
  dataHoraEvento: Date;
}

export interface NotificacaoPedidoSuportePayload {
  criancaId: string;
  pedidoSuporteId?: string;
  tipo: "SOS" | "CRISE";
  dataHora: Date;
}

export interface INotificacaoService {
  notificarMudancaRotina(
    payload: NotificacaoMudancaRotinaPayload,
  ): Promise<void>;
  notificarPedidoSuporte(
    payload: NotificacaoPedidoSuportePayload,
  ): Promise<void>;
}
