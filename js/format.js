// Функции форматирования текста
function initializeFormatMenu() {
    formatMenu = document.getElementById('format-menu');
    document.getElementById('bold-button').addEventListener('click', () => {
        if (currentEditor) {
            applyBoldFormat();
            hideFormatMenu();
        }
    });

    document.addEventListener('click', (e) => {
        if (!formatMenu.contains(e.target) && e.target !== currentEditor) {
            hideFormatMenu();
        }
    });
}

function showFormatMenu(x, y) {
    formatMenu.style.left = `${x}px`;
    formatMenu.style.top = `${y}px`;
    formatMenu.style.display = 'block';
}

function hideFormatMenu() {
    formatMenu.style.display = 'none';
}

function applyBoldFormat() {
    const editor = currentEditor;
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    
    if (selectedText) {
        const beforeText = editor.value.substring(0, start);
        const afterText = editor.value.substring(end);
        
        const formattedText = `**${selectedText}**`;
        
        editor.value = beforeText + formattedText + afterText;
        
        const preview = document.getElementById('preview-content');
        preview.innerHTML = formatText(editor.value);
        
        hasUnsavedChanges = true;
        
        editor.selectionStart = start + 2;
        editor.selectionEnd = start + 2 + selectedText.length;
    }
}