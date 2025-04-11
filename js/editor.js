function initializeNoteEditor() {
    const contentEditor = document.getElementById('note-content');
    const preview = document.getElementById('preview-content');
    const saveButton = document.getElementById('save-note-content');
    
    // Инициализация уведомлений
    let notificationTimeout;
    const showNotification = (message) => {
        clearTimeout(notificationTimeout);
        
        const oldNotification = document.querySelector('.notification');
        if (oldNotification) {
            oldNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        notificationTimeout = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    };
    
    contentEditor.addEventListener('input', () => {
        hasUnsavedChanges = true;
    });

    contentEditor.addEventListener('mouseup', (e) => {
        const selection = contentEditor.value.substring(
            contentEditor.selectionStart,
            contentEditor.selectionEnd
        );
        
        if (selection) {
            showFormatMenu(e.clientX, e.clientY);
        } else {
            hideFormatMenu();
        }
    });

    document.getElementById('close-editor-button').addEventListener('click', () => {
        if (hasUnsavedChanges && !confirm('У вас есть несохраненные изменения. Вы уверены, что хотите закрыть редактор?')) {
            return;
        }
        closeEditor();
    });

    // Обработчик сохранения
    saveButton.addEventListener('click', () => {
        if (!hasUnsavedChanges) return;

        const container = getCurrentContainer();
        const editingNoteId = contentEditor.dataset.editingNoteId;
        const content = contentEditor.value;
        const now = new Date().toISOString();

        if (editingNoteId) {
            const note = container.notes.find(n => n.id === parseInt(editingNoteId));
            if (note) {
                note.content = content;
                note.updatedAt = now;
            }
        } else {
            const newNote = {
                id: Date.now(),
                title: tempNoteTitle,
                content,
                createdAt: now,
                updatedAt: now
            };
            container.notes.unshift(newNote);
            contentEditor.dataset.editingNoteId = newNote.id;
        }

        saveToLocalStorage();
        hasUnsavedChanges = false;
        showNotification('Заметка сохранена');
    });

    // Горячие клавиши
    contentEditor.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveButton.click();
        }
    });

    // Переключение в режим редактирования
    preview.addEventListener('click', () => {
        preview.style.display = 'none';
        contentEditor.style.display = 'block';
        contentEditor.focus();
        currentEditor = contentEditor;
    });
}

function closeEditor() {
    document.querySelector('.notes-container').style.display = 'block';
    document.getElementById('note-content-editor').style.display = 'none';
    document.getElementById('note-content').dataset.editingNoteId = '';
    tempNoteTitle = '';
    currentEditor = null;
    hasUnsavedChanges = false;
    
    const notification = document.querySelector('.notification');
    if (notification) {
        notification.remove();
    }
    
    renderCurrentLevel();
}

function formatSelectedText(format) {
    const editor = currentEditor;
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    
    const formats = {
        bold: text => `**${text}**`
    };

    if (formats[format]) {
        const replacement = formats[format](selectedText);
        editor.value = editor.value.substring(0, start) + replacement + editor.value.substring(end);
        editor.focus();
        editor.selectionStart = start;
        editor.selectionEnd = start + replacement.length;
        hasUnsavedChanges = true;
    }
}