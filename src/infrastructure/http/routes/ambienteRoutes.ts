import express from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaAmbienteEscolarRepository } from "../../database/PrismaAmbienteEscolarRepository.js";
import { PrismaCriancaRepository } from "../../database/PrismaCriancaRepository.js";
import { ManterAmbienteEscolarUseCase } from "../../../application/use-cases/equipeEscolar/ManterAmbienteEscolarUseCase.js";
import { VisualizarAmbienteEscolarUseCase } from "../../../application/use-cases/VisualizarAmbienteEscolarUseCase.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();
const ambienteRepository = new PrismaAmbienteEscolarRepository(prisma);
const criancaRepository = new PrismaCriancaRepository(prisma);

const manterAmbienteUseCase = new ManterAmbienteEscolarUseCase(
  ambienteRepository,
);
const visualizarAmbienteUseCase = new VisualizarAmbienteEscolarUseCase(
  criancaRepository,
  ambienteRepository,
);

/**
 * @swagger
 * /ambientes:
 *   post:
 *     summary: Criar ambiente escolar
 *     description: Cadastra um novo ambiente escolar para familiarização. Requer perfil EQUIPE_ESCOLAR.
 *     tags: [Ambientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarAmbienteInput'
 *     responses:
 *       201:
 *         description: Ambiente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ambiente criado com sucesso
 *                 ambiente:
 *                   $ref: '#/components/schemas/AmbienteEscolar'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/ambientes", authMiddleware, async (req, res) => {
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
        message: "Apenas membros da equipe escolar podem criar ambientes",
      });
    }

    const { escolaId, nome, descricao, midias } = req.body ?? {};

    if (!escolaId || !nome) {
      return res.status(400).json({
        error: "Dados incompletos",
        message: "escolaId e nome são obrigatórios",
      });
    }

    const ambiente = await manterAmbienteUseCase.criar({
      escolaId,
      nome,
      descricao,
      midias,
    });

    return res.status(201).json({
      message: "Ambiente criado com sucesso",
      ambiente: {
        id: ambiente.id,
        escolaId: ambiente.escolaId,
        nome: ambiente.nome,
        descricao: ambiente.descricao,
        midias: ambiente.midias,
      },
    });
  } catch (error: any) {
    console.error("Erro ao criar ambiente:", error);

    if (
      error instanceof Error &&
      error.message.includes("obrigatório")
    ) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Erro ao criar ambiente",
      message: "Erro interno do servidor",
    });
  }
});

/**
 * @swagger
 * /ambientes/{id}:
 *   put:
 *     summary: Atualizar ambiente escolar
 *     description: Atualiza os dados de um ambiente existente. Requer perfil EQUIPE_ESCOLAR.
 *     tags: [Ambientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do ambiente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarAmbienteInput'
 *     responses:
 *       200:
 *         description: Ambiente atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ambiente:
 *                   $ref: '#/components/schemas/AmbienteEscolar'
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
router.put("/ambientes/:id", authMiddleware, async (req, res) => {
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
        message: "Apenas membros da equipe escolar podem editar ambientes",
      });
    }

    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        error: "ID inválido",
        message: "ID do ambiente é obrigatório",
      });
    }

    const { nome, descricao, midias } = req.body ?? {};

    const ambiente = await manterAmbienteUseCase.atualizar({
      ambienteId: id,
      nome,
      descricao,
      midias,
    });

    return res.status(200).json({
      message: "Ambiente atualizado com sucesso",
      ambiente: {
        id: ambiente.id,
        escolaId: ambiente.escolaId,
        nome: ambiente.nome,
        descricao: ambiente.descricao,
        midias: ambiente.midias,
      },
    });
  } catch (error: any) {
    console.error("Erro ao atualizar ambiente:", error);

    if (
      error instanceof Error &&
      error.message.includes("não encontrado")
    ) {
      return res.status(404).json({
        error: "Ambiente não encontrado",
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      (error.message.includes("obrigatório") ||
        error.message.includes("vazio"))
    ) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Erro ao atualizar ambiente",
      message: "Erro interno do servidor",
    });
  }
});

/**
 * @swagger
 * /ambientes/{id}:
 *   delete:
 *     summary: Excluir ambiente escolar
 *     description: Remove um ambiente escolar. Requer perfil EQUIPE_ESCOLAR.
 *     tags: [Ambientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do ambiente
 *     responses:
 *       200:
 *         description: Ambiente excluído com sucesso
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/ambientes/:id", authMiddleware, async (req, res) => {
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
        message: "Apenas membros da equipe escolar podem excluir ambientes",
      });
    }

    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        error: "ID inválido",
        message: "ID do ambiente é obrigatório",
      });
    }

    await manterAmbienteUseCase.excluir(id);

    return res.status(200).json({
      message: "Ambiente excluído com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao excluir ambiente:", error);

    return res.status(500).json({
      error: "Erro ao excluir ambiente",
      message: "Erro interno do servidor",
    });
  }
});

/**
 * @swagger
 * /ambientes/crianca/{criancaId}:
 *   get:
 *     summary: Listar ambientes da escola de uma criança
 *     description: Retorna todos os ambientes da escola onde a criança está matriculada
 *     tags: [Ambientes]
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
 *         description: Lista de ambientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ambientes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AmbienteEscolar'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/ambientes/crianca/:criancaId", authMiddleware, async (req, res) => {
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

    const ambientes = await visualizarAmbienteUseCase.execute(criancaId);

    return res.status(200).json({
      ambientes,
    });
  } catch (error: any) {
    console.error("Erro ao listar ambientes:", error);

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
      error: "Erro ao listar ambientes",
      message: "Erro interno do servidor",
    });
  }
});

export default router;
