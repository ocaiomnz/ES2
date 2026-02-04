import type { ICriancaRepository } from "../../domain/repositories/ICriancaRepository.js";
import { RegistroCrise } from "../../domain/entities/RegistroCrise.js";
import { PedidoSuporte } from "../../domain/entities/PedidoSuporte.js";
import { IntensidadeDaCrise } from "../../domain/value-objects/Intensidade.js";
import type { INotificacaoService } from "../services/INotificacaoService.js";

export class SolicitarSuporteUseCase {
  constructor(
    private readonly criancaRepo: ICriancaRepository,
    private readonly notificacaoService?: INotificacaoService,
  ) {}

  public async execute(criancaId: string): Promise<void> {
    const agregadoOriginal = await this.criancaRepo.buscarPorId(criancaId);
    if (!agregadoOriginal) throw new Error("Criança não encontrada");

    let agregado = agregadoOriginal;

    const crisesNaoResolvidas = agregado.crises.filter(
      (c): c is RegistroCrise => c.foiEficaz === undefined,
    );

    let criseAtual: RegistroCrise;
    if (crisesNaoResolvidas.length > 0) {
      criseAtual = crisesNaoResolvidas[0] as RegistroCrise;
    } else {
      const agora = new Date();
      const intensidadePadrao = IntensidadeDaCrise.alta();
      const descricaoPadrao = "Botão de ajuda acionado";

      const novaCrise = RegistroCrise.create(
        agora,
        intensidadePadrao,
        descricaoPadrao,
      );
      agregado = agregado.adicionarCrise(novaCrise);
      criseAtual = novaCrise;
    }

    const descricaoPedido =
      criseAtual.descricao ?? "Botão de ajuda acionado";
    const pedido = PedidoSuporte.create(
      new Date(),
      criseAtual.intensidade,
      descricaoPedido,
    );
    (pedido as any)._registroCrise = criseAtual;

    const agregadoAtualizado = agregado.adicionarPedidoSuporte(pedido);
    await this.criancaRepo.salvar(agregadoAtualizado);

    if (this.notificacaoService) {
      await this.notificacaoService.notificarPedidoSuporte({
        criancaId,
        pedidoSuporteId: pedido.id,
        tipo: "SOS",
        dataHora: new Date(),
      });
    }
  }
}
