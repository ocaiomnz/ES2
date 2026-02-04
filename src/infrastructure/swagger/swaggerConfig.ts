import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SAPEA API",
      version: "1.0.0",
      description: `
## Sistema de Apoio e Acompanhamento de Crianças com TEA em Ambientes Escolares

A API SAPEA fornece endpoints para gerenciamento de:
- **Autenticação** - Registro, login e perfil de usuários
- **Perfis de Crianças** - CRUD completo de perfis
- **Calendário Escolar** - Eventos e rotinas
- **Ambientes Escolares** - Tours virtuais e familiarização
- **Crises e Suporte** - Registro de crises, intervenções e botão SOS
- **Personalização Sensorial** - Acessibilidade visual e auditiva

### Autenticação
A maioria dos endpoints requer autenticação via JWT Bearer Token.
Obtenha o token através do endpoint \`POST /api/auth/login\`.
      `,
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Servidor de Desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT obtido via login",
        },
      },
      schemas: {
        // === ENUMS ===
        TipoPerfil: {
          type: "string",
          enum: ["ADMIN", "PROFESSOR", "RESPONSAVEL", "CRIANCA"],
          description: "Tipo de perfil do usuário",
        },
        GrauTEA: {
          type: "string",
          enum: ["LEVE", "MODERADO", "SEVERO"],
          description: "Grau do Transtorno do Espectro Autista",
        },
        GrauSuporte: {
          type: "string",
          enum: ["NIVEL_1", "NIVEL_2", "NIVEL_3"],
          description: "Nível de suporte necessário",
        },
        NivelRisco: {
          type: "string",
          enum: ["VERDE", "AMARELO", "VERMELHO"],
          description: "Nível de risco do evento",
        },
        IntensidadeCrise: {
          type: "string",
          enum: ["BAIXA", "MEDIA", "ALTA"],
          description: "Intensidade da crise",
        },
        StatusEvento: {
          type: "string",
          enum: ["PENDENTE", "CONFIRMADO", "CANCELADO"],
          description: "Status do evento",
        },
        TamanhoFonte: {
          type: "string",
          enum: ["PEQUENO", "MEDIO", "GRANDE"],
          description: "Tamanho da fonte para acessibilidade",
        },

        // === AUTH ===
        LoginInput: {
          type: "object",
          required: ["email", "senha"],
          properties: {
            email: { type: "string", format: "email", example: "usuario@email.com" },
            senha: { type: "string", minLength: 6, example: "senha123" },
          },
        },
        LoginOutput: {
          type: "object",
          properties: {
            message: { type: "string", example: "Login realizado com sucesso" },
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            usuario: { $ref: "#/components/schemas/UsuarioResumo" },
          },
        },
        RegistrarUsuarioInput: {
          type: "object",
          required: ["nome", "email", "senha", "tipoPerfil"],
          properties: {
            nome: { type: "string", example: "João Silva" },
            email: { type: "string", format: "email", example: "joao@email.com" },
            senha: { type: "string", minLength: 6, example: "senha123" },
            tipoPerfil: { $ref: "#/components/schemas/TipoPerfil" },
            escolaId: { type: "string", format: "uuid", description: "ID da escola (obrigatório para PROFESSOR)" },
          },
        },
        RegistrarUsuarioOutput: {
          type: "object",
          properties: {
            message: { type: "string", example: "Usuário registrado com sucesso" },
            usuario: {
              type: "object",
              properties: {
                usuarioId: { type: "string", format: "uuid" },
                nome: { type: "string" },
                email: { type: "string" },
                tipoPerfil: { $ref: "#/components/schemas/TipoPerfil" },
              },
            },
          },
        },
        UsuarioResumo: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            nome: { type: "string", example: "João Silva" },
            email: { type: "string", format: "email" },
            tipoPerfil: { $ref: "#/components/schemas/TipoPerfil" },
            escolaId: { type: "string", format: "uuid", nullable: true },
          },
        },

        // === CRIANÇA ===
        CriarCriancaInput: {
          type: "object",
          required: ["dataNascimento", "grauTEA", "grauSuporte"],
          properties: {
            dataNascimento: { type: "string", format: "date", example: "2015-06-15" },
            grauTEA: { $ref: "#/components/schemas/GrauTEA" },
            grauSuporte: { $ref: "#/components/schemas/GrauSuporte" },
            escolaId: { type: "string", format: "uuid" },
            responsavelIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
              description: "IDs dos responsáveis",
            },
          },
        },
        AtualizarCriancaInput: {
          type: "object",
          properties: {
            dataNascimento: { type: "string", format: "date" },
            grauTEA: { $ref: "#/components/schemas/GrauTEA" },
            grauSuporte: { $ref: "#/components/schemas/GrauSuporte" },
            escolaId: { type: "string", format: "uuid" },
            responsavelIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
            },
          },
        },
        Crianca: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            dataNascimento: { type: "string", format: "date-time" },
            grauTEA: { $ref: "#/components/schemas/GrauTEA" },
            grauSuporte: { $ref: "#/components/schemas/GrauSuporte" },
            escolaId: { type: "string", format: "uuid", nullable: true },
            responsavelIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
            },
          },
        },

        // === EVENTO ===
        CriarEventoInput: {
          type: "object",
          required: ["criancaId", "titulo", "dataHoraInicio", "dataHoraFim", "nivelRisco"],
          properties: {
            criancaId: { type: "string", format: "uuid" },
            titulo: { type: "string", example: "Aula de Matemática" },
            dataHoraInicio: { type: "string", format: "date-time" },
            dataHoraFim: { type: "string", format: "date-time" },
            nivelRisco: { $ref: "#/components/schemas/NivelRisco" },
          },
        },
        AtualizarEventoInput: {
          type: "object",
          properties: {
            titulo: { type: "string" },
            dataHoraInicio: { type: "string", format: "date-time" },
            dataHoraFim: { type: "string", format: "date-time" },
            nivelRisco: { $ref: "#/components/schemas/NivelRisco" },
          },
        },
        Evento: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            criancaId: { type: "string", format: "uuid" },
            titulo: { type: "string" },
            dataHoraInicio: { type: "string", format: "date-time" },
            dataHoraFim: { type: "string", format: "date-time" },
            nivelRisco: { $ref: "#/components/schemas/NivelRisco" },
            status: { $ref: "#/components/schemas/StatusEvento" },
          },
        },

        // === AMBIENTE ESCOLAR ===
        CriarAmbienteInput: {
          type: "object",
          required: ["escolaId", "nome"],
          properties: {
            escolaId: { type: "string", format: "uuid" },
            nome: { type: "string", example: "Biblioteca" },
            descricao: { type: "string", example: "Biblioteca principal da escola" },
            midias: {
              type: "array",
              items: { type: "string", format: "uri" },
              description: "URLs de imagens/vídeos do ambiente",
            },
          },
        },
        AtualizarAmbienteInput: {
          type: "object",
          properties: {
            nome: { type: "string" },
            descricao: { type: "string" },
            midias: {
              type: "array",
              items: { type: "string", format: "uri" },
            },
          },
        },
        AmbienteEscolar: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            escolaId: { type: "string", format: "uuid" },
            nome: { type: "string" },
            descricao: { type: "string", nullable: true },
            midias: {
              type: "array",
              items: { type: "string", format: "uri" },
            },
          },
        },

        // === CRISE ===
        RegistrarCriseInput: {
          type: "object",
          required: ["criancaId", "dataHora", "intensidade"],
          properties: {
            criancaId: { type: "string", format: "uuid" },
            dataHora: { type: "string", format: "date-time" },
            intensidade: { $ref: "#/components/schemas/IntensidadeCrise" },
            descricao: { type: "string" },
            gatilhoIdentificado: { type: "string" },
          },
        },
        RegistrarIntervencaoInput: {
          type: "object",
          required: ["criancaId", "dataHora", "estrategia", "aplicadaPor"],
          properties: {
            criancaId: { type: "string", format: "uuid" },
            dataHora: { type: "string", format: "date-time" },
            estrategia: { type: "string", example: "Técnica de respiração" },
            aplicadaPor: { type: "string", example: "Prof. Maria" },
            resultado: { type: "string" },
          },
        },
        MarcarEficaciaInput: {
          type: "object",
          required: ["criancaId", "eficaz"],
          properties: {
            criancaId: { type: "string", format: "uuid" },
            eficaz: { type: "boolean" },
          },
        },
        Crise: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            criancaId: { type: "string", format: "uuid" },
            dataHora: { type: "string", format: "date-time" },
            intensidade: { $ref: "#/components/schemas/IntensidadeCrise" },
            descricao: { type: "string", nullable: true },
            gatilhoIdentificado: { type: "string", nullable: true },
            foiEficaz: { type: "boolean", nullable: true },
          },
        },

        // === PERSONALIZAÇÃO SENSORIAL ===
        PersonalizacaoInput: {
          type: "object",
          properties: {
            paletaCores: { type: "string", example: "#FFFFFF,#000000,#0066CC" },
            tamanhoFonte: { $ref: "#/components/schemas/TamanhoFonte" },
            icones: { type: "string", example: "simplificados" },
            sons: { type: "boolean", default: false },
            animacoes: { type: "boolean", default: false },
            contrasteAlto: { type: "boolean", default: false },
          },
        },
        PersonalizacaoSensorial: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            criancaId: { type: "string", format: "uuid" },
            paletaCores: { type: "string", nullable: true },
            tamanhoFonte: { $ref: "#/components/schemas/TamanhoFonte" },
            icones: { type: "string", nullable: true },
            sons: { type: "boolean" },
            animacoes: { type: "boolean" },
            contrasteAlto: { type: "boolean" },
          },
        },

        // === SUPORTE ===
        SolicitarSuporteInput: {
          type: "object",
          required: ["criancaId"],
          properties: {
            criancaId: { type: "string", format: "uuid" },
          },
        },

        // === ERROS ===
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Erro de validação" },
            message: { type: "string", example: "Campo obrigatório não informado" },
          },
        },
        UnauthorizedError: {
          type: "object",
          properties: {
            error: { type: "string", example: "Não autorizado" },
            message: { type: "string", example: "Token inválido ou expirado" },
          },
        },
        ForbiddenError: {
          type: "object",
          properties: {
            error: { type: "string", example: "Acesso negado" },
            message: { type: "string", example: "Você não tem permissão para acessar este recurso" },
          },
        },
        NotFoundError: {
          type: "object",
          properties: {
            error: { type: "string", example: "Não encontrado" },
            message: { type: "string", example: "Recurso não encontrado" },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Token de autenticação ausente ou inválido",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UnauthorizedError" },
            },
          },
        },
        ForbiddenError: {
          description: "Acesso negado - permissão insuficiente",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ForbiddenError" },
            },
          },
        },
        NotFoundError: {
          description: "Recurso não encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NotFoundError" },
            },
          },
        },
        ValidationError: {
          description: "Dados inválidos",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
    tags: [
      { name: "Autenticação", description: "Registro, login e perfil de usuários" },
      { name: "Usuários", description: "Gerenciamento de usuários (em desenvolvimento)" },
      { name: "Perfis de Crianças", description: "Gerenciamento de perfis de crianças" },
      { name: "Eventos", description: "Calendário e eventos escolares" },
      { name: "Ambientes", description: "Ambientes escolares e tours virtuais" },
      { name: "Equipe Escolar", description: "Rotas alternativas para equipe escolar (sem autenticação)" },
      { name: "Crises", description: "Registro de crises e intervenções" },
      { name: "Suporte", description: "Solicitação de suporte (SOS)" },
      { name: "Personalização", description: "Configurações de acessibilidade sensorial" },
    ],
  },
  apis: ["./src/infrastructure/http/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
