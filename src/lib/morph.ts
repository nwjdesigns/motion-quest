export interface ScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function interpolateRect(
  start: ScreenRect,
  end: ScreenRect,
  progress: number,
): ScreenRect {
  const t = Math.max(0, Math.min(1, progress));
  return {
    x: start.x + (end.x - start.x) * t,
    y: start.y + (end.y - start.y) * t,
    width: start.width + (end.width - start.width) * t,
    height: start.height + (end.height - start.height) * t,
  };
}
