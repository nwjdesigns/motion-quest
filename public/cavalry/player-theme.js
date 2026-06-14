// The host page posts { type: 'theme-change', theme } so the player chrome
// (background, status text) can match light/dark instead of being hardcoded
// black. Only accept known message shapes and themes: a message listener must
// not apply arbitrary postMessage data.
const VALID_THEMES = ['light', 'dark'];

export function resolveThemeMessage(data) {
  if (!data || typeof data !== 'object') return null;
  if (data.type !== 'theme-change') return null;
  if (!VALID_THEMES.includes(data.theme)) return null;
  return data.theme;
}
