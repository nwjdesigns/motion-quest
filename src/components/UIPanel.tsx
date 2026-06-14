import { useState } from 'react';
import type { LayoutMode } from './ConstellationScene';
import type { Theme } from '../lib/theme';

export interface ExternalLink {
  label: string;
  url: string;
}

interface UIPanelProps {
  layout: LayoutMode;
  onLayoutChange: (layout: LayoutMode) => void;
  links: ExternalLink[];
  workWithMeUrl?: string;
  theme: Theme;
  onThemeToggle: () => void;
  /** Touch / no-hover device: collapse the panel behind a tappable toggle. */
  isTouch?: boolean;
}

const layouts: { key: LayoutMode; label: string }[] = [
  { key: 'constellation', label: 'Constellation' },
  { key: 'grid', label: 'Grid' },
  { key: 'spiral', label: 'Spiral' },
];

export function UIPanel({
  layout,
  onLayoutChange,
  links,
  workWithMeUrl,
  theme,
  onThemeToggle,
  isTouch = false,
}: UIPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const isDark = theme === 'dark';
  const panelBg = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
  const panelBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = isDark ? '#ccc' : '#333';
  const mutedColor = isDark ? '#999' : '#666';
  const activeColor = isDark ? '#fff' : '#111';
  const activeBg = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
  const accentColor = isDark ? '#9aff9a' : '#2e7d32';

  const showContent = !isTouch || expanded;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      padding: isTouch && !expanded ? '10px 14px' : '16px 20px',
      background: panelBg,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '12px',
      border: `1px solid ${panelBorder}`,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '13px',
      color: textColor,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: 'calc(100vw - 48px)',
      opacity: isTouch ? 1 : 0.5,
      transition: 'opacity 0.3s ease',
      zIndex: 10,
    }}
      onMouseEnter={isTouch ? undefined : e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={isTouch ? undefined : e => (e.currentTarget.style.opacity = '0.5')}
    >
      {isTouch && (
        <button
          onClick={() => setExpanded(v => !v)}
          aria-label={expanded ? 'Close menu' : 'Open menu'}
          aria-expanded={expanded}
          style={{
            alignSelf: 'flex-start',
            padding: '6px 12px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px',
            background: activeBg,
            color: activeColor,
          }}
        >
          {expanded ? '✕' : '☰'}
        </button>
      )}

      {showContent && (
      <>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {layouts.map(l => (
          <button
            key={l.key}
            onClick={() => onLayoutChange(l.key)}
            style={{
              padding: '5px 10px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '12px',
              transition: 'all 0.2s ease',
              background: layout === l.key ? activeBg : 'transparent',
              color: layout === l.key ? activeColor : mutedColor,
            }}
          >
            {l.label}
          </button>
        ))}
        <button
          onClick={onThemeToggle}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          style={{
            marginLeft: 'auto',
            padding: '5px 10px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '12px',
            transition: 'all 0.2s ease',
            background: 'transparent',
            color: mutedColor,
          }}
        >
          {isDark ? 'Light' : 'Dark'}
        </button>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
        paddingTop: '10px',
      }}>
        {links.map(link => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: mutedColor,
              textDecoration: 'none',
              fontSize: '12px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = activeColor)}
            onMouseLeave={e => (e.currentTarget.style.color = mutedColor)}
          >
            {link.label}
          </a>
        ))}
        {workWithMeUrl && (
          <a
            href={workWithMeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: accentColor,
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Work with me
          </a>
        )}
      </div>
      </>
      )}
    </div>
  );
}
