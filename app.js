/* Project CORE — HUD Menu Lab v2
   Минимальная интерактивность: лог клика по пункту меню.
   Вся геометрия панелей — CSS background-image на реальных пикселях
   img/ref-0003.png, без canvas/SVG отрисовки от руки. */
document.querySelectorAll('.item').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    console.log('menu:', el.textContent.trim());
  });
});
