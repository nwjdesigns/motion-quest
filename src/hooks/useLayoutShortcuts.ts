import { useEffect } from 'react';
import type { LayoutMode } from '../components/ConstellationScene';

const keyMap: Record<string, LayoutMode> = {
  '1': 'constellation',
  '2': 'grid',
  '3': 'spiral',
};

export function useLayoutShortcuts(onLayoutChange: (layout: LayoutMode) => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const layout = keyMap[e.key];
      if (layout) onLayoutChange(layout);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onLayoutChange]);
}
