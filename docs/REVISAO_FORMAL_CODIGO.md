# Revisão Formal do Código — SAPEA

**Projeto:** Sistema de Apoio e Acompanhamento de Crianças com TEA em Ambientes Escolares  
**Data:** 06/02/2025  
**Versão analisada:** 1.0.0

---

## 1. Visão Geral

O SAPEA é um sistema web para gestão de ambientes escolares, suporte e acompanhamento de crianças com Transtorno do Espectro Autista (TEA). A aplicação utiliza **TypeScript**, **Express**, **Prisma ORM** e **PostgreSQL**, com frontend estático em HTML/CSS/JavaScript.

---

## 2. Arquitetura

### 2.1 Padrão Arquitetural

O projeto segue uma **Arquitetura em Camadas** inspirada em **Clean Architecture** e **Domain-Driven Design (DDD)**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE (Adaptadores)                  │
│  HTTP (Express) │ Prisma (DB) │ JWT │ PasswordHasher │ Swagger │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION (Casos de Uso)                    │
│  LoginUseCase │ CriarCriancaUseCase │ SolicitarSuporteUseCase... │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DOMAIN (Núcleo)                                │
│  Entities │ Aggregates │ Value Objects │ Repository Interfaces   │
└─────────────────────────────────────────────────────────────────┘
```

**Pontos positivos:**

- Separação clara entre domínio, aplicação e infraestrutura
- Domínio isolado de detalhes técnicos (ORM, HTTP)
- Inversão de dependência: use cases dependem de interfaces, não de implementações

### 2.2 Estrutura de Pastas

| Camada             | Caminho               | Responsabilidade                                                     |
| ------------------ | --------------------- | -------------------------------------------------------------------- |
| **Domain**         | `src/domain/`         | Entidades, agregados, value objects, interfaces de repositórios      |
| **Application**    | `src/application/`    | Casos de uso (use cases) e serviços de aplicação                     |
| **Infrastructure** | `src/infrastructure/` | HTTP, banco de dados (Prisma), segurança, Swagger, frontend estático |

---

## 3. Camada de Domínio

### 3.1 Entidades

- **Entity** (base): ID UUID, método `equals()`
- **Crianca**, **Usuario**, **RegistroCrise**, **PedidoSuporte**, **Intervencao**, **Evento**, **AmbienteEscolar**, **PersonalizacaoSensorial**

**Características:**

- Construtores privados com factories estáticos (`create`, `fromPersistence`, `reconstitute`)
- Encapsulamento via getters e métodos de alteração explícitos
- Validações de negócio nas factories (ex.: `DataNascimento` não futura em `RegistroCrise`)

### 3.2 Value Objects

| Value Object                                    | Propósito                                         |
| ----------------------------------------------- | ------------------------------------------------- |
| `Email`                                         | Validação de formato e unicidade conceitual       |
| `Senha`                                         | Regras de complexidade                            |
| `DataNascimento`                                | Validação de data                                 |
| `GrauTEA`, `GrauSuporte`                        | Enums tipados (LEVE/MODERADO/SEVERO, NIVEL_1/2/3) |
| `IntensidadeDaCrise`                            | BAIXA/MEDIA/ALTA                                  |
| `NivelRisco`, `StatusAtendimento`, `TipoPerfil` | Enums de domínio                                  |

**Pontos positivos:**

- Imutabilidade e validação centralizada
- `obterComponentesDeIgualdade()` para comparação semântica em `ValueObject`

### 3.3 Agregados

**AgregadoCrianca** — raiz de agregado que agrupa:

- `Crianca` (raiz)
- `RegistroCrise[]`
- `PedidoSuporte[]`
- `Intervencao[]`

**Invariantes implementadas:**

1. Máximo uma crise não resolvida (`foiEficaz === undefined`)
2. Todo pedido de suporte deve estar vinculado a uma crise existente no agregado

**Decisão de design:** O repositório `ICriancaRepository` persiste o agregado inteiro; não há repositórios separados para crises/pedidos/intervenções. Isso mantém consistência transacional e respeita as invariantes.

---

## 4. Camada de Aplicação (Use Cases)

### 4.1 Padrão

Cada use case:

- Recebe dependências via construtor (repositórios, serviços)
- Expõe método `execute(input)` assíncrono
- Orquestra entidades e repositórios
- Não conhece HTTP, Prisma ou detalhes de infraestrutura

### 4.2 Exemplos

| Use Case                       | Responsabilidade                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `LoginUseCase`                 | Autenticação, validação de senha, emissão de JWT                                  |
| `CriarCriancaUseCase`          | Validação de perfil (PROFESSOR, EQUIPE_ESCOLAR, RESPONSAVEL), criação de agregado |
| `SolicitarSuporteUseCase`      | Cria crise se não houver, cria pedido de suporte, notifica                        |
| `ManterCalendarioUseCase`      | CRUD de eventos                                                                   |
| `ManterAmbienteEscolarUseCase` | CRUD de ambientes                                                                 |

### 4.3 Injeção de Dependências

**Problema identificado:** As rotas instanciam manualmente repositórios e use cases:

```typescript
// authRoutes.ts
const prisma = new PrismaClient();
const usuarioRepository = new PrismaUsuarioRepository(prisma);
const loginUseCase = new LoginUseCase(
  usuarioRepository,
  passwordHasher,
  jwtService
);
```

Cada arquivo de rota cria suas próprias instâncias. Não há container de DI (ex.: tsyringe, inversify). Isso pode levar a:

- Múltiplas instâncias de `PrismaClient`
- Dificuldade de testes (mock de dependências)
- Acoplamento entre rotas e implementações concretas

**Recomendação:** Introduzir um container de DI ou factory central para repositórios e use cases.

---

## 5. Camada de Infraestrutura

### 5.1 Banco de Dados (Prisma)

**SGBD:** PostgreSQL

**Modelos principais:**

- `Usuario`, `Escola`, `Crianca`, `CriancaResponsavel`
- `Evento`, `AmbienteEscolar`, `RegistroCrise`, `PedidoSuporte`, `Intervencao`
- `PersonalizacaoSensorial`, `RegistroSentimento`

**Relacionamentos:**

- `Crianca` → `Escola` (opcional)
- `Crianca` → `Usuario` (perfil criança, 1:1)
- `Crianca` ↔ `Usuario` (responsáveis via `CriancaResponsavel`)
- `RegistroCrise` → `Crianca` (CASCADE)
- `PedidoSuporte` → `RegistroCrise` (opcional, 1:1)

**Pontos de atenção:**

- `RegistroSentimento` não está no agregado de domínio; é usado diretamente via Prisma em `criancaRoutes.ts` (registro de sentimento)
- `midias` em `AmbienteEscolar` é `String?` — provavelmente JSON ou array serializado; poderia ser tipado melhor

### 5.2 Mappers

`AgregadoCriancaMapper` serializa/desserializa o agregado entre domínio e persistência. A separação entre `PersistedAgregadoCrianca` e o agregado de domínio evita vazamento de detalhes do banco para o domínio.

### 5.3 Estratégia de Persistência

`PrismaCriancaRepository.salvar()` usa **delete-all + insert** para crises, pedidos e intervenções:

```typescript
txOperations.push(this.prisma.registroCrise.deleteMany({ where: { criancaId } }));
for (const c of p.crises) {
  txOperations.push(this.prisma.registroCrise.create({ data: {...} }));
}
```

**Prós:** Simplicidade, evita lógica de diff  
**Contras:** Pode ser custoso com muitos registros; não há otimistic locking

### 5.4 HTTP e Rotas

- **Express 5** com `express.json()` e `express.urlencoded()`
- Rotas organizadas por domínio: `authRoutes`, `criancaRoutes`, `eventoRoutes`, etc.
- Swagger UI em `/api-docs`, spec em `/api-docs.json`
- Health check em `/api/health`
- SPA fallback: qualquer rota não API serve `index.html`

### 5.5 Segurança

| Componente       | Implementação                                           |
| ---------------- | ------------------------------------------------------- |
| **Autenticação** | JWT (Bearer)                                            |
| **Senhas**       | bcrypt (via `PasswordHasher`)                           |
| **Autorização**  | `authMiddleware`, `roleMiddleware` (por tipo de perfil) |

**Observação crítica:** `JwtService` usa `JWT_SECRET` com fallback para `"default-secret-key"` em desenvolvimento. Em produção, isso é um risco de segurança — o aviso em console existe, mas a configuração deve ser obrigatória.

### 5.6 Rotas sem Autenticação

As rotas `/equipe-escolar/*` (eventos, ambientes) **não exigem autenticação**. Conforme `SWAGGER_ANALISE.md`, foram pensadas para cenários como tablets na escola. Isso pode ser intencional, mas representa um risco se não houver outro mecanismo de controle (ex.: API key, rede interna).

---

## 6. Comunicação Frontend ↔ Backend

### 6.1 Protocolo

- **REST** sobre HTTP/JSON
- Base URL: `/api`
- Autenticação: header `Authorization: Bearer <token>`
- Token armazenado em `localStorage` (`sapea_token`)
- `criancaId` em `localStorage` (`sapea_crianca_id`) para contexto da criança selecionada

### 6.2 Cliente API (`api.js`)

Objeto global `SAPEA_API` com funções para cada recurso:

- `fetchTelacrianca`, `fetchTelaresponsavel`, `fetchTelaescolar`
- `solicitarSuporte`, `registrarCrise`, `registrarIntervencao`
- `criarCrianca`, `atualizarCrianca`, `excluirCrianca`
- `criarEvento`, `atualizarEvento`, `excluirEvento`
- `obterPersonalizacao`, `atualizarPersonalizacao`
- etc.

**Tratamento de erros:**

- 401 → redireciona para `/pages/login.html`
- Demais erros → `Promise.reject` com mensagem da API

### 6.3 Frontend

- HTML estático em `public/pages/`
- JavaScript em `api.js`, `main.js`, `sapea-ui.js`
- Design system em `design-system.css`, `main.css`
- Sem framework (React/Vue/etc.) — vanilla JS

---

## 7. Decisões de Design Relevantes

| Decisão                                               | Justificativa provável                                                     |
| ----------------------------------------------------- | -------------------------------------------------------------------------- |
| Agregado Criança com crises/pedidos/intervenções      | Consistência transacional e invariantes de negócio                         |
| Value objects para enums (GrauTEA, Intensidade, etc.) | Validação e tipagem forte no domínio                                       |
| Rotas equipe-escolar sem auth                         | Uso em dispositivos compartilhados (tablets)                               |
| Delete-all + insert no salvar do agregado             | Simplicidade em detrimento de performance em cenários com poucos registros |
| Prisma como ORM                                       | Produtividade, tipagem, migrations integradas                              |
| JWT com expiração 24h                                 | Balanceamento entre segurança e UX                                         |

---

## 8. Pontos Fortes

1. **Domínio rico** — Entidades com comportamento, value objects e invariantes bem definidas
2. **Separação de camadas** — Domínio independente de infraestrutura
3. **Documentação Swagger** — API documentada com exemplos e schemas
4. **Tratamento de erros** — Try/catch nas rotas com códigos HTTP adequados
5. **Seed e migrations** — Ambiente reproduzível com dados de teste
6. **Invariantes no agregado** — Regras como “máximo uma crise não resolvida” garantem consistência

---

## 9. Pontos de Atenção e Melhorias

### 9.1 Segurança

- [ ] **JWT_SECRET** — Tornar obrigatório em produção; rejeitar startup se ausente
- [ ] **Rotas equipe-escolar** — Avaliar autenticação ou outro mecanismo de controle
- [ ] **Rate limiting** — Não há proteção contra abuso (ex.: login, registro)

### 9.2 Arquitetura e Código

- [ ] **Injeção de dependências** — Centralizar criação de repositórios e use cases
- [ ] **PrismaClient** — Usar singleton ou pool; evitar múltiplas instâncias
- [ ] **Registro de sentimento** — Integrar ao domínio ou criar use case dedicado em vez de usar Prisma direto na rota
- [ ] **Tipagem** — Reduzir uso de `any` (ex.: em mappers e rotas)

### 9.3 Consistência

- [ ] **Rotas duplicadas** — `/eventos` vs `/equipe-escolar/.../eventos`; definir estratégia (auth vs sem auth)
- [ ] **Placeholders** — `GET /usuarios` e `GET /usuarios/:id` retornam mensagem; implementar ou remover

### 9.4 Testes

- [ ] **Testes unitários** — `npm test` retorna erro; não há testes automatizados
- [ ] **Testes de integração** — Validar fluxos críticos (login, criar criança, solicitar suporte)

### 9.5 Frontend

- [ ] **JavaScript legado** — `api.js` em ES5; considerar módulos e bundler
- [ ] **Tela de intervenções** — Endpoint existe; falta fluxo dedicado no frontend (conforme `SWAGGER_ANALISE.md`)

---

## 10. Conclusão

O SAPEA apresenta uma **arquitetura sólida**, com domínio bem modelado, uso de DDD (entidades, agregados, value objects) e separação clara de responsabilidades. A API REST está documentada e o fluxo principal (autenticação, crianças, eventos, crises, suporte) está funcional.

As principais melhorias recomendadas são:

1. Reforçar segurança (JWT, rotas equipe-escolar, rate limiting)
2. Introduzir injeção de dependências e testes automatizados
3. Integrar o registro de sentimento ao domínio
4. Reduzir placeholders e inconsistências entre rotas autenticadas e não autenticadas

O projeto está em bom estado para evolução e adequado ao contexto acadêmico (ESII 2025-2) e a um MVP de produção com os ajustes sugeridos.
