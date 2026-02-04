import { PersonalizacaoSensorial } from "../entities/PersonalizacaoSensorial.js";

export interface IPersonalizacaoSensorialRepository {
  buscarPorCrianca(criancaId: string): Promise<PersonalizacaoSensorial | null>;
  salvar(personalizacao: PersonalizacaoSensorial): Promise<void>;
  excluir(criancaId: string): Promise<void>;
}
