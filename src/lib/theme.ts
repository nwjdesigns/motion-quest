export type Theme = 'light' | 'dark';

export function resolveInitialTheme(
  stored: string | null,
  systemPrefersDark: boolean,
): Theme {
  if (stored === 'light' || stored === 'dark') return stored;
  return systemPrefersDark ? 'dark' : 'light';
}

export interface ThemeColors {
  background: string;
  particleColor: [number, number, number];
  lineColor: string;
  panelText: string;
}

const darkColors: ThemeColors = {
  background: '#0a0a0a',
  particleColor: [0.4, 0.45, 0.5],
  lineColor: '#666666',
  panelText: '#cccccc',
};

const lightColors: ThemeColors = {
  background: '#f5f5f5',
  particleColor: [0.3, 0.3, 0.35],
  lineColor: '#999999',
  panelText: '#333333',
};

export function getThemeColors(theme: Theme): ThemeColors {
  return theme === 'dark' ? darkColors : lightColors;
}

export interface CssVariables {
  '--mq-bg': string;
  '--mq-text': string;
  '--mq-text-muted': string;
  '--mq-panel-bg': string;
  '--mq-panel-border': string;
  '--mq-accent': string;
}

export function getCssVariables(theme: Theme): CssVariables {
  if (theme === 'dark') {
    return {
      '--mq-bg': '#0a0a0a',
      '--mq-text': '#eaeaea',
      '--mq-text-muted': '#999999',
      '--mq-panel-bg': 'rgba(255, 255, 255, 0.06)',
      '--mq-panel-border': 'rgba(255, 255, 255, 0.1)',
      '--mq-accent': '#9aff9a',
    };
  }
  return {
    '--mq-bg': '#f5f5f5',
    '--mq-text': '#1a1a1a',
    '--mq-text-muted': '#666666',
    '--mq-panel-bg': 'rgba(0, 0, 0, 0.04)',
    '--mq-panel-border': 'rgba(0, 0, 0, 0.1)',
    '--mq-accent': '#2e7d32',
  };
}

export function buildThemedPlayerUrl(baseUrl: string, theme: Theme): string {
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}theme=${theme}`;
}
