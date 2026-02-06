import express from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /escolas:
 *   get:
 *     summary: Listar escolas
 *     description: Retorna a lista de escolas cadastradas (usado no formulário de registro)
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de escolas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 escolas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       nome:
 *                         type: string
 */
router.get("/escolas", async (req, res) => {
  try {
    const escolas = await prisma.escola.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    });
    return res.status(200).json({ escolas });
  } catch (error) {
    console.error("Erro ao listar escolas:", error);
    return res.status(500).json({
      error: "Erro ao listar escolas",
      message: "Erro interno do servidor",
    });
  }
});

/**
 * @swagger
 * /escolas:
 *   post:
 *     summary: Cadastrar nova escola
 *     description: Cria uma nova instituição de ensino
 *     tags: [Usuários]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome: { type: string }
 *               endereco: { type: string }
 *     responses:
 *       201:
 *         description: Escola cadastrada
 */
router.post("/escolas", async (req, res) => {
  try {
    const { nome, endereco } = req.body ?? {};
    if (!nome || !String(nome).trim()) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "Nome da escola é obrigatório",
      });
    }
    const now = new Date();
    const escola = await prisma.escola.create({
      data: {
        id: uuidv4(),
        nome: String(nome).trim(),
        endereco: endereco ? String(endereco).trim() : null,
        createdAt: now,
        updatedAt: now,
      },
    });
    return res.status(201).json({
      message: "Escola cadastrada com sucesso",
      escola: { id: escola.id, nome: escola.nome, endereco: escola.endereco },
    });
  } catch (error) {
    console.error("Erro ao cadastrar escola:", error);
    return res.status(500).json({
      error: "Erro ao cadastrar escola",
      message: "Erro interno do servidor",
    });
  }
});

/**
 * @swagger
 * /escolas/{id}:
 *   get:
 *     summary: Obter escola com professores
 *     description: Retorna dados da escola e lista de professores/equipe escolar vinculados
 *     tags: [Usuários]
 */
router.get("/escolas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const escola = await prisma.escola.findUnique({
      where: { id },
      include: {
        Usuario: {
          where: {
            tipoPerfil: { in: ["PROFESSOR", "EQUIPE_ESCOLAR"] },
          },
          select: { id: true, nome: true, email: true },
        },
      },
    });
    if (!escola) {
      return res.status(404).json({
        error: "Escola não encontrada",
        message: "Escola não encontrada",
      });
    }
    return res.status(200).json({
      escola: {
        id: escola.id,
        nome: escola.nome,
        endereco: escola.endereco,
        professores: escola.Usuario || [],
      },
    });
  } catch (error) {
    console.error("Erro ao obter escola:", error);
    return res.status(500).json({
      error: "Erro ao obter escola",
      message: "Erro interno do servidor",
    });
  }
});

export default router;
