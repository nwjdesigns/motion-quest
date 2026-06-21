import { useRef, useEffect } from 'react';
import type { ScreenRect } from '../lib/morph';
import {
  buildMorphKeyframes,
  buildChromeExitStyle,
  MORPH_EASING,
} from '../lib/morph-animation';
import { MORPH_MS } from '../lib/transition-orchestrator';

interface MorphSnapshotProps {
  sourceRect: ScreenRect;
  thumbnailUrl: string;
  slug: string;
  baseUrl: string;
  onChromeExit?: () => void;
}

/**
 * Replaces MorphOverlay. Renders a DOM <img> at the node's exact screen rect
 * using the experiment's thumbnail, then animates it to fill the viewport
 * using WAAPI before navigating to the detail page.
 */
export function MorphSnapshot({
  sourceRect,
  thumbnailUrl,
  slug,
  baseUrl,
  onChromeExit,
}: MorphSnapshotProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    // Signal chrome to begin exit
    onChromeExit?.();

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const [startKf, endKf] = buildMorphKeyframes(sourceRect, vw, vh);

    // Animate using WAAPI
    const animation = el.animate(
      [startKf, endKf],
      {
        duration: MORPH_MS,
        easing: MORPH_EASING,
        fill: 'forwards',
      },
    );

    const navigate = () => {
      window.location.href = `${baseUrl}/experiments/${slug}`;
    };

    animation.onfinish = navigate;

    // Fallback in case animation doesn't fire onfinish
    const fallback = setTimeout(navigate, MORPH_MS + 100);

    return () => {
      clearTimeout(fallback);
      animation.cancel();
    };
  }, [sourceRect, thumbnailUrl, slug, baseUrl, onChromeExit]);

  return (
    <img
      ref={imgRef}
      src={thumbnailUrl}
      alt=""
      style={{
        position: 'fixed',
        left: `${sourceRect.x}px`,
        top: `${sourceRect.y}px`,
        width: `${sourceRect.width}px`,
        height: `${sourceRect.height}px`,
        objectFit: 'cover',
        zIndex: 9999,
        pointerEvents: 'none',
        borderRadius: '4px',
      }}
    />
  );
}
