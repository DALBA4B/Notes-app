function saveToLocalStorage() {
    try {
        // Проверяем структуру перед сохранением
        if (!notesData || typeof notesData !== 'object') {
            notesData = { notes: [], themes: [] };
        }
        if (!Array.isArray(notesData.notes)) notesData.notes = [];
        if (!Array.isArray(notesData.themes)) notesData.themes = [];
        
        // Сохраняем данные
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(notesData));
        
        // Отладочная информация
        console.log('Сохранено:', notesData);
    } catch (e) {
        console.error('Ошибка при сохранении данных:', e);
    }
}

function getCurrentContainer() {
    try {
        if (!notesData || typeof notesData !== 'object') {
            notesData = { notes: [], themes: [] };
            saveToLocalStorage();
        }

        let container = notesData;
        
        for (const themeId of currentPath) {
            const theme = container.themes?.find(theme => theme.id === themeId);
            if (!theme) {
                console.error('Тема не найдена:', themeId);
                currentPath = [];
                return notesData;
            }
            container = theme;
        }
        
        // Гарантируем правильную структуру
        if (!Array.isArray(container.notes)) container.notes = [];
        if (!Array.isArray(container.themes)) container.themes = [];
        
        return container;
    } catch (e) {
        console.error('Ошибка в getCurrentContainer:', e);
        return { notes: [], themes: [] };
    }
}

function titleExists(title, type) {
    const container = getCurrentContainer();
    if (type === 'note') {
        return container.notes.some(note => note.title.toLowerCase() === title.toLowerCase());
    } else {
        return container.themes.some(theme => theme.title.toLowerCase() === title.toLowerCase());
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getBreadcrumbPath() {
    const path = ['Мои заметки'];
    let container = notesData;
    
    for (const themeId of currentPath) {
        const theme = container.themes.find(t => t.id === themeId);
        if (theme) {
            path.push(theme.title);
            container = theme;
        }
    }
    
    return path;
}

function updateBreadcrumb() {
    const path = getBreadcrumbPath();
    document.getElementById('current-location').textContent = path[path.length - 1];
    
    const backButton = document.getElementById('back-button');
    if (path.length > 1) {
        backButton.style.display = 'block';
    } else {
        backButton.style.display = 'none';
    }
}

function showNotification(message) {
    // Удаляем предыдущее уведомление, если оно есть
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Показываем уведомление
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Скрываем через 2 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
}