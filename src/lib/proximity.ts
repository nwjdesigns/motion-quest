export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface CursorConnection {
  index: number;
  opacity: number;
}

export interface ThumbnailConnection {
  indexA: number;
  indexB: number;
  opacity: number;
}

export interface ProximityGraph {
  cursorToThumbnail: CursorConnection[];
  thumbnailToThumbnail: ThumbnailConnection[];
}

function dist(a: Point3D, b: Point3D): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

export function computeProximityGraph(
  thumbnails: Point3D[],
  cursor: Point3D,
  radius: number,
): ProximityGraph {
  const cursorToThumbnail: CursorConnection[] = [];
  const activeIndices: Set<number> = new Set();

  for (let i = 0; i < thumbnails.length; i++) {
    const d = dist(cursor, thumbnails[i]);
    if (d <= radius) {
      cursorToThumbnail.push({
        index: i,
        opacity: 1 - d / radius,
      });
      activeIndices.add(i);
    }
  }

  const thumbnailToThumbnail: ThumbnailConnection[] = [];
  const active = Array.from(activeIndices);
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      const d = dist(thumbnails[a], thumbnails[b]);
      const maxPairDist = radius * 2;
      if (d < maxPairDist) {
        thumbnailToThumbnail.push({
          indexA: a,
          indexB: b,
          opacity: 1 - d / maxPairDist,
        });
      }
    }
  }

  return { cursorToThumbnail, thumbnailToThumbnail };
}
