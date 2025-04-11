// UI компоненты
function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'note-card mdl-card mdl-shadow--2dp';
    
    const title = document.createElement('div');
    title.className = 'mdl-card__title';
    title.innerHTML = `<h2 class="mdl-card__title-text">${note.title}</h2>`;
    
    const text = document.createElement('div');
    text.className = 'mdl-card__supporting-text';
    text.textContent = note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');
    
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
    
    // Добавляем обработчик для открытия заметки при клике
    card.addEventListener('click', (e) => {
        // Игнорируем клики по кнопкам
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
    
    // Добавляем обработчик для открытия темы при клике
    card.addEventListener('click', (e) => {
        // Игнорируем клики по кнопкам
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
    
    // Обработчики для диалога создания заметки
    document.getElementById('proceedToContentBtn').addEventListener('click', () => {
        proceedToNoteContent();
    });
    
    document.getElementById('cancelNoteTitleBtn').addEventListener('click', () => {
        addNoteDialog.close();
        document.getElementById('note-title').value = '';
    });
    
    // Обработчики для диалога создания темы
    document.getElementById('saveThemeBtn').addEventListener('click', () => {
        saveTheme();
    });
    
    document.getElementById('cancelThemeBtn').addEventListener('click', () => {
        addThemeDialog.close();
        document.getElementById('theme-title').value = '';
    });
}

function initializeButtons() {
    // Кнопка "Назад"
    document.getElementById('back-button').addEventListener('click', () => {
        currentPath.pop();
        renderCurrentLevel();
    });
    
    // Кнопка добавления заметки
    document.getElementById('add-note-button').addEventListener('click', () => {
        document.getElementById('add-note-dialog').showModal();
    });
    
    // Кнопка добавления темы
    document.getElementById('add-theme-button').addEventListener('click', () => {
        document.getElementById('add-theme-dialog').showModal();
    });
}