import express from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaUsuarioRepository } from "../../database/PrismaUsuarioRepository.js";
import { PasswordHasher } from "../../security/PasswordHasher.js";
import { RegistrarUsuarioUseCase } from "../../../application/use-cases/auth/RegistrarUsuarioUseCase.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();
const usuarioRepository = new PrismaUsuarioRepository(prisma);
const passwordHasher = new PasswordHasher();
const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(
  usuarioRepository,
  passwordHasher
);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cadastrar responsável (escola)
 *     description: |
 *       Cria um novo usuário com perfil RESPONSAVEL.
 *       Apenas EQUIPE_ESCOLAR, PROFESSOR ou ADMIN podem criar.
 *       Usado pela escola ao cadastrar pais/responsáveis das crianças.
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senha]
 *             properties:
 *               nome: { type: string }
 *               email: { type: string, format: email }
 *               senha: { type: string, minLength: 6 }
 *     responses:
 *       201:
 *         description: Responsável cadastrado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post("/usuarios", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Não autenticado",
        message: "Autenticação necessária",
      });
    }
    const perfil = (req.user.tipoPerfil || "").toUpperCase();
    const permitidos = ["EQUIPE_ESCOLAR", "PROFESSOR", "ADMIN"];
    if (!permitidos.includes(perfil)) {
      return res.status(403).json({
        error: "Acesso negado",
        message: "Apenas equipe escolar pode cadastrar responsáveis",
      });
    }
    const { nome, email, senha } = req.body ?? {};
    if (!nome || !email || !senha) {
      return res.status(400).json({
        error: "Dados incompletos",
        message: "Nome, email e senha são obrigatórios",
      });
    }
    const resultado = await registrarUsuarioUseCase.execute({
      nome: String(nome).trim(),
      email: String(email).trim(),
      senha,
      tipoPerfil: "RESPONSAVEL",
    });
    return res.status(201).json({
      message: "Responsável cadastrado com sucesso",
      usuario: {
        usuarioId: resultado.usuarioId,
        nome: resultado.nome,
        email: resultado.email,
        tipoPerfil: resultado.tipoPerfil,
      },
    });
  } catch (error: any) {
    console.error("Erro ao cadastrar responsável:", error);
    if (
      error instanceof Error &&
      (error.message.includes("Email já cadastrado") ||
        error.message.includes("Senha fraca") ||
        error.message.includes("Email inválido"))
    ) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: error.message,
      });
    }
    return res.status(500).json({
      error: "Erro ao cadastrar responsável",
      message: "Erro interno do servidor",
    });
  }
});

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listar usuários (placeholder)
 *     description: |
 *       **Endpoint não implementado.**
 *       Esta rota está reservada para futura implementação de listagem de usuários.
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Mensagem de placeholder
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Listar usuários ainda não implementado.
 */
router.get("/usuarios", (req, res) => {
  res.json({
    message: "Listar usuários ainda não implementado.",
  });
});

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obter usuário por ID (placeholder)
 *     description: |
 *       **Endpoint não implementado.**
 *       Esta rota está reservada para futura implementação de detalhes do usuário.
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Mensagem de placeholder
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Detalhes de usuário ainda não implementado.
 *                 id:
 *                   type: string
 *                   format: uuid
 */
router.get("/usuarios/:id", (req, res) => {
  const { id } = req.params;
  res.json({
    message: "Detalhes de usuário ainda não implementado.",
    id,
  });
});

export default router;
