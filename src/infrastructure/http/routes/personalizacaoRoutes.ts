import express from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPersonalizacaoSensorialRepository } from "../../database/PrismaPersonalizacaoSensorialRepository.js";
import { PrismaCriancaRepository } from "../../database/PrismaCriancaRepository.js";
import { PrismaUsuarioRepository } from "../../database/PrismaUsuarioRepository.js";
import { GerenciarPersonalizacaoSensorialUseCase } from "../../../application/use-cases/GerenciarPersonalizacaoSensorialUseCase.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();
const personalizacaoRepo = new PrismaPersonalizacaoSensorialRepository(prisma);
const criancaRepo = new PrismaCriancaRepository(prisma);
const usuarioRepo = new PrismaUsuarioRepository(prisma);

const gerenciarPersonalizacaoUseCase = new GerenciarPersonalizacaoSensorialUseCase(
  personalizacaoRepo,
  criancaRepo,
  usuarioRepo,
);

/**
 * @swagger
 * /personalizacao/crianca/{criancaId}:
 *   get:
 *     summary: Obter personalização sensorial
 *     description: |
 *       Retorna as configurações de personalização sensorial de uma criança.
 *       Inclui preferências de cores, fontes, sons, animações e contraste.
 *       Se não existir, cria uma configuração padrão automaticamente.
 *     tags: [Personalização]
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
 *         description: Configurações de personalização
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 personalizacao:
 *                   $ref: '#/components/schemas/PersonalizacaoSensorial'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/personalizacao/crianca/:criancaId", authMiddleware, async (req, res) => {
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

    const personalizacao = await gerenciarPersonalizacaoUseCase.obter(
      req.user.userId,
      criancaId,
    );

    return res.status(200).json({
      personalizacao,
    });
  } catch (error: any) {
    console.error("Erro ao obter personalização:", error);

    if (
      error instanceof Error &&
      error.message.includes("não encontrad")
    ) {
      return res.status(404).json({
        error: "Não encontrado",
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message.includes("Permissão negada")
    ) {
      return res.status(403).json({
        error: "Acesso negado",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Erro ao obter personalização",
      message: "Erro interno do servidor",
    });
  }
});

/**
 * @swagger
 * /personalizacao/crianca/{criancaId}:
 *   put:
 *     summary: Atualizar personalização sensorial
 *     description: |
 *       Atualiza as configurações de acessibilidade sensorial de uma criança.
 *       Permite configurar paleta de cores, tamanho de fonte, ícones,
 *       sons, animações e modo de alto contraste.
 *     tags: [Personalização]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PersonalizacaoInput'
 *     responses:
 *       200:
 *         description: Personalização atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Personalização atualizada com sucesso
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
router.put("/personalizacao/crianca/:criancaId", authMiddleware, async (req, res) => {
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

    const { paletaCores, tamanhoFonte, icones, sons, animacoes, contrasteAlto } =
      req.body ?? {};

    await gerenciarPersonalizacaoUseCase.atualizar({
      usuarioId: req.user.userId,
      criancaId,
      paletaCores,
      tamanhoFonte,
      icones,
      sons,
      animacoes,
      contrasteAlto,
    });

    return res.status(200).json({
      message: "Personalização atualizada com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao atualizar personalização:", error);

    if (
      error instanceof Error &&
      error.message.includes("não encontrad")
    ) {
      return res.status(404).json({
        error: "Não encontrado",
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message.includes("Permissão negada")
    ) {
      return res.status(403).json({
        error: "Acesso negado",
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message.includes("inválid")
    ) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Erro ao atualizar personalização",
      message: "Erro interno do servidor",
    });
  }
});

export default router;
