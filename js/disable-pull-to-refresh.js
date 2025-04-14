document.addEventListener('touchstart', function (event) {
    // Сохраняем начальную позицию касания
    this._startY = event.touches[0].clientY;
}, { passive: false });

document.addEventListener('touchmove', function (event) {
    const startY = this._startY || 0;
    const currentY = event.touches[0].clientY;

    // Если пользователь пытается потянуть вниз, находясь в верхней части страницы
    if (currentY > startY && window.scrollY === 0) {
        event.preventDefault(); // Блокируем pull-to-refresh
    }
}, { passive: false });