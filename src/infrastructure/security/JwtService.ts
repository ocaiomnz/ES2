import jwt, { type SignOptions } from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  email: string;
  tipoPerfil: string;
  escolaId?: string;
}

export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string | number;

  constructor(secret?: string, expiresIn: string | number = "24h") {
    this.secret = secret || process.env.JWT_SECRET || "default-secret-key";
    this.expiresIn = expiresIn;

    if (this.secret === "default-secret-key") {
      console.warn(
        "⚠️  ATENÇÃO: Usando JWT_SECRET padrão. Configure JWT_SECRET no arquivo .env para produção!",
      );
    }
  }

  public sign(payload: JwtPayload): string {
    const cleanPayload: Record<string, string> = {
      userId: payload.userId,
      email: payload.email,
      tipoPerfil: payload.tipoPerfil,
    };

    if (payload.escolaId) {
      cleanPayload.escolaId = payload.escolaId;
    }

    const options: SignOptions = {
      expiresIn: this.expiresIn as any,
      issuer: "sapea-api",
      audience: "sapea-client",
    };

    return jwt.sign(cleanPayload, this.secret, options);
  }

  public verify(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: "sapea-api",
        audience: "sapea-client",
      }) as JwtPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token expirado");
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Token inválido");
      }

      throw new Error("Erro ao validar token");
    }
  }

  public decode(token: string): JwtPayload | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  public extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1] ?? null;
  }
}
