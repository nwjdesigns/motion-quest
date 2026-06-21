import { useEffect, useRef } from 'react';
import type { Theme } from '../lib/theme';
import { HOMEPAGE_SCALE } from '../lib/mark-engine';

interface NavProps {
  baseUrl: string;
  prev: string | null;
  next: string | null;
}

interface TopBarProps {
  theme: Theme;
  onThemeToggle: () => void;
  nav?: NavProps;
  /** Mark behaviour engine output: cumulative rotation in degrees. */
  markRotation?: number;
  /** Mark behaviour engine output: rendered size in px. */
  markScale?: number;
  /** Called when the pointer enters / leaves the mark's proximity radius. */
  onMarkHoverChange?: (hovering: boolean) => void;
}

/** Pointer proximity radius (px) around the mark centre that counts as hover. */
const MARK_HOVER_RADIUS = 64;

export function TopBar({
  theme,
  onThemeToggle,
  nav,
  markRotation = 0,
  markScale = HOMEPAGE_SCALE,
  onMarkHoverChange,
}: TopBarProps) {
  const isDark = theme === 'dark';
  const markRef = useRef<SVGSVGElement>(null);

  // Hover via pointer proximity to the mark element (not just hard hover).
  useEffect(() => {
    if (!onMarkHoverChange) return;
    let hovering = false;
    const onMove = (e: PointerEvent) => {
      const el = markRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const near = dist <= MARK_HOVER_RADIUS;
      if (near !== hovering) {
        hovering = near;
        onMarkHoverChange(near);
      }
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [onMarkHoverChange]);

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '64px',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      zIndex: 20,
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      <svg
        ref={markRef}
        aria-label="Motion Quest"
        width={markScale}
        height={markScale}
        viewBox="0 0 666 666"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          flexShrink: 0,
          transform: `rotate(${markRotation}deg)`,
          transformOrigin: 'center',
          willChange: 'transform',
        }}
      >
        <path d="M465.975 154.367C576.446 154.367 666 188.41 666 230.404C666 272.398 576.446 306.441 465.975 306.441C434.373 306.441 404.483 303.655 377.911 298.694C481.361 295.772 562.905 262.941 562.905 222.869C562.905 192.887 517.259 166.959 450.944 154.578C455.906 154.438 460.919 154.367 465.975 154.367Z" fill="currentColor"/>
        <path d="M200.025 511.633C89.5543 511.633 0 477.59 0 435.596C0 393.602 89.5543 359.559 200.025 359.559C231.627 359.559 261.517 362.345 288.089 367.306C184.639 370.228 103.095 403.059 103.095 443.131C103.095 473.112 148.741 499.041 215.056 511.422C210.094 511.562 205.081 511.633 200.025 511.633Z" fill="currentColor"/>
        <path d="M511.633 465.975C511.633 576.446 477.59 666 435.596 666C393.602 666 359.559 576.446 359.559 465.975C359.559 434.372 362.345 404.482 367.306 377.91C370.228 481.361 403.059 562.905 443.131 562.905C473.112 562.905 499.04 517.259 511.421 450.943C511.561 455.905 511.633 460.918 511.633 465.975Z" fill="currentColor"/>
        <path d="M154.367 200.025C154.367 89.5544 188.41 -1.83562e-06 230.404 0C272.398 1.83562e-06 306.441 89.5544 306.441 200.025C306.441 231.628 303.655 261.518 298.694 288.09C295.772 184.639 262.941 103.095 222.869 103.095C192.888 103.095 166.96 148.741 154.579 215.057C154.439 210.094 154.367 205.082 154.367 200.025Z" fill="currentColor"/>
        <path d="M365.285 553.339C287.171 631.454 199.774 670.707 170.08 641.012C140.386 611.318 179.638 523.921 257.753 445.807C280.099 423.461 303.205 404.295 325.502 389.014C254.417 464.23 219.972 545.106 248.307 573.441C269.507 594.641 320.118 580.698 375.764 542.561C372.354 546.169 368.861 549.764 365.285 553.339Z" fill="currentColor"/>
        <path d="M300.715 112.661C378.829 34.5459 466.226 -4.70664 495.92 24.9877C525.614 54.682 486.362 142.079 408.247 220.193C385.901 242.539 362.795 261.705 340.498 276.986C411.583 201.77 446.028 120.894 417.693 92.5589C396.493 71.3591 345.882 85.3018 290.236 123.439C293.646 119.831 297.139 116.236 300.715 112.661Z" fill="currentColor"/>
        <path d="M112.661 365.285C34.5465 287.17 -4.70594 199.773 24.9883 170.079C54.6826 140.385 142.079 179.637 220.194 257.752C242.54 280.098 261.705 303.204 276.986 325.501C201.77 254.416 120.895 219.971 92.5594 248.307C71.3596 269.506 85.3023 320.117 123.44 375.764C119.832 372.354 116.237 368.86 112.661 365.285Z" fill="currentColor"/>
        <path d="M553.339 300.715C631.453 378.83 670.706 466.227 641.012 495.921C611.317 525.615 523.921 486.363 445.806 408.248C423.46 385.902 404.295 362.796 389.014 340.499C464.23 411.584 545.105 446.029 573.441 417.693C594.64 396.494 580.698 345.883 542.56 290.236C546.168 293.646 549.763 297.14 553.339 300.715Z" fill="currentColor"/>
        <path d="M537.899 104.601C537.899 103.063 538.274 101.662 539.024 100.396C539.774 99.1308 540.782 98.1231 542.048 97.3731C543.313 96.6232 544.715 96.2482 546.252 96.2482C547.583 96.2482 548.811 96.5341 549.936 97.1059C551.071 97.6778 552.008 98.4605 552.749 99.4542C553.489 100.439 553.949 101.554 554.127 102.801H550.724C550.536 101.835 550.016 101.048 549.163 100.439C548.31 99.8198 547.34 99.5105 546.252 99.5105C545.315 99.5105 544.462 99.7402 543.693 100.2C542.924 100.659 542.31 101.273 541.851 102.042C541.391 102.81 541.162 103.663 541.162 104.601C541.162 105.538 541.391 106.391 541.851 107.16C542.31 107.929 542.924 108.543 543.693 109.002C544.462 109.461 545.315 109.691 546.252 109.691C547.34 109.691 548.258 109.386 549.008 108.777C549.768 108.158 550.246 107.366 550.442 106.401H553.845C553.667 107.648 553.231 108.768 552.538 109.761C551.844 110.746 550.953 111.524 549.866 112.096C548.788 112.668 547.583 112.953 546.252 112.953C544.715 112.953 543.313 112.578 542.048 111.829C540.782 111.079 539.774 110.071 539.024 108.805C538.274 107.54 537.899 106.138 537.899 104.601ZM546.111 119.45C544.068 119.45 542.146 119.066 540.346 118.297C538.556 117.528 536.976 116.464 535.607 115.105C534.248 113.736 533.179 112.157 532.401 110.366C531.633 108.576 531.253 106.654 531.262 104.601C531.272 102.548 531.661 100.626 532.429 98.8355C533.208 97.045 534.276 95.4701 535.636 94.1108C536.995 92.7421 538.57 91.6734 540.36 90.9047C542.151 90.136 544.068 89.7517 546.111 89.7517C548.164 89.7517 550.086 90.136 551.877 90.9047C553.677 91.6734 555.252 92.7421 556.601 94.1108C557.961 95.4701 559.025 97.045 559.793 98.8355C560.562 100.626 560.951 102.548 560.961 104.601C560.97 106.654 560.59 108.576 559.822 110.366C559.053 112.157 557.989 113.736 556.63 115.105C555.27 116.464 553.691 117.528 551.891 118.297C550.091 119.066 548.164 119.45 546.111 119.45ZM546.111 116.188C547.714 116.188 549.219 115.888 550.625 115.288C552.031 114.688 553.264 113.858 554.323 112.799C555.383 111.739 556.212 110.511 556.812 109.115C557.412 107.708 557.708 106.209 557.698 104.615C557.689 103.012 557.384 101.507 556.784 100.101C556.184 98.6949 555.355 97.4622 554.295 96.4029C553.236 95.3435 552.008 94.5139 550.611 93.9139C549.214 93.314 547.714 93.014 546.111 93.014C544.518 93.014 543.023 93.314 541.626 93.9139C540.229 94.5139 539.001 95.3482 537.942 96.4169C536.882 97.4762 536.048 98.709 535.439 100.115C534.839 101.512 534.534 103.012 534.525 104.615C534.515 106.199 534.811 107.694 535.411 109.101C536.01 110.497 536.84 111.725 537.899 112.785C538.968 113.844 540.201 114.678 541.598 115.288C543.004 115.888 544.508 116.188 546.111 116.188Z" fill="currentColor"/>
      </svg>

      {nav && (
        <nav style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <a
            href={nav.baseUrl}
            style={{
              fontSize: '13px',
              color: 'var(--mq-text-muted)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            Gallery
          </a>
          {nav.prev && (
            <a
              href={`${nav.baseUrl}/experiments/${nav.prev}`}
              style={{
                fontSize: '13px',
                color: 'var(--mq-text-muted)',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              &larr; Prev
            </a>
          )}
          {nav.next && (
            <a
              href={`${nav.baseUrl}/experiments/${nav.next}`}
              style={{
                fontSize: '13px',
                color: 'var(--mq-text-muted)',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Next &rarr;
            </a>
          )}
        </nav>
      )}

      <button
        onClick={onThemeToggle}
        aria-label="Toggle theme"
        style={{
          marginLeft: 'auto',
          padding: '6px 12px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '13px',
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          color: 'var(--mq-text-muted)',
          background: 'transparent',
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {isDark ? 'Light' : 'Dark'}
      </button>
    </header>
  );
}
