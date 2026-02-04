import express from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaEventoRepository } from "../../database/PrismaEventoRepository.js";
import { PrismaAmbienteEscolarRepository } from "../../database/PrismaAmbienteEscolarRepository.js";
import { NotificacaoService } from "../../services/NotificacaoService.js";
import {
  ManterCalendarioUseCase,
  type CriarEventoCalendarioInput,
  type AtualizarEventoCalendarioInput,
} from "../../../application/use-cases/equipeEscolar/ManterCalendarioUseCase.js";
import {
  ManterAmbienteEscolarUseCase,
  type CriarAmbienteEscolarInput,
  type AtualizarAmbienteEscolarInput,
} from "../../../application/use-cases/equipeEscolar/ManterAmbienteEscolarUseCase.js";

const router = express.Router();

const prisma = new PrismaClient();
const eventoRepo = new PrismaEventoRepository(prisma);
const ambienteRepo = new PrismaAmbienteEscolarRepository(prisma);
const notificacaoService = new NotificacaoService();

const manterCalendarioUseCase = new ManterCalendarioUseCase(eventoRepo, notificacaoService);
const manterAmbienteEscolarUseCase = new ManterAmbienteEscolarUseCase(
  ambienteRepo,
);

/**
 * @swagger
 * /equipe-escolar/criancas/{criancaId}/eventos:
 *   post:
 *     summary: Criar evento para criança (Equipe Escolar)
 *     description: Adiciona um novo evento ao calendário de uma criança. Rota alternativa para equipe escolar.
 *     tags: [Equipe Escolar]
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
 *             type: object
 *             required: [titulo, dataHoraInicio, dataHoraFim, nivelRisco]
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Aula de Matemática
 *               dataHoraInicio:
 *                 type: string
 *                 format: date-time
 *               dataHoraFim:
 *                 type: string
 *                 format: date-time
 *               nivelRisco:
 *                 $ref: '#/components/schemas/NivelRisco'
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
 *                 criancaId:
 *                   type: string
 *                   format: uuid
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/equipe-escolar/criancas/:criancaId/eventos", async (req, res) => {
  const { criancaId } = req.params;
  const { titulo, dataHoraInicio, dataHoraFim, nivelRisco } = req.body ?? {};

  try {
    const input: CriarEventoCalendarioInput = {
      criancaId,
      titulo,
      dataHoraInicio: new Date(dataHoraInicio),
      dataHoraFim: new Date(dataHoraFim),
      nivelRisco,
    };

    await manterCalendarioUseCase.criar(input);

    return res.status(201).json({
      message: "Evento criado com sucesso.",
      criancaId,
    });
  } catch (err: any) {
    console.error("Erro ao criar evento de calendário:", err);
    return res.status(400).json({
      error: err instanceof Error ? err.message : "Erro ao criar evento.",
    });
  }
});

/**
 * @swagger
 * /equipe-escolar/eventos/{eventoId}:
 *   put:
 *     summary: Atualizar evento (Equipe Escolar)
 *     description: Atualiza os dados de um evento existente
 *     tags: [Equipe Escolar]
 *     parameters:
 *       - in: path
 *         name: eventoId
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
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Erro interno do servidor
 */
router.put("/equipe-escolar/eventos/:eventoId", async (req, res) => {
  const { eventoId } = req.params;
  const { titulo, dataHoraInicio, dataHoraFim, nivelRisco } = req.body ?? {};

  try {
    const input: AtualizarEventoCalendarioInput = {
      eventoId,
      titulo,
      dataHoraInicio: dataHoraInicio ? new Date(dataHoraInicio) : undefined,
      dataHoraFim: dataHoraFim ? new Date(dataHoraFim) : undefined,
      nivelRisco,
    };

    await manterCalendarioUseCase.atualizar(input);

    return res.status(200).json({
      message: "Evento atualizado com sucesso.",
      eventoId,
    });
  } catch (err: any) {
    if (err instanceof Error && err.message.includes("não encontrado")) {
      return res.status(404).json({ error: err.message });
    }

    console.error("Erro ao atualizar evento de calendário:", err);
    return res.status(400).json({
      error: err instanceof Error ? err.message : "Erro ao atualizar evento.",
    });
  }
});

/**
 * @swagger
 * /equipe-escolar/eventos/{eventoId}:
 *   delete:
 *     summary: Excluir evento (Equipe Escolar)
 *     description: Remove um evento do calendário
 *     tags: [Equipe Escolar]
 *     parameters:
 *       - in: path
 *         name: eventoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do evento
 *     responses:
 *       204:
 *         description: Evento excluído com sucesso
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/equipe-escolar/eventos/:eventoId", async (req, res) => {
  const { eventoId } = req.params;

  try {
    await manterCalendarioUseCase.excluir(eventoId);

    return res.status(204).send();
  } catch (err: any) {
    console.error("Erro ao excluir evento de calendário:", err);
    return res.status(400).json({
      error: err instanceof Error ? err.message : "Erro ao excluir evento.",
    });
  }
});

/**
 * @swagger
 * /equipe-escolar/escolas/{escolaId}/ambientes:
 *   post:
 *     summary: Criar ambiente escolar (Equipe Escolar)
 *     description: Cadastra um novo ambiente em uma escola para familiarização das crianças
 *     tags: [Equipe Escolar]
 *     parameters:
 *       - in: path
 *         name: escolaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da escola
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Biblioteca
 *               descricao:
 *                 type: string
 *                 example: Biblioteca principal da escola
 *               midias:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: URLs de imagens/vídeos do ambiente
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
 *                 ambiente:
 *                   $ref: '#/components/schemas/AmbienteEscolar'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/equipe-escolar/escolas/:escolaId/ambientes", async (req, res) => {
  const { escolaId } = req.params;
  const { nome, descricao, midias } = req.body ?? {};

  try {
    const input: CriarAmbienteEscolarInput = {
      escolaId,
      nome,
      descricao,
      midias,
    };

    const ambiente = await manterAmbienteEscolarUseCase.criar(input);

    return res.status(201).json({
      message: "Ambiente escolar criado com sucesso.",
      ambiente: {
        id: ambiente.id,
        escolaId: ambiente.escolaId,
        nome: ambiente.nome,
        descricao: ambiente.descricao ?? undefined,
        midias: ambiente.midias ?? undefined,
      },
    });
  } catch (err: any) {
    console.error("Erro ao criar ambiente escolar:", err);
    return res.status(400).json({
      error:
        err instanceof Error ? err.message : "Erro ao criar ambiente escolar.",
    });
  }
});

/**
 * @swagger
 * /equipe-escolar/ambientes/{ambienteId}:
 *   put:
 *     summary: Atualizar ambiente escolar (Equipe Escolar)
 *     description: Atualiza os dados de um ambiente existente
 *     tags: [Equipe Escolar]
 *     parameters:
 *       - in: path
 *         name: ambienteId
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
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Erro interno do servidor
 */
router.put("/equipe-escolar/ambientes/:ambienteId", async (req, res) => {
  const { ambienteId } = req.params;
  const { nome, descricao, midias } = req.body ?? {};

  try {
    const input: AtualizarAmbienteEscolarInput = {
      ambienteId,
      nome,
      descricao,
      midias,
    };

    const ambiente = await manterAmbienteEscolarUseCase.atualizar(input);

    return res.status(200).json({
      message: "Ambiente escolar atualizado com sucesso.",
      ambiente: {
        id: ambiente.id,
        escolaId: ambiente.escolaId,
        nome: ambiente.nome,
        descricao: ambiente.descricao ?? undefined,
        midias: ambiente.midias ?? undefined,
      },
    });
  } catch (err: any) {
    if (err instanceof Error && err.message.includes("não encontrado")) {
      return res.status(404).json({ error: err.message });
    }

    console.error("Erro ao atualizar ambiente escolar:", err);
    return res.status(400).json({
      error:
        err instanceof Error
          ? err.message
          : "Erro ao atualizar ambiente escolar.",
    });
  }
});

/**
 * @swagger
 * /equipe-escolar/ambientes/{ambienteId}:
 *   delete:
 *     summary: Excluir ambiente escolar (Equipe Escolar)
 *     description: Remove um ambiente escolar
 *     tags: [Equipe Escolar]
 *     parameters:
 *       - in: path
 *         name: ambienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do ambiente
 *     responses:
 *       204:
 *         description: Ambiente excluído com sucesso
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/equipe-escolar/ambientes/:ambienteId", async (req, res) => {
  const { ambienteId } = req.params;

  try {
    await manterAmbienteEscolarUseCase.excluir(ambienteId);

    return res.status(204).send();
  } catch (err: any) {
    console.error("Erro ao excluir ambiente escolar:", err);
    return res.status(400).json({
      error:
        err instanceof Error
          ? err.message
          : "Erro ao excluir ambiente escolar.",
    });
  }
});

export default router;
