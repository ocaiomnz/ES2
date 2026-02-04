import type { Request, Response, NextFunction } from "express";
import { JwtService } from "../../security/JwtService.js";


declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        tipoPerfil: string;
        escolaId?: string;
      };
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const jwtService = new JwtService();

    const token = jwtService.extractTokenFromHeader(
      req.headers.authorization,
    );

    if (!token) {
      res.status(401).json({
        error: "Token não fornecido",
        message: "Autenticação necessária",
      });
      return;
    }

    const payload = jwtService.verify(token);

    const userData: any = {
      userId: payload.userId,
      email: payload.email,
      tipoPerfil: payload.tipoPerfil,
    };

    if (payload.escolaId) {
      userData.escolaId = payload.escolaId;
    }

    req.user = userData;

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Token expirado") {
        res.status(401).json({
          error: "Token expirado",
          message: "Por favor, faça login novamente",
        });
        return;
      }

      if (error.message === "Token inválido") {
        res.status(401).json({
          error: "Token inválido",
          message: "Token malformado ou não reconhecido",
        });
        return;
      }
    }

    res.status(500).json({
      error: "Erro ao processar autenticação",
    });
  }
}


export function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const jwtService = new JwtService();

    const token = jwtService.extractTokenFromHeader(
      req.headers.authorization,
    );

    if (token) {
      const payload = jwtService.verify(token);
      const userData: any = {
        userId: payload.userId,
        email: payload.email,
        tipoPerfil: payload.tipoPerfil,
      };

      if (payload.escolaId) {
        userData.escolaId = payload.escolaId;
      }

      req.user = userData;
    }

    next();
  } catch {
    next();
  }
}
