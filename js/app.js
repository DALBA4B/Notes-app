// Загрузка данных при старте
function initializeApp() {
    try {
        const savedData = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (savedData) {
            notesData = JSON.parse(savedData);
        }
        
        // Проверяем структуру данных и инициализируем, если нужно
        if (!notesData || typeof notesData !== 'object') {
            notesData = {
                notes: [],
                themes: []
            };
        }
        
        // Убеждаемся, что массивы существуют
        if (!Array.isArray(notesData.notes)) notesData.notes = [];
        if (!Array.isArray(notesData.themes)) notesData.themes = [];
        
        // Сохраняем исправленную структуру
        saveToLocalStorage();
        
    } catch (e) {
        console.error('Ошибка при загрузке данных:', e);
        notesData = {
            notes: [],
            themes: []
        };
        saveToLocalStorage();
    }

    // Инициализация компонентов
    initializeDialogs();
    initializeButtons();
    initializeNoteEditor();
    initializeFormatMenu();
    initializeSearch();
    
    // Принудительная отрисовка
    renderCurrentLevel();
}

function renderCurrentLevel() {
    const container = getCurrentContainer();
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';

    // Отладочная информация
    console.log('Текущий контейнер:', container);
    console.log('Заметки:', container.notes);
    console.log('Темы:', container.themes);

    // Проверяем и создаем массивы, если их нет
    if (!Array.isArray(container.notes)) container.notes = [];
    if (!Array.isArray(container.themes)) container.themes = [];

    // Отрисовка тем
    container.themes.forEach(theme => {
        const themeCard = createThemeCard(theme);
        notesList.appendChild(themeCard);
    });

    // Отрисовка заметок
    container.notes.forEach(note => {
        const noteCard = createNoteCard(note);
        notesList.appendChild(noteCard);
    });

    updateBreadcrumb();
}

function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'mdl-card mdl-shadow--2dp note-card';
    
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
        <button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect edit-note" data-note-id="${note.id}">
            Редактировать
        </button>
        <button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect delete-note" data-note-id="${note.id}">
            Удалить
        </button>
        <div class="mdl-layout-spacer"></div>
        <span class="note-date">
            ${note.updatedAt ? 'Изменено: ' + formatDate(note.updatedAt) : 'Создано: ' + formatDate(note.createdAt)}
        </span>
    `;
    
    card.appendChild(title);
    card.appendChild(text);
    card.appendChild(actions);
    
    // Добавляем обработчики событий
    card.querySelector('.edit-note').addEventListener('click', () => editNote(note.id));
    card.querySelector('.delete-note').addEventListener('click', () => deleteNote(note.id));
    
    return card;
}

function createThemeCard(theme) {
    const card = document.createElement('div');
    card.className = 'mdl-card mdl-shadow--2dp theme-card';
    
    const title = document.createElement('div');
    title.className = 'mdl-card__title';
    title.innerHTML = `
        <h2 class="mdl-card__title-text">
            <i class="material-icons">folder</i>
            ${theme.title}
        </h2>
    `;
    
    const text = document.createElement('div');
    text.className = 'mdl-card__supporting-text';
    text.textContent = `Заметок: ${theme.notes.length}, Подтем: ${theme.themes.length}`;
    
    const actions = document.createElement('div');
    actions.className = 'mdl-card__actions mdl-card--border';
    actions.innerHTML = `
        <button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect open-theme" data-theme-id="${theme.id}">
            Открыть
        </button>
        <button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect delete-theme" data-theme-id="${theme.id}">
            Удалить
        </button>
    `;
    
    card.appendChild(title);
    card.appendChild(text);
    card.appendChild(actions);
    
    // Добавляем обработчики событий
    card.querySelector('.open-theme').addEventListener('click', () => openTheme(theme.id));
    card.querySelector('.delete-theme').addEventListener('click', () => deleteTheme(theme.id));
    
    return card;
}

function saveNote() {
    const contentEditor = document.getElementById('note-content');
    const content = contentEditor.value;
    const now = new Date().toISOString();
    const container = getCurrentContainer();
    const editingNoteId = contentEditor.dataset.editingNoteId;

    if (editingNoteId) {
        // Редактирование существующей заметки
        const noteId = parseInt(editingNoteId);
        const note = container.notes.find(n => n.id === noteId);
        if (note) {
            note.content = content;
            note.updatedAt = now;
        }
    } else {
        // Создание новой заметки
        const newNote = {
            id: Date.now(),
            title: tempNoteTitle,
            content: content,
            createdAt: now,
            updatedAt: now
        };

        // Инициализируем массив заметок, если его нет
        if (!Array.isArray(container.notes)) container.notes = [];
        
        // Добавляем заметку в начало массива
        container.notes.unshift(newNote);
        
        // Обновляем id редактируемой заметки
        contentEditor.dataset.editingNoteId = newNote.id;
    }

    saveToLocalStorage();
    hasUnsavedChanges = false;
}

function editNote(noteId) {
    const container = getCurrentContainer();
    const note = container.notes.find(n => n.id === noteId);
    if (!note) return;

    tempNoteTitle = note.title;
    document.getElementById('editing-note-title').textContent = note.title;
    
    const contentEditor = document.getElementById('note-content');
    const preview = document.getElementById('preview-content');
    
    contentEditor.value = note.content;
    contentEditor.dataset.editingNoteId = noteId;
    
    document.querySelector('.notes-container').style.display = 'none';
    document.getElementById('note-content-editor').style.display = 'block';
    
    preview.innerHTML = formatText(note.content);
    preview.style.display = 'block';
    contentEditor.style.display = 'none';
    currentEditor = null;
    
    hasUnsavedChanges = false;
}

function deleteNote(noteId) {
    if (!confirm(MESSAGES.CONFIRM_DELETE)) {
        return;
    }

    const container = getCurrentContainer();
    container.notes = container.notes.filter(note => note.id !== noteId);
    saveToLocalStorage();
    renderCurrentLevel();
}

function openTheme(themeId) {
    currentPath.push(themeId);
    renderCurrentLevel();
}

function saveTheme() {
    const titleInput = document.getElementById('theme-title');
    const title = titleInput.value.trim();

    if (!title) {
        alert(MESSAGES.TITLE_REQUIRED);
        return;
    }

    if (titleExists(title, 'theme')) {
        alert(MESSAGES.TITLE_EXISTS);
        return;
    }

    const theme = {
        id: Date.now(),
        title: title,
        notes: [],
        themes: []
    };

    const container = getCurrentContainer();
    if (!Array.isArray(container.themes)) container.themes = [];
    container.themes.unshift(theme);
    saveToLocalStorage();
    
    document.getElementById('add-theme-dialog').close();
    titleInput.value = '';
    renderCurrentLevel();
}

function deleteTheme(themeId) {
    if (!confirm(MESSAGES.CONFIRM_DELETE)) {
        return;
    }

    const container = getCurrentContainer();
    container.themes = container.themes.filter(theme => theme.id !== themeId);
    saveToLocalStorage();
    renderCurrentLevel();
}

// Обработка beforeunload для предупреждения о несохраненных изменениях
window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Показ меню форматирования при выделении текста
document.addEventListener('selectionchange', () => {
    if (!currentEditor) return;
    
    const selection = window.getSelection().toString();
    if (selection && document.activeElement === currentEditor) {
        const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
        formatMenu.style.display = 'flex';
        formatMenu.style.position = 'fixed';
        formatMenu.style.left = `${rect.left}px`;
        formatMenu.style.top = `${rect.top - formatMenu.offsetHeight - 5}px`;
    }
});

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', initializeApp);