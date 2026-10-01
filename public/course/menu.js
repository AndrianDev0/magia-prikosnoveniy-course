document.querySelectorAll('.artwork-menu').forEach(menu => {
  document.addEventListener('pointerdown', event => {
    if (!menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) menu.open = false;
  });
});

const placeholderToast = document.querySelector('.site-placeholder-toast');
let placeholderToastTimer;
document.querySelectorAll('[data-video-title]').forEach(button => {
  button.addEventListener('click', () => {
    if (!placeholderToast) return;
    placeholderToast.textContent = `«${button.dataset.videoTitle}»: видео будет добавлено позже`;
    placeholderToast.hidden = false;
    clearTimeout(placeholderToastTimer);
    placeholderToastTimer = setTimeout(() => { placeholderToast.hidden = true; }, 2600);
  });
});
