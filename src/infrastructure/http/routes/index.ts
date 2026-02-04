import express from "express";
import authRoutes from "./authRoutes.js";
import usuarioRoutes from "./usuarioRoutes.js";
import criancaRoutes from "./criancaRoutes.js";
import equipeEscolarRoutes from "./equipeEscolarRoutes.js";
import eventoRoutes from "./eventoRoutes.js";
import ambienteRoutes from "./ambienteRoutes.js";
import criseRoutes from "./criseRoutes.js";
import perfilRoutes from "./perfilRoutes.js";
import personalizacaoRoutes from "./personalizacaoRoutes.js";

const apiRouter = express.Router();


apiRouter.use(authRoutes);


apiRouter.use(usuarioRoutes);
apiRouter.use(criancaRoutes);
apiRouter.use(equipeEscolarRoutes);
apiRouter.use(eventoRoutes);
apiRouter.use(ambienteRoutes);
apiRouter.use(criseRoutes);
apiRouter.use(perfilRoutes);
apiRouter.use(personalizacaoRoutes);

export default apiRouter;
