import type { Request, Response, NextFunction } from "express";
import { TipoPerfilEnum } from "../../../domain/value-objects/TipoPerfil.js";

export function roleMiddleware(perfisPermitidos: TipoPerfilEnum[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Não autenticado",
        message: "Por favor, faça login para acessar este recurso",
      });
      return;
    }

    const perfilUsuario = req.user.tipoPerfil as TipoPerfilEnum;

    if (!perfisPermitidos.includes(perfilUsuario)) {
      res.status(403).json({
        error: "Acesso negado",
        message: `Apenas usuários com perfil ${perfisPermitidos.join(" ou ")} podem acessar este recurso`,
        perfilAtual: perfilUsuario,
        perfisPermitidos,
      });
      return;
    }
    next();
  };
}

export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  roleMiddleware([TipoPerfilEnum.ADMIN])(req, res, next);
}

export function equipeEscolarOnly(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  roleMiddleware([TipoPerfilEnum.ADMIN, TipoPerfilEnum.PROFESSOR])(
    req,
    res,
    next,
  );
}

export function responsavelOuEquipeEscolar(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  roleMiddleware([
    TipoPerfilEnum.ADMIN,
    TipoPerfilEnum.PROFESSOR,
    TipoPerfilEnum.RESPONSAVEL,
  ])(req, res, next);
}
