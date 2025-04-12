// UI компоненты
function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'note-card mdl-card mdl-shadow--2dp';
    
    const title = document.createElement('div');
    title.className = 'mdl-card__title';
    title.innerHTML = `<h2 class="mdl-card__title-text">${note.title}</h2>`;
    
    const text = document.createElement('div');
    text.className = 'mdl-card__supporting-text';
    text.textContent = note.content.substring(0, CONFIG.MAX_PREVIEW_LENGTH) + 
                      (note.content.length > CONFIG.MAX_PREVIEW_LENGTH ? '...' : '');
    
    const actions = document.createElement('div');
    actions.className = 'mdl-card__actions mdl-card--border';
    actions.innerHTML = `
        <div class="mdl-layout-spacer"></div>
        <button class="mdl-button mdl-button--icon mdl-button--colored" onclick="editNote(${note.id})">
            <i class="material-icons">edit</i>
        </button>
        <button class="mdl-button mdl-button--icon mdl-button--colored" onclick="deleteNote(${note.id})">
            <i class="material-icons">delete</i>
        </button>
    `;
    
    const subtitle = document.createElement('div');
    subtitle.className = 'mdl-card__subtitle-text';
    subtitle.style.padding = '8px 16px';
    subtitle.textContent = `Обновлено: ${formatDate(note.updatedAt || note.createdAt)}`;
    
    card.appendChild(title);
    card.appendChild(text);
    card.appendChild(subtitle);
    card.appendChild(actions);
    
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.mdl-button')) {
            editNote(note.id);
        }
    });
    
    return card;
}

function createThemeCard(theme) {
    const card = document.createElement('div');
    card.className = 'theme-card mdl-card mdl-shadow--2dp';
    
    const title = document.createElement('div');
    title.className = 'mdl-card__title';
    title.innerHTML = `<h2 class="mdl-card__title-text">${theme.title}</h2>`;
    
    const text = document.createElement('div');
    text.className = 'mdl-card__supporting-text';
    const notesCount = theme.notes ? theme.notes.length : 0;
    const themesCount = theme.themes ? theme.themes.length : 0;
    text.textContent = `Заметок: ${notesCount}, Тем: ${themesCount}`;
    
    const actions = document.createElement('div');
    actions.className = 'mdl-card__actions mdl-card--border';
    actions.innerHTML = `
        <div class="mdl-layout-spacer"></div>
        <button class="mdl-button mdl-button--icon mdl-button--colored" onclick="deleteTheme(${theme.id})">
            <i class="material-icons">delete</i>
        </button>
    `;
    
    card.appendChild(title);
    card.appendChild(text);
    card.appendChild(actions);
    
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.mdl-button')) {
            openTheme(theme.id);
        }
    });
    
    return card;
}

function initializeDialogs() {
    const addNoteDialog = document.getElementById('add-note-dialog');
    const addThemeDialog = document.getElementById('add-theme-dialog');
    
    if (!addNoteDialog.showModal) {
        dialogPolyfill.registerDialog(addNoteDialog);
    }
    if (!addThemeDialog.showModal) {
        dialogPolyfill.registerDialog(addThemeDialog);
    }
    
    document.getElementById('proceedToContentBtn').addEventListener('click', () => {
        proceedToNoteContent();
    });
    
    document.getElementById('cancelNoteTitleBtn').addEventListener('click', () => {
        addNoteDialog.close();
        document.getElementById('note-title').value = '';
    });
    
    document.getElementById('saveThemeBtn').addEventListener('click', () => {
        saveTheme();
    });
    
    document.getElementById('cancelThemeBtn').addEventListener('click', () => {
        addThemeDialog.close();
        document.getElementById('theme-title').value = '';
    });
}

function initializeButtons() {
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            currentPath.pop();
            renderCurrentLevel();
        });
    }
    
    const addNoteButton = document.getElementById('add-note-button');
    if (addNoteButton) {
        addNoteButton.addEventListener('click', () => {
            document.getElementById('add-note-dialog').showModal();
        });
    }
    
    const addThemeButton = document.getElementById('add-theme-button');
    if (addThemeButton) {
        addThemeButton.addEventListener('click', () => {
            document.getElementById('add-theme-dialog').showModal();
        });
    }

    initializeSettingsButton();
}

function initializeSettingsButton() {
    const settingsButton = document.getElementById('settings-button');
    const settingsPage = document.getElementById('settings-page');
    const closeSettingsButton = document.getElementById('close-settings-button');
    
    if (settingsButton && settingsPage && closeSettingsButton) {
        settingsButton.addEventListener('click', () => {
            document.querySelector('.notes-container').style.display = 'none';
            settingsPage.style.display = 'block';
        });

        closeSettingsButton.addEventListener('click', () => {
            settingsPage.style.display = 'none';
            document.querySelector('.notes-container').style.display = 'block';
        });
    }
}

function initializeThemes() {
    const themeOptions = document.querySelectorAll('.theme-option');
    let currentTheme = localStorage.getItem(CONFIG.THEME_KEY) || CONFIG.THEMES.LIGHT;
    
    // Применяем тему при загрузке
    applyTheme(currentTheme);

    themeOptions.forEach(option => {
        // Добавляем обработчик для каждой опции темы
        option.addEventListener('click', function() {
            const newTheme = this.dataset.theme;
            if (newTheme && newTheme !== currentTheme) {
                currentTheme = newTheme;
                applyTheme(newTheme);
                localStorage.setItem(CONFIG.THEME_KEY, newTheme);
                
                // Обновляем активное состояние
                themeOptions.forEach(opt => {
                    opt.classList.remove('active');
                });
                this.classList.add('active');
            }
        });

        // Устанавливаем активное состояние для текущей темы
        if (option.dataset.theme === currentTheme) {
            option.classList.add('active');
        }
    });
}

function applyTheme(themeName) {
    // Проверяем валидность темы
    if (!Object.values(CONFIG.THEMES).includes(themeName)) {
        themeName = CONFIG.THEMES.LIGHT;
    }

    // Применяем тему к HTML и Body
    document.documentElement.setAttribute('data-theme', themeName);
    document.body.setAttribute('data-theme', themeName);
}

function updateBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');
    const currentLocation = document.getElementById('current-location');
    
    if (currentPath.length > 0) {
        breadcrumb.style.display = 'flex';
        currentLocation.textContent = getCurrentTheme().title;
    } else {
        breadcrumb.style.display = 'none';
        currentLocation.textContent = '';
    }
}

function showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, duration);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initializeDialogs();
    initializeButtons();
    initializeThemes();
});