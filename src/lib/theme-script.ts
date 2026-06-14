export function generateThemeScript(): string {
  return `(function(){var t=localStorage.getItem('mq-theme');if(!t){t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)})();`;
}
