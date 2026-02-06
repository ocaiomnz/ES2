import express from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaCriancaRepository } from "../../database/PrismaCriancaRepository.js";
import { PrismaUsuarioRepository } from "../../database/PrismaUsuarioRepository.js";
import { CriarCriancaUseCase } from "../../../application/use-cases/CriarCriancaUseCase.js";
import { VisualizarCriancaUseCase } from "../../../application/use-cases/VisualizarCriancaUseCase.js";
import { EditarCriancaUseCase } from "../../../application/use-cases/ManterPerfilCriancaUseCase.js";
import { ExcluirCriancaUseCase } from "../../../application/use-cases/ExcluirCriancaUseCase.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();
const criancaRepo = new PrismaCriancaRepository(prisma);
const usuarioRepo = new PrismaUsuarioRepository(prisma);

const criarCriancaUseCase = new CriarCriancaUseCase(criancaRepo, usuarioRepo);
const visualizarCriancaUseCase = new VisualizarCriancaUseCase(
  criancaRepo,
  usuarioRepo
);
const editarCriancaUseCase = new EditarCriancaUseCase(criancaRepo, usuarioRepo);
const excluirCriancaUseCase = new ExcluirCriancaUseCase(
  criancaRepo,
  usuarioRepo
);

/**
 * @swagger
 * /perfis/criancas:
 *   post:
 *     summary: Cadastrar nova criança
 *     description: Cria um novo perfil de criança. Professores precisam estar vinculados a uma escola.
 *     tags: [Perfis de Crianças]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarCriancaInput'
 *     responses:
 *       201:
 *         description: Criança cadastrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Criança cadastrada com sucesso
 *                 criancaId:
 *                   type: string
 *                   format: uuid
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/perfis/criancas", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Não autenticado",
        message: "Autenticação necessária",
      });
    }

    const {
      nome,
      dataNascimento,
      grauTEA,
      grauSuporte,
      escolaId,
      responsavelIds,
    } = req.body ?? {};

    if (!dataNascimento || !grauTEA || !grauSuporte) {
      return res.status(400).json({
        error: "Dados incompletos",
        message: "dataNascimento, grauTEA e grauSuporte são obrigatórios",
      });
    }

    const criancaId = await criarCriancaUseCase.execute({
      usuarioId: req.user.userId,
      nome: nome ? String(nome).trim() : undefined,
      dataNascimento: new Date(dataNascimento),
      grauTEA,
      grauSuporte,
      escolaId,
      responsavelIds,
    });

    return res.status(201).json({
      message: "Criança cadastrada com sucesso",
      criancaId,
    });
  } catch (error: any) {
    console.error("Erro ao criar criança:", error);

    if (
      error instanceof Error &&
      (error.message.includes("Permissão negada") ||
        error.message.includes("obrigatório") ||
        error.message.includes("inválid"))
    ) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Erro ao criar criança",
      message: "Erro interno do servidor",
    });
  }
});

/**
 * @swagger
 * /perfis/criancas:
 *   get:
 *     summary: Listar crianças
 *     description: |
 *       Retorna a lista de crianças que o usuário pode visualizar:
 *       - ADMIN: todas as crianças
 *       - PROFESSOR: crianças da mesma escola
 *       - RESPONSAVEL: apenas crianças vinculadas
 *     tags: [Perfis de Crianças]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de crianças
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 criancas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Crianca'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/perfis/criancas", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Não autenticado",
        message: "Autenticação necessária",
      });
    }

    const criancas = await visualizarCriancaUseCase.listarPorUsuario(
      req.user.userId
    );

    return res.status(200).json({
      criancas,
    });
  } catch (error: any) {
    console.error("Erro ao listar crianças:", error);

    return res.status(500).json({
      error: "Erro ao listar crianças",
      message: "Erro interno do servidor",
    });
  }
});

/**
 * @swagger
 * /perfis/criancas/{id}:
 *   get:
 *     summary: Obter perfil de criança
 *     description: Retorna os dados de uma criança específica
 *     tags: [Perfis de Crianças]
 *     security:
 *       - bearerAuth: []
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
 *         description: Dados da criança
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 crianca:
 *                   $ref: '#/components/schemas/Crianca'
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
/**
 * @swagger
 * /perfis/criancas/{id}/resumo:
 *   get:
 *     summary: Resumo completo da criança
 *     description: Retorna criança, escola, professores e histórico de crises (para painel do responsável)
 *     tags: [Perfis de Crianças]
 *     security:
 *       - bearerAuth: []
 */
router.get("/perfis/criancas/:id/resumo", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Não autenticado",
        message: "Autenticação necessária",
      });
    }

    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        error: "ID inválido",
        message: "ID da criança é obrigatório",
      });
    }

    const crianca = await visualizarCriancaUseCase.execute(req.user.userId, id);

    let escola = null;
    let professores: { id: string; nome: string; email: string }[] = [];
    let responsaveis: { id: string; nome: string; email: string }[] = [];

    if (crianca.responsavelIds && crianca.responsavelIds.length > 0) {
      const responsaveisDb = await prisma.usuario.findMany({
        where: { id: { in: crianca.responsavelIds } },
        select: { id: true, nome: true, email: true },
      });
      responsaveis = responsaveisDb.map((u) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
      }));
    }

    if (crianca.escolaId) {
      const escolaDb = await prisma.escola.findUnique({
        where: { id: crianca.escolaId },
        include: {
          Usuario: {
            where: {
              tipoPerfil: { in: ["PROFESSOR", "EQUIPE_ESCOLAR"] },
            },
            select: { id: true, nome: true, email: true },
          },
        },
      });
      if (escolaDb) {
        escola = {
          id: escolaDb.id,
          nome: escolaDb.nome,
          endereco: escolaDb.endereco,
        };
        professores = escolaDb.Usuario || [];
      }
    }

    const crisesDb = await prisma.registroCrise.findMany({
      where: { criancaId: id },
      orderBy: { dataHora: "desc" },
    });

    const crises = crisesDb.map((c) => ({
      id: c.id,
      dataHora: c.dataHora.toISOString(),
      intensidade: c.intensidade,
      descricao: c.descricao,
      gatilhoIdentificado: c.gatilhoIdentificado,
      foiEficaz: c.foiEficaz,
    }));

    return res.status(200).json({
      crianca,
      escola,
      professores,
      responsaveis,
      crises,
    });
  } catch (error: any) {
    if (
      error instanceof Error &&
      (error.message.includes("não encontrad") ||
        error.message.includes("Permissão negada"))
    ) {
      const status = error.message.includes("não encontrad") ? 404 : 403;
      return res.status(status).json({
        error: status === 404 ? "Não encontrado" : "Acesso negado",
        message: error.message,
      });
    }
    console.error("Erro ao obter resumo da criança:", error);
    return res.status(500).json({
      error: "Erro ao obter resumo",
      message: "Erro interno do servidor",
    });
  }
});

router.get("/perfis/criancas/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Não autenticado",
        message: "Autenticação necessária",
      });
    }

    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        error: "ID inválido",
        message: "ID da criança é obrigatório",
      });
    }

    const crianca = await visualizarCriancaUseCase.execute(req.user.userId, id);

    return res.status(200).json({
      crianca,
    });
  } catch (error: any) {
    console.error("Erro ao visualizar criança:", error);

    if (error instanceof Error && error.message.includes("não encontrad")) {
      return res.status(404).json({
        error: "Não encontrado",
        message: error.message,
      });
    }

    if (error instanceof Error && error.message.includes("Permissão negada")) {
      return res.status(403).json({
        error: "Acesso negado",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Erro ao visualizar criança",
      message: "Erro interno do servidor",
    });
  }
});

/**
 * @swagger
 * /perfis/criancas/{id}:
 *   put:
 *     summary: Atualizar perfil de criança
 *     description: Atualiza os dados de uma criança. Todos os campos são opcionais.
 *     tags: [Perfis de Crianças]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             $ref: '#/components/schemas/AtualizarCriancaInput'
 *     responses:
 *       200:
 *         description: Criança atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Criança atualizada com sucesso
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
router.put("/perfis/criancas/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Não autenticado",
        message: "Autenticação necessária",
      });
    }

    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        error: "ID inválido",
        message: "ID da criança é obrigatório",
      });
    }

    const {
      nome,
      dataNascimento,
      grauTEA,
      grauSuporte,
      escolaId,
      responsavelIds,
    } = req.body ?? {};

    const input: any = {
      usuarioId: req.user.userId,
      criancaId: id,
    };

    if (nome !== undefined) {
      input.nome = nome ? String(nome).trim() : undefined;
    }

    if (dataNascimento) {
      input.dataNascimento = new Date(dataNascimento);
    }

    if (grauTEA) {
      input.grauTEA = grauTEA;
    }

    if (grauSuporte) {
      input.grauSuporte = grauSuporte;
    }

    if (escolaId !== undefined) {
      input.escolaId = escolaId;
    }

    if (responsavelIds !== undefined) {
      input.responsavelIds = responsavelIds;
    }

    await editarCriancaUseCase.execute(input);

    return res.status(200).json({
      message: "Criança atualizada com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao editar criança:", error);

    if (error instanceof Error && error.message.includes("não encontrad")) {
      return res.status(404).json({
        error: "Não encontrado",
        message: error.message,
      });
    }

    if (error instanceof Error && error.message.includes("Permissão negada")) {
      return res.status(403).json({
        error: "Acesso negado",
        message: error.message,
      });
    }

    if (error instanceof Error && error.message.includes("inválid")) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Erro ao editar criança",
      message: "Erro interno do servidor",
    });
  }
});

/**
 * @swagger
 * /perfis/criancas/{id}/vincular-usuario:
 *   put:
 *     summary: Vincular usuário CRIANCA ao perfil
 *     description: Associa um usuário com perfil CRIANCA ao perfil da criança. Permite que a criança faça login e acesse sua tela com criancaId já definido.
 *     tags: [Perfis de Crianças]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/perfis/criancas/:id/vincular-usuario",
  authMiddleware,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Não autenticado",
          message: "Autenticação necessária",
        });
      }

      const { id } = req.params;
      const { usuarioId } = req.body ?? {};

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          error: "ID inválido",
          message: "ID da criança é obrigatório",
        });
      }

      if (!usuarioId || typeof usuarioId !== "string") {
        return res.status(400).json({
          error: "Dados incompletos",
          message: "usuarioId é obrigatório",
        });
      }

      await visualizarCriancaUseCase.execute(req.user.userId, id);

      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
      });
      if (!usuario || usuario.tipoPerfil !== "CRIANCA") {
        return res.status(400).json({
          error: "Usuário inválido",
          message: "O usuário deve ter perfil CRIANCA",
        });
      }

      await prisma.crianca.update({
        where: { id },
        data: { usuarioId },
      });

      return res.status(200).json({
        message: "Usuário vinculado com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao vincular usuário:", error);

      if (error instanceof Error && error.message.includes("não encontrad")) {
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
        error: "Erro ao vincular usuário",
        message: "Erro interno do servidor",
      });
    }
  }
);

/**
 * @swagger
 * /perfis/criancas/{id}:
 *   delete:
 *     summary: Excluir perfil de criança
 *     description: Remove o perfil de uma criança. Requer permissão de ADMIN ou PROFESSOR da mesma escola.
 *     tags: [Perfis de Crianças]
 *     security:
 *       - bearerAuth: []
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
 *         description: Criança excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Criança excluída com sucesso
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/perfis/criancas/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Não autenticado",
        message: "Autenticação necessária",
      });
    }

    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        error: "ID inválido",
        message: "ID da criança é obrigatório",
      });
    }

    await excluirCriancaUseCase.execute(req.user.userId, id);

    return res.status(200).json({
      message: "Criança excluída com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao excluir criança:", error);

    if (error instanceof Error && error.message.includes("não encontrad")) {
      return res.status(404).json({
        error: "Não encontrado",
        message: error.message,
      });
    }

    if (error instanceof Error && error.message.includes("Permissão negada")) {
      return res.status(403).json({
        error: "Acesso negado",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Erro ao excluir criança",
      message: "Erro interno do servidor",
    });
  }
});

export default router;
