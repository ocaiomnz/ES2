import type { IUsuarioRepository } from "../../domain/repositories/IUsuarioRepository.js";
import { Usuario } from "../../domain/entities/Usuario.js";
import { Email } from "../../domain/value-objects/Email.js";
import { TipoPerfil } from "../../domain/value-objects/TipoPerfil.js";
import { PrismaClient } from "@prisma/client";

export class PrismaUsuarioRepository implements IUsuarioRepository {
  private readonly prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  public async buscarPorId(id: string): Promise<Usuario | undefined> {
    const usuarioDb = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioDb) {
      return undefined;
    }

    return this.mapToDomain(usuarioDb);
  }

  public async buscarPorEmail(email: string): Promise<Usuario | undefined> {
    const usuarioDb = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuarioDb) {
      return undefined;
    }

    return this.mapToDomain(usuarioDb);
  }

  public async salvar(usuario: Usuario): Promise<void> {
    const data: any = {
      nome: usuario.nome,
      email: usuario.email.enderecoEmail,
      senhaHash: usuario.senhaHash,
      tipoPerfil: usuario.tipoPerfil.tipo,
      updatedAt: new Date(),
    };

    if (usuario.escolaId) {
      data.escolaId = usuario.escolaId;
    }

    const existente = await this.prisma.usuario.findUnique({
      where: { id: usuario.id },
    });

    if (existente) {
      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data,
      });
    } else {
      await this.prisma.usuario.create({
        data: {
          ...data,
          id: usuario.id,
        },
      });
    }
  }

  public async listar(filtros?: {
    tipoPerfil?: string;
    escolaId?: string;
  }): Promise<Usuario[]> {
    const where: any = {};

    if (filtros?.tipoPerfil) {
      where.tipoPerfil = filtros.tipoPerfil;
    }

    if (filtros?.escolaId) {
      where.escolaId = filtros.escolaId;
    }

    const usuariosDb = await this.prisma.usuario.findMany({
      where,
      orderBy: { nome: "asc" },
    });

    return usuariosDb.map((u) => this.mapToDomain(u));
  }

  /**
   * Remove um usuário por ID
   */
  public async remover(id: string): Promise<void> {
    await this.prisma.usuario.delete({
      where: { id },
    });
  }

  public async emailJaExiste(email: string): Promise<boolean> {
    const count = await this.prisma.usuario.count({
      where: { email },
    });

    return count > 0;
  }

  private mapToDomain(usuarioDb: any): Usuario {
    return Usuario.reconstitute(
      usuarioDb.id,
      usuarioDb.nome,
      Email.create(usuarioDb.email),
      TipoPerfil.fromString(usuarioDb.tipoPerfil),
      usuarioDb.senhaHash,
      usuarioDb.escolaId,
    );
  }
}
