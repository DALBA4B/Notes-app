// Обработчики событий
function proceedToNoteContent() {
    const titleInput = document.getElementById('note-title');
    const title = titleInput.value.trim();

    if (!title) {
        alert('Пожалуйста, введите заголовок заметки');
        return;
    }

    if (titleExists(title, 'note')) {
        alert('Заметка с таким названием уже существует');
        return;
    }

    tempNoteTitle = title;
    document.getElementById('add-note-dialog').close();
    document.getElementById('editing-note-title').textContent = title;
    document.getElementById('note-content').value = '';
    titleInput.value = ''; // Очищаем поле ввода заголовка
    
    document.querySelector('.notes-container').style.display = 'none';
    document.getElementById('note-content-editor').style.display = 'block';
    
    const preview = document.getElementById('preview-content');
    const editor = document.getElementById('note-content');
    preview.style.display = 'none';
    editor.style.display = 'block';
    editor.focus();
    currentEditor = editor;
    
    hasUnsavedChanges = false;
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
    document.getElementById('proceedToContentBtn').addEventListener('click', proceedToNoteContent);
    
    document.getElementById('cancelNoteTitleBtn').addEventListener('click', () => {
        addNoteDialog.close();
        document.getElementById('note-title').value = '';
    });
    
    // Обработчики для диалога создания темы
    document.getElementById('saveThemeBtn').addEventListener('click', saveTheme);
    
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
        document.getElementById('note-title').value = ''; // Очищаем поле при открытии диалога
        document.getElementById('add-note-dialog').showModal();
    });
    
    // Кнопка добавления темы
    document.getElementById('add-theme-button').addEventListener('click', () => {
        document.getElementById('theme-title').value = ''; // Очищаем поле при открытии диалога
        document.getElementById('add-theme-dialog').showModal();
    });
}

function initializeNoteEditor() {
    const editor = document.getElementById('note-content');
    const preview = document.getElementById('preview-content');
    
    // Кнопка закрытия редактора
    document.getElementById('close-editor-button').addEventListener('click', () => {
        if (hasUnsavedChanges) {
            if (!confirm('У вас есть несохраненные изменения. Вы уверены, что хотите закрыть редактор?')) {
                return;
            }
        }
        
        document.querySelector('.notes-container').style.display = 'block';
        document.getElementById('note-content-editor').style.display = 'none';
        editor.value = '';
        preview.innerHTML = '';
        editor.dataset.editingNoteId = '';
        hasUnsavedChanges = false;
        renderCurrentLevel();
    });
    
    // Кнопка сохранения
    document.getElementById('save-note-content').addEventListener('click', () => {
        saveNote();
        showNotification('Заметка сохранена');
    });
    
    // Отслеживание изменений
    editor.addEventListener('input', () => {
        hasUnsavedChanges = true;
    });

    // Добавляем обработчик двойного клика для переключения режима
    preview.addEventListener('dblclick', () => {
        preview.style.display = 'none';
        editor.style.display = 'block';
        editor.focus();
        currentEditor = editor;
    });

    editor.addEventListener('dblclick', () => {
        editor.style.display = 'none';
        preview.innerHTML = formatText(editor.value);
        preview.style.display = 'block';
        currentEditor = null;
    });
}

function initializeFormatMenu() {
    formatMenu = document.createElement('div');
    formatMenu.className = 'format-menu';
    formatMenu.style.display = 'none';
    formatMenu.innerHTML = `
        <button class="mdl-button mdl-js-button" data-format="bold">
            <i class="material-icons">format_bold</i>
        </button>
        <button class="mdl-button mdl-js-button" data-format="italic">
            <i class="material-icons">format_italic</i>
        </button>
        <button class="mdl-button mdl-js-button" data-format="strike">
            <i class="material-icons">format_strikethrough</i>
        </button>
        <button class="mdl-button mdl-js-button" data-format="code">
            <i class="material-icons">code</i>
        </button>
    `;
    
    document.body.appendChild(formatMenu);
    
    // Обработчики для кнопок форматирования
    formatMenu.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            const format = button.dataset.format;
            if (currentEditor) {
                applyFormat(format);
                hasUnsavedChanges = true;
            }
        });
    });

    // Скрываем меню форматирования при клике вне его
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.format-menu') && !e.target.closest('.note-content-textarea')) {
            formatMenu.style.display = 'none';
        }
    });
}

function initializeSearch() {
    const titleSearch = document.getElementById('title-search');
    const contentSearch = document.getElementById('content-search');
    
    titleSearch.addEventListener('input', () => {
        const searchTerm = titleSearch.value.toLowerCase();
        performSearch('title', searchTerm);
    });
    
    contentSearch.addEventListener('input', () => {
        const searchTerm = contentSearch.value.toLowerCase();
        performSearch('content', searchTerm);
    });
}