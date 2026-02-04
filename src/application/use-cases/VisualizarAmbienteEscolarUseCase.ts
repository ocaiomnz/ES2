import type { ICriancaRepository } from "../../domain/repositories/ICriancaRepository.js";
import type { IAmbienteEscolarRepository } from "../../domain/repositories/IAmbienteEscolarRepository.js";
import { AmbienteEscolar } from "../../domain/entities/AmbienteEscolar.js";

export type AmbienteEscolarDTO = {
  id: string;
  nome: string;
  descricao?: string | undefined;
  midias?: readonly string[] | undefined;
};
export class VisualizarAmbienteEscolarUseCase {
  constructor(
    private readonly criancaRepo: ICriancaRepository,
    private readonly ambienteRepo: IAmbienteEscolarRepository,
  ) {}

  public async execute(criancaId: string): Promise<AmbienteEscolarDTO[]> {
    const agregado = await this.criancaRepo.buscarPorId(criancaId);
    if (!agregado) throw new Error("Criança não encontrada");

    const escolaId = agregado.crianca.escolaId;
    if (!escolaId) {
      return [];
    }

    const ambientes = await this.ambienteRepo.listarPorEscola(escolaId);

    return ambientes.map((a: AmbienteEscolar) => ({
      id: a.id,
      nome: a.nome,
      descricao: a.descricao ?? undefined,
      midias: a.midias ?? undefined,
    }));
  }
}
