import type {
  INotificacaoService,
  NotificacaoMudancaRotinaPayload,
  NotificacaoPedidoSuportePayload,
} from "../../application/services/INotificacaoService.js";

export class NotificacaoService implements INotificacaoService {
  private notificacoesLog: Array<{
    tipo: string;
    payload: any;
    dataHora: Date;
  }> = [];

  public async notificarMudancaRotina(
    payload: NotificacaoMudancaRotinaPayload,
  ): Promise<void> {
    const notificacao = {
      tipo: "MUDANCA_ROTINA",
      criancaId: payload.criancaId,
      eventoId: payload.eventoId,
      nivelRisco: payload.nivelRisco,
      dataHoraEvento: payload.dataHoraEvento,
      mensagem: `Atenção: Mudança na rotina detectada com nível de risco ${payload.nivelRisco}`,
    };

    this.notificacoesLog.push({
      tipo: "MUDANCA_ROTINA",
      payload: notificacao,
      dataHora: new Date(),
    });

    console.log(`[NOTIFICAÇÃO] Mudança de Rotina:`, notificacao);

    // TODO: Implementar integração real com:
    // - WebSocket para notificações em tempo real
    // - Firebase Cloud Messaging (FCM) para push notifications
    // - SMS/Email para notificações críticas
  }

  public async notificarPedidoSuporte(
    payload: NotificacaoPedidoSuportePayload,
  ): Promise<void> {
    const notificacao = {
      tipo: "PEDIDO_SUPORTE",
      criancaId: payload.criancaId,
      pedidoSuporteId: payload.pedidoSuporteId,
      tipoPedido: payload.tipo,
      dataHora: payload.dataHora,
      mensagem:
        payload.tipo === "SOS"
          ? ` ALERTA: Botão SOS acionado pela criança ${payload.criancaId}`
          : `Crise detectada para criança ${payload.criancaId}`,
      prioridade: "ALTA",
    };

    this.notificacoesLog.push({
      tipo: "PEDIDO_SUPORTE",
      payload: notificacao,
      dataHora: new Date(),
    });

    console.log(`[NOTIFICAÇÃO CRÍTICA] Pedido de Suporte:`, notificacao);

    // TODO: Implementar integração real com:
    // - WebSocket para notificações imediatas
    // - Push notifications para responsáveis e equipe escolar
    // - Alertas sonoros/visuais na interface
  }

  public obterHistoricoNotificacoes(): Array<{
    tipo: string;
    payload: any;
    dataHora: Date;
  }> {
    return [...this.notificacoesLog];
  }

  public limparHistorico(): void {
    this.notificacoesLog = [];
  }
}
