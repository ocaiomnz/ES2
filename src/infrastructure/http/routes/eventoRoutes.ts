import express from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaEventoRepository } from "../../database/PrismaEventoRepository.js";
import { PrismaCriancaRepository } from "../../database/PrismaCriancaRepository.js";
import { ManterCalendarioUseCase } from "../../../application/use-cases/equipeEscolar/ManterCalendarioUseCase.js";
import { VisualizarCalendarioUseCase } from "../../../application/use-cases/VisualizarCalendarioUseCase.js";
import { NotificacaoService } from "../../services/NotificacaoService.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();
const eventoRepository = new PrismaEventoRepository(prisma);
const criancaRepository = new PrismaCriancaRepository(prisma);
const notificacaoService = new NotificacaoService();

const manterCalendarioUseCase = new ManterCalendarioUseCase(eventoRepository, notificacaoService);
const visualizarCalendarioUseCase = new VisualizarCalendarioUseCase(
  criancaRepository,
  eventoRepository,
);

/**
 * @swagger
 * /eventos:
 *   post:
 *     summary: Criar evento no calendário
 *     description: Adiciona um novo evento ao calendário de uma criança. Requer perfil EQUIPE_ESCOLAR.
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarEventoInput'
 *     responses:
 *       201:
 *         description: Evento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Evento criado com sucesso
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/eventos", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Não autenticado",
        message: "Autenticação necessária",
      });
    }

    if (req.user.tipoPerfil !== "EQUIPE_ESCOLAR") {
      return res.status(403).json({
        error: "Acesso negado",
        message: "Apenas membros da equipe escolar podem criar eventos",
      });
    }

    const { criancaId, titulo, dataHoraInicio, dataHoraFim, nivelRisco } =
      req.body ?? {};

    if (!criancaId || !titulo || !dataHoraInicio || !dataHoraFim || !nivelRisco) {
      return res.status(400).json({
        error: "Dados incompletos",
        message:
          "criancaId, titulo, dataHoraInicio, dataHoraFim e nivelRisco são obrigatórios",
      });
    }

    await manterCalendarioUseCase.criar({
      criancaId,
      titulo,
      dataHoraInicio: new Date(dataHoraInicio),
      dataHoraFim: new Date(dataHoraFim),
      nivelRisco,
    });

    return res.status(201).json({
      message: "Evento criado com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao criar evento:", error);

    if (
      error instanceof Error &&
      (error.message.includes("obrigatório") ||
        error.message.includes("anterior") ||
        error.message.includes("Nível de risco inválido"))
    ) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Erro ao criar evento",
      message: "Erro interno do servidor",
    });
  }
});

/**
 * @swagger
 * /eventos/{id}:
 *   put:
 *     summary: Atualizar evento
 *     description: Atualiza os dados de um evento existente. Requer perfil EQUIPE_ESCOLAR.
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarEventoInput'
 *     responses:
 *       200:
 *         description: Evento atualizado com sucesso
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Erro interno do servidor
 */
router.put("/eventos/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Não autenticado",
        message: "Autenticação necessária",
      });
    }

    if (req.user.tipoPerfil !== "EQUIPE_ESCOLAR") {
      return res.status(403).json({
        error: "Acesso negado",
        message: "Apenas membros da equipe escolar podem editar eventos",
      });
    }

    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        error: "ID inválido",
        message: "ID do evento é obrigatório",
      });
    }

    const { titulo, dataHoraInicio, dataHoraFim, nivelRisco } = req.body ?? {};

    await manterCalendarioUseCase.atualizar({
      eventoId: id,
      titulo,
      dataHoraInicio: dataHoraInicio ? new Date(dataHoraInicio) : undefined,
      dataHoraFim: dataHoraFim ? new Date(dataHoraFim) : undefined,
      nivelRisco,
    });

    return res.status(200).json({
      message: "Evento atualizado com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao atualizar evento:", error);

    if (
      error instanceof Error &&
      error.message.includes("não encontrado")
    ) {
      return res.status(404).json({
        error: "Evento não encontrado",
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      (error.message.includes("obrigatório") ||
        error.message.includes("anterior") ||
        error.message.includes("vazio") ||
        error.message.includes("Nível de risco inválido"))
    ) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Erro ao atualizar evento",
      message: "Erro interno do servidor",
    });
  }
});

/**
 * @swagger
 * /eventos/{id}:
 *   delete:
 *     summary: Excluir evento
 *     description: Remove um evento do calendário. Requer perfil EQUIPE_ESCOLAR.
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Evento excluído com sucesso
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/eventos/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Não autenticado",
        message: "Autenticação necessária",
      });
    }

    if (req.user.tipoPerfil !== "EQUIPE_ESCOLAR") {
      return res.status(403).json({
        error: "Acesso negado",
        message: "Apenas membros da equipe escolar podem excluir eventos",
      });
    }

    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        error: "ID inválido",
        message: "ID do evento é obrigatório",
      });
    }

    await manterCalendarioUseCase.excluir(id);

    return res.status(200).json({
      message: "Evento excluído com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao excluir evento:", error);

    return res.status(500).json({
      error: "Erro ao excluir evento",
      message: "Erro interno do servidor",
    });
  }
});

/**
 * @swagger
 * /eventos/crianca/{criancaId}:
 *   get:
 *     summary: Listar eventos de uma criança
 *     description: Retorna todos os eventos do calendário de uma criança específica
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: criancaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da criança
 *     responses:
 *       200:
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eventos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Evento'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/eventos/crianca/:criancaId", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Não autenticado",
        message: "Autenticação necessária",
      });
    }

    const { criancaId } = req.params;

    if (!criancaId || typeof criancaId !== "string") {
      return res.status(400).json({
        error: "ID inválido",
        message: "ID da criança é obrigatório",
      });
    }

    const eventos = await visualizarCalendarioUseCase.execute(criancaId);

    return res.status(200).json({
      eventos,
    });
  } catch (error: any) {
    console.error("Erro ao listar eventos:", error);

    if (
      error instanceof Error &&
      error.message.includes("não encontrada")
    ) {
      return res.status(404).json({
        error: "Criança não encontrada",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Erro ao listar eventos",
      message: "Erro interno do servidor",
    });
  }
});

export default router;
