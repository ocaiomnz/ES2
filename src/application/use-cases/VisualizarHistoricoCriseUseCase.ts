import type { ICriancaRepository } from "../../domain/repositories/ICriancaRepository.js";
import { RegistroCrise } from "../../domain/entities/RegistroCrise.js";

export type CriseHistoricoDTO = {
  id?: string;
  dataHora: string;
  intensidade: string;
  descricao?: string | undefined;
  gatilhoIdentificado?: string | undefined;
  foiEficaz?: boolean | undefined;
};
export class VisualizarHistoricoCriseUseCase {
  constructor(private readonly criancaRepo: ICriancaRepository) {}

  public async execute(criancaId: string): Promise<CriseHistoricoDTO[]> {
    const agregado = await this.criancaRepo.buscarPorId(criancaId);
    if (!agregado) throw new Error("Criança não encontrada");

    return agregado.crises.map((c: RegistroCrise) => ({
      id: c.id,
      dataHora: c.dataHora.toISOString(),
      intensidade: c.intensidade.intensidade,
      descricao: c.descricao ?? undefined,
      gatilhoIdentificado: c.gatilhoIdentificado ?? undefined,
      foiEficaz: c.foiEficaz ?? undefined,
    }));
  }
}
