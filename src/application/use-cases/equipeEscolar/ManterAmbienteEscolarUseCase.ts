import type { IAmbienteEscolarRepository } from "../../../domain/repositories/IAmbienteEscolarRepository.js";
import { AmbienteEscolar } from "../../../domain/entities/AmbienteEscolar.js";

export type CriarAmbienteEscolarInput = {
  escolaId: string;
  nome: string;
  descricao?: string;
  midias?: string[];
};

export type AtualizarAmbienteEscolarInput = {
  ambienteId: string;
  nome?: string;
  descricao?: string;
  midias?: string[];
};

export class ManterAmbienteEscolarUseCase {
  constructor(private readonly ambienteRepo: IAmbienteEscolarRepository) {}

  public async criar(
    input: CriarAmbienteEscolarInput,
  ): Promise<AmbienteEscolar> {
    const ambiente = AmbienteEscolar.create(
      input.escolaId,
      input.nome,
      input.descricao,
      input.midias,
    );

    await this.ambienteRepo.salvar(ambiente);
    return ambiente;
  }

  public async atualizar(
    input: AtualizarAmbienteEscolarInput,
  ): Promise<AmbienteEscolar> {
    const ambiente = await this.ambienteRepo.buscarPorId(input.ambienteId);
    if (!ambiente) {
      throw new Error("Ambiente escolar não encontrado para atualização");
    }

    ambiente.atualizarDados(input.nome, input.descricao, input.midias);
    await this.ambienteRepo.salvar(ambiente);
    return ambiente;
  }

  public async excluir(ambienteId: string): Promise<void> {
    await this.ambienteRepo.excluir(ambienteId);
  }
}
