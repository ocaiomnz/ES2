// ============================================
// SAPEA - JavaScript Principal
// Sistema de Apoio Pedagógico Digital
// ============================================

// Estado da aplicação
const appState = {
  currentScreen: "login-screen",
  previousScreen: null,
  currentUser: null,
  currentProfile: null,
  colorTheme: "blue",
  minimalMode: false,
};

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  updateTime();
  setInterval(updateTime, 1000);
  updateActivityProgress();
  setInterval(updateActivityProgress, 1000);
});

// Função de inicialização
function initializeApp() {
  // Carregar preferências salvas
  loadPreferences();

  // Aplicar tema de cor
  applyColorTheme(appState.colorTheme);

  // Aplicar modo mínimo se ativo
  if (appState.minimalMode) {
    document.body.classList.add("minimal-mode");
    document.getElementById("minimal-mode").checked = true;
  }
}

// ===== NAVEGAÇÃO ENTRE TELAS =====
function showScreen(screenId) {
  // Salvar tela anterior ao ir para ambiente (para voltar corretamente)
  if (screenId === "ambiente") {
    appState.previousScreen = appState.currentScreen;
  }

  // Esconder todas as telas
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  // Mostrar tela selecionada
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add("active");
    appState.currentScreen = screenId;
    if (screenId === "telacrianca") loadTelacriancaData();
    else if (screenId === "telaresponsavel") loadTelaresponsavelData();
    else if (screenId === "telaescolar") loadTelaescolarData();
    else if (screenId === "ambiente") loadAmbienteData();
    else if (screenId === "acompanhamento-humor") loadHumorData();
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
  }
}

function voltarDaTelaAmbiente() {
  const destino = appState.previousScreen || "telaresponsavel";
  showScreen(destino);
}

// ===== AUTENTICAÇÃO =====
function handleLogin() {
  const email = document.getElementById("user-email")?.value?.trim();
  const password = document.getElementById("user-password")?.value;
  const errEl = document.getElementById("login-error-spa");

  if (!email || !password) {
    showNotification("Por favor, preencha e-mail e senha.", "warning");
    return;
  }

  if (errEl) {
    errEl.hidden = true;
    errEl.textContent = "";
  }

  const btn = document.querySelector(
    '#login-screen button[onclick="handleLogin()"]'
  );
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Entrando...";
  }

  fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha: password }),
  })
    .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
    .then(({ ok, data }) => {
      if (!ok)
        throw new Error(data?.message || data?.error || "Erro ao fazer login");
      localStorage.setItem("sapea_token", data.token);
      localStorage.setItem("sapea_crianca_id", data.criancaId || "");
      appState.currentUser = data.usuario?.email || email;
      appState.currentProfile = data.usuario?.tipoPerfil || "";

      const tipo = (data.usuario?.tipoPerfil || "").toUpperCase();
      if (
        tipo === "RESPONSAVEL" ||
        tipo === "PAI" ||
        tipo.includes("RESPONSAVEL")
      ) {
        showScreen("telaresponsavel");
        loadTelaresponsavelData();
      } else if (
        tipo === "PROFESSOR" ||
        tipo === "EQUIPE_ESCOLAR" ||
        tipo.includes("ESCOLAR")
      ) {
        showScreen("telaescolar");
        loadTelaescolarData();
      } else {
        showScreen("telacrianca");
        loadTelacriancaData();
      }
      savePreferences();
      showNotification("Login realizado com sucesso!", "success");
    })
    .catch((err) => {
      if (errEl) {
        errEl.textContent =
          err.message || "Erro ao conectar. Verifique suas credenciais.";
        errEl.hidden = false;
      } else {
        showNotification(err.message || "Erro ao fazer login", "danger");
      }
    })
    .finally(() => {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Entrar";
      }
    });
}

// ===== INTERFACE DA CRIANÇA =====
function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const timeDisplay = document.getElementById("current-time");
  if (timeDisplay) {
    timeDisplay.textContent = timeString;
  }
}

function updateActivityProgress() {
  // Simular progresso da atividade atual
  const progressBar = document.getElementById("activity-progress");
  const timeRemaining = document.getElementById("time-remaining");

  if (progressBar && timeRemaining) {
    // Exemplo: atividade de 40 minutos, já passaram 24 minutos
    const totalMinutes = 40;
    const elapsedMinutes = 24;
    const remainingMinutes = totalMinutes - elapsedMinutes;

    const progress = (elapsedMinutes / totalMinutes) * 100;
    progressBar.style.width = `${progress}%`;

    if (remainingMinutes > 0) {
      timeRemaining.textContent = `Faltam ${remainingMinutes} minutos`;
    } else {
      timeRemaining.textContent = "Quase acabando!";
    }
  }
}

function showTour() {
  const modal = document.getElementById("tour-modal");
  if (modal) {
    modal.classList.add("active");
  }
}

function showHelp() {
  const modal = document.getElementById("modal-alerta-crise");
  if (modal) {
    modal.classList.add("active");
  }
}

function triggerSOS() {
  const sosBtn = document.getElementById("sos-btn");
  if (sosBtn) {
    sosBtn.style.transform = "scale(0.9)";
    setTimeout(() => {
      sosBtn.style.transform = "scale(1)";
    }, 200);
  }

  const criancaId = localStorage.getItem("sapea_crianca_id");
  if (!criancaId) {
    showHelp();
    showNotification(
      "Modo demonstração: sem criança vinculada. Use as páginas separadas para acionar SOS real.",
      "info"
    );
    return;
  }

  if (
    typeof window.SAPEA_API !== "undefined" &&
    window.SAPEA_API.solicitarSuporte
  ) {
    window.SAPEA_API.solicitarSuporte(criancaId)
      .then(() => {
        showHelp();
        showNotification("Ajuda solicitada! Alguém virá em breve.", "success");
      })
      .catch((err) => {
        showNotification(
          err.message || "Erro ao enviar pedido de ajuda.",
          "danger"
        );
      });
  } else {
    showHelp();
    showNotification("Ajuda solicitada! Alguém virá em breve.", "success");
  }
}

// ===== MODAIS =====
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
  }
}

// Fechar modal ao clicar fora (no overlay)
document.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("modal") ||
    e.target.classList.contains("modal-overlay")
  ) {
    e.target.classList.remove("active");
  }
});

// ===== CONFIGURAÇÕES =====
function showSettings() {
  const modal = document.getElementById("settings-modal");
  if (modal) {
    modal.classList.add("active");
  }
}

function changeColor(color) {
  appState.colorTheme = color;
  applyColorTheme(color);

  // Atualizar seleção visual
  document.querySelectorAll(".color-option").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-color="${color}"]`).classList.add("active");

  savePreferences();
}

function applyColorTheme(color) {
  const root = document.documentElement;

  const themes = {
    blue: {
      primary: "#7B9ACC",
      primaryLight: "#A8C4E8",
      primaryDark: "#5A7BA8",
    },
    green: {
      primary: "#9ACD9A",
      primaryLight: "#C4E6C4",
      primaryDark: "#7BA87B",
    },
    purple: {
      primary: "#B19CD9",
      primaryLight: "#D4C4E8",
      primaryDark: "#8B7CA8",
    },
    sand: {
      primary: "#D4C5A9",
      primaryLight: "#E8DDC9",
      primaryDark: "#A8967B",
    },
  };

  const theme = themes[color] || themes.blue;

  root.style.setProperty("--color-primary", theme.primary);
  root.style.setProperty("--color-primary-light", theme.primaryLight);
  root.style.setProperty("--color-primary-dark", theme.primaryDark);
}

function toggleMinimalMode() {
  const checkbox = document.getElementById("minimal-mode");
  appState.minimalMode = checkbox.checked;

  if (appState.minimalMode) {
    document.body.classList.add("minimal-mode");
  } else {
    document.body.classList.remove("minimal-mode");
  }

  savePreferences();
}

// ===== CARREGAMENTO DE DADOS REAIS (SPA) =====
function loadTelacriancaData() {
  if (typeof window.SAPEA_API === "undefined") return;

  window.SAPEA_API.fetchTelacrianca().then(
    (res) => {
      const { crianca, eventos } = res;
      const title = document.querySelector("#telacrianca .header-title");
      if (title)
        title.textContent = "Olá, " + (crianca.nome || "João") + "! 👋";

      const container = document.querySelector(
        "#telacrianca .timeline-container"
      );
      if (!container) return;
      container.innerHTML = "";

      const icons = {
        LANCHE: "🍎",
        AULA: "📚",
        RECREIO: "🌳",
        CASA: "🏠",
        DEFAULT: "📌",
      };
      const now = new Date();
      eventos.slice(0, 6).forEach((ev, i) => {
        const inicio = ev.data_hora_inicio
          ? new Date(ev.data_hora_inicio)
          : null;
        const isPast = inicio && inicio < now;
        const isActive =
          inicio &&
          inicio <= now &&
          eventos[i + 1] &&
          new Date(eventos[i + 1].data_hora_inicio) > now;
        const item = document.createElement("div");
        item.className =
          "timeline-item " +
          (isPast ? "completed" : isActive ? "active" : "upcoming");
        const icon =
          icons[ev.titulo?.toUpperCase().slice(0, 5)] || icons.DEFAULT;
        item.innerHTML =
          '<div class="timeline-icon' +
          (isActive ? "-large" : "") +
          '">' +
          icon +
          "</div>" +
          '<div class="timeline-content">' +
          "<p class='timeline-label'>" +
          (isActive ? "AGORA" : isPast ? "Feito" : "DEPOIS") +
          "</p>" +
          "<p class='timeline-activity'>" +
          (ev.titulo || "—") +
          "</p>" +
          (ev.progresso
            ? "<div class='progress-bar-container'><div class='progress-bar' style='width:" +
              ev.progresso +
              "%'></div></div><p class='timeline-time'>Em andamento</p>"
            : "<p class='timeline-time'>" +
              (inicio
                ? inicio.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—") +
              "</p>") +
          "</div>";
        container.appendChild(item);
      });
      if (eventos.length === 0) {
        container.innerHTML =
          "<p class='timeline-time' style='padding:1rem'>Nenhum evento hoje.</p>";
      }
    },
    () => {}
  );
}

function loadTelaresponsavelData() {
  if (typeof window.SAPEA_API === "undefined") return;

  window.SAPEA_API.fetchTelaresponsavel().then(
    (res) => {
      const { status, alertas, registro_crises, eventos } = res;

      const statusGrid = document.querySelector(
        "#telaresponsavel .status-grid"
      );
      if (statusGrid) {
        statusGrid.innerHTML =
          "<div class='status-item'><div class='status-icon status-good'>😊</div><p class='status-label'>Estado Emocional</p><p class='status-value'>" +
          (status.estado_emocional || "—") +
          "</p></div>" +
          "<div class='status-item'><div class='status-icon status-warning'>⚠️</div><p class='status-label'>Próxima Transição</p><p class='status-value'>" +
          (status.proxima_transicao_min != null
            ? "Em " + status.proxima_transicao_min + " min"
            : "—") +
          "</p></div>";
      }

      const alertList = document.querySelector("#telaresponsavel .alert-list");
      if (alertList) {
        alertList.innerHTML = alertas
          .map(
            (a) =>
              "<div class='alert-item alert-" +
              (a.nivel_risco === "ALTO"
                ? "high"
                : a.nivel_risco === "MEDIO"
                ? "medium"
                : "low") +
              "'><div class='alert-indicator'></div><div class='alert-content'><p class='alert-title'>" +
              (a.titulo || "—") +
              "</p><p class='alert-time'>" +
              (a.data_hora || "—") +
              " - Risco " +
              (a.nivel_risco || "Baixo") +
              "</p></div><button class='btn btn-secondary btn-large' onclick=\"openModal('modal-transicao')\">Ver detalhes</button></div>"
          )
          .join("");
        if (alertas.length === 0)
          alertList.innerHTML =
            "<p style='padding:1rem'>Nenhum alerta de transição.</p>";
      }

      const historyList = document.querySelector(
        "#telaresponsavel .history-list"
      );
      if (historyList) {
        historyList.innerHTML = registro_crises
          .map(
            (c) =>
              "<div class='list-item'><div class='list-item-date'>" +
              (c.data_hora || "—") +
              "</div><p class='list-item-detail'>Gatilho: " +
              (c.gatilho_identificado || "—") +
              "</p><p class='list-item-detail'>Estratégia: " +
              (c.estrategia || "—") +
              "</p></div>"
          )
          .join("");
        if (registro_crises.length === 0)
          historyList.innerHTML =
            "<p style='padding:1rem'>Nenhum registro de crise.</p>";
      }

      renderCalendarWithEvents(eventos);
    },
    () => {}
  );
}

function loadTelaescolarData() {
  if (typeof window.SAPEA_API === "undefined") return;
  window.SAPEA_API.fetchTelaescolar().then(
    (res) => {
      const list = document.querySelector("#telaescolar .students-list");
      if (!list) return;
      const criancas = res.criancas || [];
      list.innerHTML = criancas
        .map(
          (c) =>
            "<div class='student-item'><div class='student-avatar'>" +
            (c.avatar || "👤") +
            "</div><div class='student-info'><p class='student-name'>" +
            (c.nome || "—") +
            "</p><p class='student-status status-good'>Status: " +
            (c.status || "—") +
            "</p></div><span class='badge badge-" +
            (c.nivel_risco === "ALTO"
              ? "high"
              : c.nivel_risco === "MEDIO"
              ? "medium"
              : "low") +
            "'>" +
            (c.nivel_risco || "Baixo") +
            "</span></div>"
        )
        .join("");
      if (criancas.length === 0)
        list.innerHTML =
          "<p style='padding:1rem'>Nenhuma criança vinculada.</p>";
    },
    () => {}
  );
}

function loadAmbienteData() {
  if (typeof window.SAPEA_API === "undefined") return;
  window.SAPEA_API.fetchAmbiente().then(
    (res) => {
      const grid = document.querySelector("#ambiente .ambiente-grid");
      if (!grid) return;
      const ambientes = res.ambientes || [];
      grid.innerHTML = ambientes
        .map(
          (a) =>
            "<div class='ambiente-card'><div class='ambiente-icon'>" +
            (a.icone || "🏫") +
            "</div><p class='ambiente-nome'>" +
            (a.nome || "—") +
            "</p><p class='ambiente-desc'>" +
            (a.descricao || "") +
            "</p></div>"
        )
        .join("");
      if (ambientes.length === 0)
        grid.innerHTML =
          "<p style='padding:1rem'>Nenhum ambiente cadastrado.</p>";
    },
    () => {}
  );
}

function loadHumorData() {
  if (typeof window.SAPEA_API === "undefined") return;
  window.SAPEA_API.fetchAcompanhamentoHumor().then(
    (res) => {
      const grid = document.querySelector("#acompanhamento-humor .humor-grid");
      if (!grid) return;
      const registros = res.registros || [];
      grid.innerHTML = registros
        .map(
          (r) =>
            "<div class='humor-card'><div class='humor-emoji'>" +
            (r.emoji || "😐") +
            "</div><p class='humor-label'>" +
            (r.estado || "—") +
            "</p><p class='humor-value'>" +
            (r.data_hora || "—") +
            "</p></div>"
        )
        .join("");
      if (registros.length === 0)
        grid.innerHTML =
          "<p style='padding:1rem'>Nenhum registro de humor.</p>";
    },
    () => {}
  );
}

function renderCalendarWithEvents(eventos) {
  const calendarView = document.getElementById("calendar-view");
  if (!calendarView) return;
  calendarView.innerHTML = "";

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  weekDays.forEach((day) => {
    const d = document.createElement("div");
    d.className = "calendar-day-header";
    d.textContent = day;
    d.style.fontWeight = "600";
    d.style.fontSize = "12px";
    d.style.color = "var(--color-text-light)";
    calendarView.appendChild(d);
  });

  for (let i = 0; i < firstDay.getDay(); i++) {
    calendarView.appendChild(document.createElement("div"));
  }

  const eventDates = (eventos || []).reduce((acc, e) => {
    const d = e.dataHoraInicio ? new Date(e.dataHoraInicio) : null;
    if (d && !isNaN(d.getTime())) {
      const key = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
      if (!acc[key]) acc[key] = [];
      acc[key].push(e);
    }
    return acc;
  }, {});

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const d = document.createElement("div");
    d.className = "calendar-day";
    d.textContent = day;
    if (day === today.getDate()) d.classList.add("today");
    const key = today.getFullYear() + "-" + today.getMonth() + "-" + day;
    if (eventDates[key] && eventDates[key].length > 0)
      d.classList.add("has-event");
    calendarView.appendChild(d);
  }
}

// ===== PAINEL ESCOLA =====
function showRoutineManager() {
  showNotification("Gerenciador de Rotina - Em desenvolvimento", "info");
}

function showCrisisRegister() {
  showNotification("Registro de Crise - Em desenvolvimento", "info");
}

function showEnvironmentManager() {
  showNotification("Gerenciador de Ambientes - Em desenvolvimento", "info");
}

// ===== NOTIFICAÇÕES =====
function showNotification(message, type = "info") {
  // Criar elemento de notificação
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Estilos inline para notificação
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "16px 24px",
    backgroundColor:
      type === "success"
        ? "#9ACD9A"
        : type === "warning"
        ? "#F4D03F"
        : type === "danger"
        ? "#E8A5A5"
        : "#7B9ACC",
    color: "#2C3E50",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: "10000",
    fontSize: "14px",
    fontWeight: "500",
    maxWidth: "300px",
    animation: "slideInRight 0.3s ease",
  });

  document.body.appendChild(notification);

  // Remover após 3 segundos
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// ===== PERSISTÊNCIA =====
function savePreferences() {
  const preferences = {
    colorTheme: appState.colorTheme,
    minimalMode: appState.minimalMode,
  };

  localStorage.setItem("sapea_preferences", JSON.stringify(preferences));
}

function loadPreferences() {
  const saved = localStorage.getItem("sapea_preferences");
  if (saved) {
    try {
      const preferences = JSON.parse(saved);
      appState.colorTheme = preferences.colorTheme || "blue";
      appState.minimalMode = preferences.minimalMode || false;
    } catch (e) {
      console.error("Erro ao carregar preferências:", e);
    }
  }
}

// ===== CALENDÁRIO =====
function generateCalendar() {
  renderCalendarWithEvents([]);
}

// Gerar calendário quando a tela de pais for carregada
document.addEventListener("DOMContentLoaded", () => {
  // Aguardar um pouco para garantir que o DOM está pronto
  setTimeout(() => {
    generateCalendar();
    // Aplicar tema salvo
    const savedColor = appState.colorTheme;
    if (savedColor) {
      document.querySelectorAll(".color-option").forEach((btn) => {
        if (btn.dataset.color === savedColor) {
          btn.classList.add("active");
        }
      });
    }
  }, 100);
});

// Detectar preferências de acessibilidade do sistema
if (window.matchMedia) {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (prefersReducedMotion.matches) {
    document.body.classList.add("reduced-motion");
  }

  prefersReducedMotion.addEventListener("change", (e) => {
    if (e.matches) {
      document.body.classList.add("reduced-motion");
    } else {
      document.body.classList.remove("reduced-motion");
    }
  });
}

// Adicionar animações CSS para notificações
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
