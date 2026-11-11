/*
  Se carga en <head> sin defer para fijar el tema antes de pintar la página
  y evitar un parpadeo de color. Prioridad: elección guardada > sistema.
*/
(function () {
  var theme = null;
  try { theme = localStorage.getItem('theme'); } catch (e) { /* almacenamiento no disponible */ }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.add('js');
})();
