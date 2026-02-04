# Relatório de Teste de Consistência - SAPEA

**Data:** 2025-02-04  
**Referência:** Documento I - Requisitos, Arquitetura e Projeto (P2503 SAPEA ESII 2025-2)

---

## 1. Mapeamento Páginas ↔ Rotas

### 1.1 Páginas Individuais (`public/pages/`)

| Página                        | API utilizada | Rota(s)                                                                                  | Status                              |
| ----------------------------- | ------------- | ---------------------------------------------------------------------------------------- | ----------------------------------- |
| **login.html**                | fetch direct  | `POST /api/auth/login`                                                                   | ✅ Conforme                         |
| **telacrianca.html**          | SAPEA_API     | `GET /criancas/:id/calendario`, `GET /perfis/criancas/:id`, `POST /criancas/:id/suporte` | ✅ Conforme                         |
| **telaresponsavel.html**      | SAPEA_API     | `GET /criancas/:id/calendario`, `GET /crises/crianca/:id`                                | ✅ Conforme                         |
| **telaescolar.html**          | SAPEA_API     | `GET /perfis/criancas`                                                                   | ✅ Conforme                         |
| **acompanhamento_humor.html** | SAPEA_API     | `GET /crises/crianca/:id`                                                                | ✅ Conforme (usa crises como proxy) |
| **ambiente.html**             | SAPEA_API     | `GET /criancas/:id/ambientes`                                                            | ✅ Conforme                         |

### 1.2 SPA (`public/index.html` + `main.js`)

| Funcionalidade               | API utilizada                                       | Status                           |
| ---------------------------- | --------------------------------------------------- | -------------------------------- |
| **Login**                    | `POST /api/auth/login`                              | ✅ Conforme                      |
| **SOS/Botão Ajuda**          | `POST /criancas/:id/suporte` via SAPEA_API          | ✅ Conforme                      |
| **Calendário (responsável)** | Via `loadTelaresponsavelData` → calendario + crises | ✅ Conforme                      |
| **Tela Criança (rotina)**    | `loadTelacriancaData` → calendario, perfis          | ✅ Conforme                      |
| **Tela Escola (crianças)**   | `loadTelaescolarData` → perfis/criancas             | ✅ Conforme                      |
| **Tela Ambiente**            | `loadAmbienteData` → criancas/:id/ambientes         | ✅ Conforme                      |
| **Acompanhamento Humor**     | `loadHumorData` → crises/crianca/:id                | ✅ Conforme                      |
| **Personalização (cores)**   | localStorage apenas                                 | ⚠️ Parcial (RF009 - não usa API) |

---

## 2. Requisitos Funcionais vs Implementação

| RF    | Descrição                      | Documentação        | Implementação                                          | Status                                     |
| ----- | ------------------------------ | ------------------- | ------------------------------------------------------ | ------------------------------------------ |
| RF001 | Manter Calendário Escolar      | Equipe Escolar      | POST/PUT/DELETE `/eventos`, `/equipe-escolar`          | ✅ Backend existe, frontend sem formulário |
| RF002 | Visualizar Calendário          | Pai/Responsável     | `telaresponsavel` usa `/criancas/:id/calendario`       | ✅ Conforme                                |
| RF003 | Manter Histórico de Crises     | Equipe Escolar      | POST `/crises`, `/intervencoes`                        | ✅ Backend existe, frontend sem formulário |
| RF004 | Visualizar Histórico de Crises | Pai/Responsável     | `telaresponsavel` usa `/crises/crianca/:id`            | ✅ Conforme                                |
| RF005 | Acionar Botão de Suporte       | Criança             | `telacrianca` usa POST `/criancas/:id/suporte`         | ✅ Conforme                                |
| RF006 | Manter Ambientes Escolares     | Equipe Escolar      | POST `/ambientes`, `/equipe-escolar`                   | ✅ Backend existe, frontend sem formulário |
| RF007 | Visualizar Ambientes           | Criança/Responsável | `ambiente` usa `/criancas/:id/ambientes`               | ✅ Conforme                                |
| RF008 | Manter Perfil da Criança       | Equipe/Pais         | POST/GET/PUT/DELETE `/perfis/criancas`                 | ✅ Backend existe                          |
| RF009 | Personalização Sensorial       | Desejável           | Cores em localStorage, API existe em `/personalizacao` | ⚠️ Não integrado                           |
| RF010 | Sincronização Tempo Real       | Sistema             | Notificações - não implementado                        | ⚠️ Fora do escopo atual                    |

---

## 3. Rotas Backend Disponíveis

| Rota                          | Método  | Auth | Usado pelo Frontend                      |
| ----------------------------- | ------- | ---- | ---------------------------------------- |
| `/auth/login`                 | POST    | Não  | login.html ✅                            |
| `/auth/register`              | POST    | Não  | ❌ Não usado                             |
| `/auth/me`                    | GET     | Sim  | ❌ Não usado                             |
| `/criancas/:id/calendario`    | GET     | Não  | telacrianca, telaresponsavel ✅          |
| `/criancas/:id/ambientes`     | GET     | Não  | ambiente ✅                              |
| `/criancas/:id/suporte`       | POST    | Não  | telacrianca ✅                           |
| `/crises/crianca/:id`         | GET     | Sim  | telaresponsavel, acompanhamento_humor ✅ |
| `/perfis/criancas`            | GET     | Sim  | telaescolar ✅                           |
| `/perfis/criancas/:id`        | GET     | Sim  | telacrianca ✅                           |
| `/eventos`                    | POST    | Sim  | ❌ Sem formulário                        |
| `/eventos/crianca/:id`        | GET     | Sim  | ❌ Usa criancas/calendario               |
| `/ambientes/crianca/:id`      | GET     | Sim  | ❌ Usa criancas/ambientes                |
| `/personalizacao/crianca/:id` | GET/PUT | Sim  | ❌ Não usado                             |

---

## 4. Inconsistências Identificadas

### Críticas (corrigidas em 2025-02-04)

1. ~~**SPA (index.html)**: Login simulado~~ → **Corrigido**: usa `POST /api/auth/login`
2. ~~**SPA**: SOS não chama `POST /criancas/:id/suporte`~~ → **Corrigido**: usa `SAPEA_API.solicitarSuporte`
3. ~~**SPA**: Dados estáticos em calendário, ambiente e humor~~ → **Corrigido**: carrega dados reais via `load*Data`

### Menores

4. **Estratégia em histórico de crises**: API retorna `descricao` em RegistroCrise; `estrategia` vem de Intervenção. Frontend usa `descricao` como fallback.
5. **Perfil criança sem nome**: Modelo Crianca não tem campo `nome`; exibição usa "Criança (Grau X, Suporte Y)".

### Sugestões

6. Formulários para Equipe Escolar: Registrar crise, criar evento, cadastrar ambiente (RF001, RF003, RF006)
7. Integrar personalização sensorial com API `/personalizacao` (RF009)

---

## 5. Recomendações

1. ~~**Integrar SPA com api.js**~~ → **Concluído**: api.js carregado, SAPEA_API e handleLogin integrados
2. **Modo demonstração**: Botão "Ver interface da criança (modo demonstração)" exibe dados vazios quando sem login; SOS mostra mensagem informativa
3. **Formulário Registrar Crise**: Conectar modal `modal-alerta-crise` ao `POST /crises`
4. **Seletor de criança**: Quando responsável tem múltiplas crianças, permitir trocar `sapea_crianca_id`
