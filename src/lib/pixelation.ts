export function computePixelationLevel(
  distance: number,
  threshold: number,
  falloff: number,
): number {
  if (distance <= threshold) return 0;
  const t = Math.min((distance - threshold) / (1 - threshold), 1);
  return Math.min(Math.pow(t, 1 / falloff), 1);
}
