const CONFIG = {
    STORAGE_KEY: 'notesData',
    SEARCH_DELAY: 300,
    MAX_PREVIEW_LENGTH: 100,
    MAX_NOTE_LENGTH: 50000,
    MAX_TITLE_LENGTH: 100,
    THEME_KEY: 'notesAppTheme',
    THEMES: {
        LIGHT: 'light',
        DARK: 'dark',
        BLACK: 'black'
    }
};

const EVENTS = {
    SAVE: 'save',
    DELETE: 'delete',
    EDIT: 'edit'
};

const MESSAGES = {
    CONFIRM_DELETE: 'Вы уверены, что хотите удалить это?',
    UNSAVED_CHANGES: 'У вас есть несохраненные изменения. Вы уверены, что хотите закрыть?',
    TITLE_REQUIRED: 'Пожалуйста, введите заголовок',
    TITLE_EXISTS: 'Элемент с таким названием уже существует'
};