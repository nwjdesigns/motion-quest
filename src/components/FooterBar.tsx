interface FooterLink {
  label: string;
  url: string;
}

interface FooterBarProps {
  links?: FooterLink[];
}

export function FooterBar({ links = [] }: FooterBarProps) {
  return (
    <footer style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '56px',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: 'var(--mq-text-muted)',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      zIndex: 20,
    }}>
      <span>&copy;2026 Noah Webster-James</span>
      {links.length > 0 && (
        <nav style={{ display: 'flex', gap: '16px' }}>
          {links.map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--mq-text-muted)',
                textDecoration: 'none',
                transition: 'opacity 0.2s ease',
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </footer>
  );
}
