export function buildPlayerUrl(scene: string, base: string): string {
  const cleanScene = encodeURIComponent(scene.replace(/^\//, ''));
  return `${base}/cavalry/player.html?scene=${base}/cavalry/scenes/${cleanScene}`;
}
