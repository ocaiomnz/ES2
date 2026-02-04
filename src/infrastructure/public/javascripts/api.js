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
      var base =
        window.location.pathname.indexOf("/pages/") >= 0
          ? "login.html"
          : "pages/login.html";
      window.location.href = base;
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
      if (!r.ok) throw new Error(r.statusText);
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
      return fetchApi("/perfis/criancas").then((data) => ({
        criancas: (data.criancas || []).map((c) => ({
          id: c.id,
          nome:
            "Criança (Grau " +
            (c.grauTEA || "—") +
            ", Suporte " +
            (c.grauSuporte || "—") +
            ")",
          grauTEA: c.grauTEA,
          grauSuporte: c.grauSuporte,
          status: "—",
          nivel_risco: "BAIXO",
          avatar: "👤",
        })),
      }));
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

    solicitarSuporte: function (criancaId) {
      criancaId = criancaId || getCriancaId();
      if (!criancaId)
        return Promise.reject(new Error("Criança não identificada"));
      return fetchApi("/criancas/" + criancaId + "/suporte", {
        method: "POST",
      });
    },
  };
})();
