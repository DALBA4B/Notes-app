// Таймер для задержки поиска
let searchTimeout = null;

// Рекурсивная функция поиска в контейнере
function searchInContainer(container, searchTerm, type, results = { notes: [], themes: [] }) {
    // Поиск в текущей теме
    if (type === 'title') {
        // Поиск по темам
        container.themes?.forEach(theme => {
            if (theme.title.toLowerCase().includes(searchTerm)) {
                results.themes.push(theme);
            }
            // Рекурсивный поиск в подтемах
            searchInContainer(theme, searchTerm, type, results);
        });

        // Поиск по заметкам
        container.notes?.forEach(note => {
            if (note.title.toLowerCase().includes(searchTerm)) {
                results.notes.push(note);
            }
        });
    } else {
        // Поиск по содержимому заметок
        container.notes?.forEach(note => {
            if (note.content.toLowerCase().includes(searchTerm)) {
                results.notes.push(note);
            }
        });

        // Рекурсивный поиск в подтемах
        container.themes?.forEach(theme => {
            searchInContainer(theme, searchTerm, type, results);
        });
    }

    return results;
}

// Основная функция поиска
function performSearch(type, searchTerm) {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
        searchTerm = searchTerm.toLowerCase();
        
        if (searchTerm === '') {
            renderCurrentLevel();
            return;
        }

        // Начинаем поиск с корня
        const results = searchInContainer(notesData, searchTerm, type);
        
        // Отображаем результаты
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = '';

        // Показываем результаты поиска
        results.themes.forEach(theme => {
            const themeCard = createThemeCard(theme);
            notesList.appendChild(themeCard);
        });

        results.notes.forEach(note => {
            const noteCard = createNoteCard(note);
            
            // Подсвечиваем найденный текст
            if (type === 'title') {
                const title = noteCard.querySelector('.mdl-card__title-text');
                title.innerHTML = highlightText(note.title, searchTerm);
            } else {
                const content = noteCard.querySelector('.mdl-card__supporting-text');
                const previewText = note.content.substring(0, CONFIG.MAX_PREVIEW_LENGTH) + 
                                  (note.content.length > CONFIG.MAX_PREVIEW_LENGTH ? '...' : '');
                content.innerHTML = highlightText(previewText, searchTerm);
            }
            
            notesList.appendChild(noteCard);
        });
        
        // Показываем сообщение, если ничего не найдено
        if (results.themes.length === 0 && results.notes.length === 0) {
            notesList.innerHTML = '<div class="no-results">Ничего не найдено</div>';
        }
        
    }, CONFIG.SEARCH_DELAY);
}

// Функция подсветки найденного текста
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}