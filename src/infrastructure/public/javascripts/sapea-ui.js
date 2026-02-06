/**
 * SAPEA - Utilitários de UI
 * Toast, alertas de transição e feedback visual
 */
(function () {
  "use strict";

  var TOAST_CONTAINER_ID = "sapea-toast-container";
  var TRANSICAO_ALERT_MIN = 5;
  var TRANSICAO_ALERT_MAX = 10;
  var lastTransicaoAlertId = null;

  function ensureToastContainer() {
    var el = document.getElementById(TOAST_CONTAINER_ID);
    if (!el) {
      el = document.createElement("div");
      el.id = TOAST_CONTAINER_ID;
      el.className = "sapea-toast-container";
      el.setAttribute("aria-live", "polite");
      el.setAttribute("role", "region");
      el.setAttribute("aria-label", "Notificações");
      document.body.appendChild(el);
    }
    return el;
  }

  function getToastStyles(type) {
    var colors = {
      success: { bg: "#0d9488", icon: "✓" },
      warning: { bg: "#d97706", icon: "!" },
      danger: { bg: "#dc2626", icon: "✕" },
      info: { bg: "#2563eb", icon: "ℹ" },
      transicao: { bg: "#7b9acc", icon: "⏰" },
    };
    return colors[type] || colors.info;
  }

  /**
   * Exibe um toast de notificação
   * @param {string} message - Mensagem
   * @param {string} type - success | warning | danger | info | transicao
   * @param {number} duration - Duração em ms (0 = não auto-fechar)
   */
  window.SAPEA_TOAST = function (message, type, duration) {
    type = type || "info";
    duration = duration !== undefined ? duration : 4000;

    var container = ensureToastContainer();
    var styles = getToastStyles(type);

    var toast = document.createElement("div");
    toast.className = "sapea-toast sapea-toast-" + type;
    toast.setAttribute("role", "alert");
    toast.innerHTML =
      '<span class="sapea-toast-icon">' +
      styles.icon +
      "</span>" +
      '<span class="sapea-toast-message">' +
      escapeHtml(message) +
      "</span>";

    container.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add("sapea-toast-visible");
    });

    if (duration > 0) {
      setTimeout(function () {
        toast.classList.remove("sapea-toast-visible");
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
      }, duration);
    }

    return toast;
  };

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  /**
   * Exibe alerta de transição quando próximo evento está em X minutos
   * @param {Array} eventos - Lista de eventos com data_hora_inicio
   * @param {number} minutosAntes - Mostrar alerta X min antes
   */
  window.SAPEA_ALERTA_TRANSICAO = function (eventos, minutosAntes) {
    minutosAntes = minutosAntes || TRANSICAO_ALERT_MIN;
    if (!eventos || !eventos.length) return;

    var now = new Date();
    var proximo = null;
    var minDiff = Infinity;

    for (var i = 0; i < eventos.length; i++) {
      var ev = eventos[i];
      var inicio = ev.data_hora_inicio
        ? new Date(ev.data_hora_inicio)
        : ev.dataHoraInicio
        ? new Date(ev.dataHoraInicio)
        : null;
      if (!inicio || inicio <= now) continue;
      var diff = (inicio - now) / 60000;
      if (diff <= minutosAntes && diff > 0 && diff < minDiff) {
        minDiff = diff;
        proximo = ev;
      }
    }

    if (!proximo) return;

    var evId = proximo.id || proximo.titulo + "-" + proximo.data_hora_inicio;
    if (lastTransicaoAlertId === evId) return;
    lastTransicaoAlertId = evId;

    var titulo = proximo.titulo || "Próxima atividade";
    var msg = "Em " + Math.round(minDiff) + " min: " + titulo;
    SAPEA_TOAST(msg, "transicao", 8000);
  };

  /**
   * Verifica periodicamente se há transição próxima
   */
  window.SAPEA_INICIAR_ALERTAS_TRANSICAO = function (
    getEventosFn,
    intervaloMs
  ) {
    intervaloMs = intervaloMs || 60000;
    setInterval(function () {
      if (typeof getEventosFn === "function") {
        var ev = getEventosFn();
        if (ev && ev.length) SAPEA_ALERTA_TRANSICAO(ev, TRANSICAO_ALERT_MIN);
      }
    }, intervaloMs);
  };

  /**
   * Estado de loading em botão
   */
  window.SAPEA_BTN_LOADING = function (btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.dataset.originalText = btn.textContent;
      btn.disabled = true;
      btn.classList.add("btn-loading");
      btn.innerHTML = '<span class="btn-spinner"></span> Aguarde...';
    } else {
      btn.disabled = false;
      btn.classList.remove("btn-loading");
      btn.textContent = btn.dataset.originalText || "Salvar";
      delete btn.dataset.originalText;
    }
  };

  /**
   * Compatibilidade: showNotification como alias
   */
  window.showNotification = window.SAPEA_TOAST;
})();
