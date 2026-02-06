/**
 * SAPEA - API Client
 * Cliente para comunicação com as rotas reais da API do backend.
 */
(function () {
  const API_BASE = "/api";
  const getToken = () => localStorage.getItem("sapea_token");
  const getCriancaId = () => localStorage.getItem("sapea_crianca_id");

  window.SAPEA_REQUIRE_AUTH = function () {
    if (!getToken()) {
      window.location.href = "/pages/login.html";
      return false;
    }
    return true;
  };

  function fetchApi(url, options = {}) {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    if (token) headers["Authorization"] = "Bearer " + token;
    return fetch(API_BASE + url, { ...options, headers }).then((r) => {
      if (r.status === 401) {
        window.location.href = "/pages/login.html";
        return Promise.reject(new Error("Sessão expirada"));
      }
      if (!r.ok) {
        return r
          .json()
          .catch(() => ({}))
          .then((d) =>
            Promise.reject(new Error(d?.message || d?.error || r.statusText))
          );
      }
      return r.json();
    });
  }

  function formatDateTime(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  window.SAPEA_API = {
    fetchTelacrianca: function () {
      const criancaId = getCriancaId();
      if (!criancaId) {
        return Promise.resolve({ crianca: {}, eventos: [] });
      }
      return Promise.all([
        fetchApi("/criancas/" + criancaId + "/calendario"),
        fetchApi("/perfis/criancas/" + criancaId).catch(() => ({
          crianca: {},
        })),
      ]).then(([calendario, perfil]) => {
        const crianca = perfil.crianca || perfil || {};
        const eventos = (calendario.eventos || []).map((e) => ({
          titulo: e.titulo,
          data_hora_inicio: e.dataHoraInicio,
          status: e.status,
          nivelRisco: e.nivelRisco,
          icone: "📌",
          progresso: e.status === "EM_ANDAMENTO" ? 60 : null,
        }));
        return { crianca, eventos };
      });
    },

    fetchTelaresponsavel: function () {
      const criancaId = getCriancaId();
      if (!criancaId) {
        return Promise.resolve({
          status: {},
          alertas: [],
          registro_crises: [],
          proxima_transicao_min: null,
        });
      }
      return Promise.all([
        fetchApi("/criancas/" + criancaId + "/calendario"),
        fetchApi("/crises/crianca/" + criancaId),
      ]).then(([calendario, crisesData]) => {
        const eventos = calendario.eventos || [];
        const crises = crisesData.crises || [];
        const now = new Date();

        var proximaTransicaoMin = null;
        var proximoEvento = null;
        for (var i = 0; i < eventos.length; i++) {
          var ev = eventos[i];
          var inicio = new Date(ev.dataHoraInicio);
          if (inicio > now) {
            proximaTransicaoMin = Math.round((inicio - now) / 60000);
            proximoEvento = ev;
            break;
          }
        }

        const alertas = eventos
          .filter((e) => new Date(e.dataHoraInicio) > now)
          .slice(0, 5)
          .map((e) => ({
            titulo: e.titulo,
            data_hora: formatDateTime(e.dataHoraInicio),
            nivel_risco: e.nivelRisco || "BAIXO",
          }));

        const registro_crises = crises.map((c) => ({
          data_hora: formatDateTime(c.dataHora),
          gatilho_identificado: c.gatilhoIdentificado || "—",
          estrategia: c.descricao || "—",
        }));

        return {
          status: {
            estado_emocional: crises.length > 0 ? "Acompanhar" : "Calmo",
            proxima_transicao_min: proximaTransicaoMin,
          },
          alertas,
          registro_crises,
          eventos,
        };
      });
    },

    fetchTelaescolar: function () {
      return fetchApi("/perfis/criancas").then(function (data) {
        return {
          criancas: (data.criancas || []).map(function (c) {
            var nomeExib =
              c.nome ||
              "Criança (Grau " +
                (c.grauTEA || "—") +
                ", Suporte " +
                (c.grauSuporte || "—") +
                ")";
            return {
              id: c.id,
              nome: nomeExib,
              grauTEA: c.grauTEA,
              grauSuporte: c.grauSuporte,
              escolaId: c.escolaId,
              status: "—",
              nivel_risco: "BAIXO",
              avatar: "👤",
            };
          }),
        };
      });
    },

    fetchAcompanhamentoHumor: function () {
      const criancaId = getCriancaId();
      if (!criancaId) {
        return Promise.resolve({ registros: [] });
      }
      return fetchApi("/crises/crianca/" + criancaId).then((data) => {
        const crises = data.crises || [];
        const emojiMap = {
          BAIXA: "😊",
          MEDIA: "😐",
          ALTA: "😟",
        };
        const estadoMap = {
          BAIXA: "Calmo",
          MEDIA: "Neutro",
          ALTA: "Ansioso",
        };
        const registros = crises.slice(0, 10).map((c) => ({
          emoji: emojiMap[(c.intensidade || "").toUpperCase()] || "😐",
          estado: estadoMap[(c.intensidade || "").toUpperCase()] || "—",
          data_hora: formatDateTime(c.dataHora),
        }));
        return { registros };
      });
    },

    fetchAmbiente: function () {
      const criancaId = getCriancaId();
      if (!criancaId) {
        return Promise.resolve({ ambientes: [] });
      }
      return fetchApi("/criancas/" + criancaId + "/ambientes").then((data) => ({
        ambientes: (data.ambientes || []).map((a) => ({
          nome: a.nome,
          descricao: a.descricao || "",
          icone: "🏫",
        })),
      }));
    },

    solicitarSuporte: function (criancaId, gatilhoIdentificado) {
      criancaId = criancaId || getCriancaId();
      if (!criancaId)
        return Promise.reject(new Error("Criança não identificada"));
      return fetchApi("/criancas/" + criancaId + "/suporte", {
        method: "POST",
        body: JSON.stringify({
          gatilhoIdentificado:
            typeof gatilhoIdentificado === "string"
              ? gatilhoIdentificado.trim() || undefined
              : undefined,
        }),
      });
    },

    fetchUsuario: function () {
      return fetchApi("/auth/me").then(function (data) {
        return data.usuario || {};
      });
    },

    criarAmbiente: function (payload) {
      return fetchApi("/ambientes", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    atualizarAmbiente: function (id, payload) {
      return fetchApi("/ambientes/" + id, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    excluirAmbiente: function (id) {
      return fetchApi("/ambientes/" + id, {
        method: "DELETE",
      });
    },
    listarAmbientesPorCrianca: function (criancaId) {
      return fetchApi("/criancas/" + criancaId + "/ambientes").then(function (
        data
      ) {
        return (data.ambientes || []).map(function (a) {
          return {
            id: a.id,
            nome: a.nome,
            descricao: a.descricao || "",
            escolaId: a.escolaId,
          };
        });
      });
    },

    registrarCrise: function (payload) {
      return fetchApi("/crises", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    registrarIntervencao: function (payload) {
      return fetchApi("/intervencoes", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    listarCrisesPorCrianca: function (criancaId) {
      return fetchApi("/crises/crianca/" + criancaId).then(function (data) {
        return data.crises || [];
      });
    },

    criarEvento: function (payload) {
      return fetchApi("/eventos", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    atualizarEvento: function (id, payload) {
      return fetchApi("/eventos/" + id, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    excluirEvento: function (id) {
      return fetchApi("/eventos/" + id, {
        method: "DELETE",
      });
    },

    marcarEficaciaCrise: function (criseId, criancaId, eficaz) {
      return fetchApi("/crises/" + criseId + "/eficacia", {
        method: "PATCH",
        body: JSON.stringify({ criancaId: criancaId, eficaz: eficaz }),
      });
    },

    obterPersonalizacao: function (criancaId) {
      return fetchApi("/personalizacao/crianca/" + criancaId).then(function (
        data
      ) {
        return data.personalizacao || {};
      });
    },
    atualizarPersonalizacao: function (criancaId, payload) {
      return fetchApi("/personalizacao/crianca/" + criancaId, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },

    fetchPerfisCriancas: function () {
      return fetchApi("/perfis/criancas").then(function (data) {
        return data.criancas || [];
      });
    },
    fetchPerfilCrianca: function (id) {
      return fetchApi("/perfis/criancas/" + id).then(function (data) {
        return data.crianca || data;
      });
    },
    fetchPerfilCriancaResumo: function (id) {
      return fetchApi("/perfis/criancas/" + id + "/resumo");
    },
    criarEscola: function (payload) {
      return fetchApi("/escolas", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    criarResponsavel: function (payload) {
      return fetchApi("/usuarios", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    registrarSentimento: function (criancaId, estado) {
      return fetchApi("/criancas/" + criancaId + "/sentimento", {
        method: "POST",
        body: JSON.stringify({ estado }),
      });
    },

    criarCrianca: function (payload) {
      return fetchApi("/perfis/criancas", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    atualizarCrianca: function (id, payload) {
      return fetchApi("/perfis/criancas/" + id, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    excluirCrianca: function (id) {
      return fetchApi("/perfis/criancas/" + id, {
        method: "DELETE",
      });
    },

    /** Carrega todos os dados para a tela Gerenciar Rotina (eventos, crises, ambientes, humor) */
    fetchRotinaCompleta: function (criancaId) {
      criancaId = criancaId || getCriancaId();
      if (!criancaId) {
        return Promise.resolve({
          crianca: {},
          eventos: [],
          crises: [],
          ambientes: [],
          humorRegistros: [],
        });
      }
      return Promise.all([
        fetchApi("/criancas/" + criancaId + "/calendario"),
        fetchApi("/crises/crianca/" + criancaId),
        fetchApi("/criancas/" + criancaId + "/ambientes"),
        fetchApi("/perfis/criancas/" + criancaId).catch(function () {
          return { crianca: {} };
        }),
      ]).then(function (results) {
        var calendario = results[0];
        var crisesData = results[1];
        var ambientesData = results[2];
        var perfil = results[3];
        var crianca = perfil.crianca || perfil || {};
        var eventos = (calendario.eventos || []).map(function (e) {
          return {
            id: e.id,
            titulo: e.titulo,
            dataHoraInicio: e.dataHoraInicio,
            dataHoraFim: e.dataHoraFim,
            status: e.status,
            nivelRisco: e.nivelRisco,
            icone: "📌",
            progresso: e.status === "EM_ANDAMENTO" ? 60 : null,
          };
        });
        var crises = crisesData.crises || [];
        var ambientes = (ambientesData.ambientes || []).map(function (a) {
          return {
            id: a.id,
            nome: a.nome,
            descricao: a.descricao || "",
            icone: "🏫",
          };
        });
        var emojiMap = { BAIXA: "😊", MEDIA: "😐", ALTA: "😟" };
        var estadoMap = { BAIXA: "Calmo", MEDIA: "Neutro", ALTA: "Ansioso" };
        var humorRegistros = crises.slice(0, 15).map(function (c) {
          var int = (c.intensidade || "").toUpperCase();
          return {
            emoji: emojiMap[int] || "😐",
            estado: estadoMap[int] || "—",
            data_hora: formatDateTime(c.dataHora),
            intensidade: c.intensidade,
          };
        });
        return {
          crianca: crianca,
          eventos: eventos,
          crises: crises,
          ambientes: ambientes,
          humorRegistros: humorRegistros,
        };
      });
    },
  };
})();
