// ============================================
// SAPEA - JavaScript Principal
// Sistema de Apoio Pedagógico Digital
// ============================================

// Estado da aplicação
const appState = {
    currentScreen: 'login-screen',
    currentUser: null,
    currentProfile: null,
    colorTheme: 'blue',
    minimalMode: false
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
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
        document.body.classList.add('minimal-mode');
        document.getElementById('minimal-mode').checked = true;
    }
}

// ===== NAVEGAÇÃO ENTRE TELAS =====
function showScreen(screenId) {
    // Esconder todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar tela selecionada
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        appState.currentScreen = screenId;
    }
}

// ===== AUTENTICAÇÃO =====
function handleLogin() {
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const profile = document.getElementById('user-profile').value;
    
    // Validação básica
    if (!email || !password || !profile) {
        showNotification('Por favor, preencha todos os campos.', 'warning');
        return;
    }
    
    // Simular login (em produção, isso seria uma chamada à API)
    appState.currentUser = email;
    appState.currentProfile = profile;
    
    // Redirecionar baseado no perfil
    if (profile === 'pais') {
        showScreen('pais-screen');
    } else if (profile === 'escola') {
        showScreen('escola-screen');
    } else if (profile === 'crianca') {
        showScreen('crianca-screen');
    }
    
    // Salvar preferências
    savePreferences();
    
    showNotification('Login realizado com sucesso!', 'success');
}

// ===== INTERFACE DA CRIANÇA =====
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const timeDisplay = document.getElementById('current-time');
    if (timeDisplay) {
        timeDisplay.textContent = timeString;
    }
}

function updateActivityProgress() {
    // Simular progresso da atividade atual
    const progressBar = document.getElementById('activity-progress');
    const timeRemaining = document.getElementById('time-remaining');
    
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
            timeRemaining.textContent = 'Quase acabando!';
        }
    }
}

function showTour() {
    const modal = document.getElementById('tour-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function showHelp() {
    const modal = document.getElementById('help-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function triggerSOS() {
    // Animação de feedback
    const sosBtn = document.getElementById('sos-btn');
    if (sosBtn) {
        sosBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            sosBtn.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Mostrar modal de confirmação
    showHelp();
    
    // Em produção, isso enviaria uma notificação para a equipe
    console.log('SOS acionado - notificação enviada para equipe');
    
    // Feedback visual adicional
    showNotification('Ajuda solicitada! Alguém virá em breve.', 'success');
}

// ===== MODAIS =====
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Fechar modal ao clicar fora
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// ===== CONFIGURAÇÕES =====
function showSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function changeColor(color) {
    appState.colorTheme = color;
    applyColorTheme(color);
    
    // Atualizar seleção visual
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-color="${color}"]`).classList.add('active');
    
    savePreferences();
}

function applyColorTheme(color) {
    const root = document.documentElement;
    
    const themes = {
        blue: {
            primary: '#7B9ACC',
            primaryLight: '#A8C4E8',
            primaryDark: '#5A7BA8'
        },
        green: {
            primary: '#9ACD9A',
            primaryLight: '#C4E6C4',
            primaryDark: '#7BA87B'
        },
        purple: {
            primary: '#B19CD9',
            primaryLight: '#D4C4E8',
            primaryDark: '#8B7CA8'
        },
        sand: {
            primary: '#D4C5A9',
            primaryLight: '#E8DDC9',
            primaryDark: '#A8967B'
        }
    };
    
    const theme = themes[color] || themes.blue;
    
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-light', theme.primaryLight);
    root.style.setProperty('--color-primary-dark', theme.primaryDark);
}

function toggleMinimalMode() {
    const checkbox = document.getElementById('minimal-mode');
    appState.minimalMode = checkbox.checked;
    
    if (appState.minimalMode) {
        document.body.classList.add('minimal-mode');
    } else {
        document.body.classList.remove('minimal-mode');
    }
    
    savePreferences();
}

// ===== PAINEL ESCOLA =====
function showRoutineManager() {
    showNotification('Gerenciador de Rotina - Em desenvolvimento', 'info');
}

function showCrisisRegister() {
    showNotification('Registro de Crise - Em desenvolvimento', 'info');
}

function showEnvironmentManager() {
    showNotification('Gerenciador de Ambientes - Em desenvolvimento', 'info');
}

// ===== NOTIFICAÇÕES =====
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos inline para notificação
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        backgroundColor: type === 'success' ? '#9ACD9A' : 
                        type === 'warning' ? '#F4D03F' : 
                        type === 'danger' ? '#E8A5A5' : '#7B9ACC',
        color: '#2C3E50',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '10000',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '300px',
        animation: 'slideInRight 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ===== PERSISTÊNCIA =====
function savePreferences() {
    const preferences = {
        colorTheme: appState.colorTheme,
        minimalMode: appState.minimalMode
    };
    
    localStorage.setItem('sapea_preferences', JSON.stringify(preferences));
}

function loadPreferences() {
    const saved = localStorage.getItem('sapea_preferences');
    if (saved) {
        try {
            const preferences = JSON.parse(saved);
            appState.colorTheme = preferences.colorTheme || 'blue';
            appState.minimalMode = preferences.minimalMode || false;
        } catch (e) {
            console.error('Erro ao carregar preferências:', e);
        }
    }
}

// ===== CALENDÁRIO =====
function generateCalendar() {
    const calendarView = document.getElementById('calendar-view');
    if (!calendarView) return;
    
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Dias da semana
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekDays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        dayHeader.style.fontWeight = '600';
        dayHeader.style.fontSize = '12px';
        dayHeader.style.color = 'var(--color-text-light)';
        calendarView.appendChild(dayHeader);
    });
    
    // Espaços vazios antes do primeiro dia
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        calendarView.appendChild(emptyDay);
    }
    
    // Dias do mês
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        if (day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Simular eventos (em produção, viria do backend)
        if (day % 7 === 0) {
            dayElement.classList.add('has-event');
        }
        
        calendarView.appendChild(dayElement);
    }
}

// Gerar calendário quando a tela de pais for carregada
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que o DOM está pronto
    setTimeout(() => {
        generateCalendar();
        // Aplicar tema salvo
        const savedColor = appState.colorTheme;
        if (savedColor) {
            document.querySelectorAll('.color-option').forEach(btn => {
                if (btn.dataset.color === savedColor) {
                    btn.classList.add('active');
                }
            });
        }
    }, 100);
});

// Detectar preferências de acessibilidade do sistema
if (window.matchMedia) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
        document.body.classList.add('reduced-motion');
    }
    
    prefersReducedMotion.addEventListener('change', (e) => {
        if (e.matches) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
    });
}

// Adicionar animações CSS para notificações
const style = document.createElement('style');
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

