import express from "express";

const router = express.Router();

// Exemplo de rotas relacionadas a usuários.
// Estas rotas estão simples de propósito, para servir como modelo.

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
