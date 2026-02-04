import { AmbienteEscolar } from "../entities/AmbienteEscolar.js";

export interface IAmbienteEscolarRepository {
  listarPorEscola(escolaId: string): Promise<AmbienteEscolar[]>;
  buscarPorId(id: string): Promise<AmbienteEscolar | null>;
  salvar(ambiente: AmbienteEscolar): Promise<void>;
  excluir(id: string): Promise<void>;
}
