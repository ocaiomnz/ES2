import express from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaCriancaRepository } from "../../database/PrismaCriancaRepository.js";
import { PrismaEventoRepository } from "../../database/PrismaEventoRepository.js";
import { PrismaAmbienteEscolarRepository } from "../../database/PrismaAmbienteEscolarRepository.js";
import { SolicitarSuporteUseCase } from "../../../application/use-cases/SolicitarSuporteUseCase.js";
import { VisualizarCalendarioUseCase } from "../../../application/use-cases/VisualizarCalendarioUseCase.js";
import { VisualizarAmbienteEscolarUseCase } from "../../../application/use-cases/VisualizarAmbienteEscolarUseCase.js";
import { NotificacaoService } from "../../services/NotificacaoService.js";

const router = express.Router();

const prisma = new PrismaClient();
const criancaRepo = new PrismaCriancaRepository(prisma);
const eventoRepo = new PrismaEventoRepository(prisma);
const ambienteRepo = new PrismaAmbienteEscolarRepository(prisma);
const notificacaoService = new NotificacaoService();

const solicitarSuporteUseCase = new SolicitarSuporteUseCase(criancaRepo, notificacaoService);
const visualizarCalendarioUseCase = new VisualizarCalendarioUseCase(
  criancaRepo,
  eventoRepo,
);
const visualizarAmbienteEscolarUseCase = new VisualizarAmbienteEscolarUseCase(
  criancaRepo,
  ambienteRepo,
);

/**
 * @swagger
 * /criancas/{id}/suporte:
 *   post:
 *     summary: Solicitar suporte para criança  
 *     description: |
 *       Registra um pedido de suporte para uma criança específica.
 *      
 *     tags: [Suporte]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da criança
 *     responses:
 *       201:
 *         description: Pedido de suporte registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pedido de suporte registrado com sucesso.
 *                 criancaId:
 *                   type: string
 *                   format: uuid
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/criancas/:id/suporte", async (req, res) => {
  const { id } = req.params;

  try {
    await solicitarSuporteUseCase.execute(id);
    return res.status(201).json({
      message: "Pedido de suporte registrado com sucesso.",
      criancaId: id,
    });
  } catch (err: any) {
    if (err instanceof Error && err.message === "Criança não encontrada") {
      return res.status(404).json({ error: err.message });
    }

    console.error("Erro ao solicitar suporte:", err);
    return res.status(500).json({
      error: "Erro ao processar solicitação de suporte.",
    });
  }
});

/**
 * @swagger
 * /criancas/{id}/calendario:
 *   get:
 *     summary: Visualizar calendário da criança
 *     description: Retorna todos os eventos do calendário de uma criança específica
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da criança
 *     responses:
 *       200:
 *         description: Calendário da criança
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 criancaId:
 *                   type: string
 *                   format: uuid
 *                 eventos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Evento'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/criancas/:id/calendario", async (req, res) => {
  const { id } = req.params;

  try {
    const eventos = await visualizarCalendarioUseCase.execute(id);
    return res.status(200).json({
      criancaId: id,
      eventos,
    });
  } catch (err: any) {
    if (err instanceof Error && err.message === "Criança não encontrada") {
      return res.status(404).json({ error: err.message });
    }

    console.error("Erro ao visualizar calendário:", err);
    return res.status(500).json({
      error: "Erro ao buscar calendário da criança.",
    });
  }
});

/**
 * @swagger
 * /criancas/{id}/ambientes:
 *   get:
 *     summary: Visualizar ambientes escolares da criança
 *     description: Retorna os ambientes da escola onde a criança está matriculada para familiarização
 *     tags: [Ambientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da criança
 *     responses:
 *       200:
 *         description: Ambientes escolares
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 criancaId:
 *                   type: string
 *                   format: uuid
 *                 ambientes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AmbienteEscolar'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/criancas/:id/ambientes", async (req, res) => {
  const { id } = req.params;

  try {
    const ambientes = await visualizarAmbienteEscolarUseCase.execute(id);
    return res.status(200).json({
      criancaId: id,
      ambientes,
    });
  } catch (err: any) {
    if (err instanceof Error && err.message === "Criança não encontrada") {
      return res.status(404).json({ error: err.message });
    }

    console.error("Erro ao visualizar ambientes:", err);
    return res.status(500).json({
      error: "Erro ao buscar ambientes escolares para a criança.",
    });
  }
});

export default router;
