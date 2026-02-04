import type { ICriancaRepository } from "../../../domain/repositories/ICriancaRepository.js";
import { RegistroCrise } from "../../../domain/entities/RegistroCrise.js";
import { Intervencao } from "../../../domain/entities/Intervencao.js";
import { IntensidadeDaCrise } from "../../../domain/value-objects/Intensidade.js";

export type RegistrarCriseInput = {
  criancaId: string;
  dataHora: Date;
  intensidade: string;
  descricao?: string;
  gatilhoIdentificado?: string;
};

export type RegistrarIntervencaoInput = {
  criancaId: string;
  dataHora: Date;
  estrategia: string;
  aplicadaPor: string;
  resultado?: string;
};

export type MarcarEficaciaCriseInput = {
  criancaId: string;
  criseId: string;
  eficaz: boolean;
};

export class ManterHistoricoCriseUseCase {
  constructor(private readonly criancaRepo: ICriancaRepository) {}

  public async registrarCrise(input: RegistrarCriseInput): Promise<void> {
    const agregado = await this.criancaRepo.buscarPorId(input.criancaId);
    if (!agregado) {
      throw new Error("Criança não encontrada");
    }

    const intensidade = IntensidadeDaCrise.fromString(input.intensidade);
    const crise = RegistroCrise.create(
      input.dataHora,
      intensidade,
      input.descricao,
      input.gatilhoIdentificado,
    );

    const agregadoAtualizado = agregado.adicionarCrise(crise);
    await this.criancaRepo.salvar(agregadoAtualizado);
  }

  public async registrarIntervencao(
    input: RegistrarIntervencaoInput,
  ): Promise<void> {
    const agregado = await this.criancaRepo.buscarPorId(input.criancaId);
    if (!agregado) {
      throw new Error("Criança não encontrada");
    }

    const intervencao = Intervencao.create(
      input.dataHora,
      input.estrategia,
      input.aplicadaPor,
    );

    if (input.resultado) {
      intervencao.registrarResultado(input.resultado);
    }

    const agregadoAtualizado = agregado.adicionarIntervencao(intervencao);
    await this.criancaRepo.salvar(agregadoAtualizado);
  }

  public async marcarEficaciaCrise(
    input: MarcarEficaciaCriseInput,
  ): Promise<void> {
    const agregado = await this.criancaRepo.buscarPorId(input.criancaId);
    if (!agregado) {
      throw new Error("Criança não encontrada");
    }

    const crise = agregado.crises.find((c) => c.id === input.criseId);
    if (!crise) {
      throw new Error("Crise não encontrada no histórico da criança");
    }

    crise.marcarEficacia(input.eficaz);
    await this.criancaRepo.salvar(agregado);
  }
}
