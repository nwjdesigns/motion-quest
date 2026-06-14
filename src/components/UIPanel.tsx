import type { LayoutMode } from './ConstellationScene';

export interface ExternalLink {
  label: string;
  url: string;
}

interface UIPanelProps {
  layout: LayoutMode;
  onLayoutChange: (layout: LayoutMode) => void;
  links: ExternalLink[];
  workWithMeUrl?: string;
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
}: UIPanelProps) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      padding: '16px 20px',
      background: 'rgba(255, 255, 255, 0.06)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '13px',
      color: '#ccc',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      opacity: 0.5,
      transition: 'opacity 0.3s ease',
      zIndex: 10,
    }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
    >
      <div style={{ display: 'flex', gap: '4px' }}>
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
              background: layout === l.key
                ? 'rgba(255, 255, 255, 0.2)'
                : 'transparent',
              color: layout === l.key ? '#fff' : '#999',
            }}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '10px',
      }}>
        {links.map(link => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#999',
              textDecoration: 'none',
              fontSize: '12px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#999')}
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
              color: '#9aff9a',
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
    </div>
  );
}
