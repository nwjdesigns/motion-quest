import type { ScreenRect } from './morph';

export interface ScreenPoint {
  x: number;
  y: number;
}

export function projectToScreen(
  worldPos: { x: number; y: number; z: number },
  viewProjectionMatrix: number[],
  viewportWidth: number,
  viewportHeight: number,
): ScreenPoint {
  const m = viewProjectionMatrix;
  const x = worldPos.x;
  const y = worldPos.y;
  const z = worldPos.z;

  // Column-major 4x4 matrix multiply: clip = M * [x, y, z, 1]
  const clipX = m[0] * x + m[4] * y + m[8] * z + m[12];
  const clipY = m[1] * x + m[5] * y + m[9] * z + m[13];
  const clipW = m[3] * x + m[7] * y + m[11] * z + m[15];

  // Perspective divide → NDC
  const ndcX = clipX / clipW;
  const ndcY = clipY / clipW;

  // NDC [-1,1] → screen pixels (Y flipped: NDC +1 = top = screen 0)
  const screenX = ((ndcX + 1) / 2) * viewportWidth;
  const screenY = ((1 - ndcY) / 2) * viewportHeight;

  return { x: screenX, y: screenY };
}

// Project a world-space axis-aligned rectangle (a plane facing the camera,
// given by its center and half-extents in world X/Y) into a screen-space
// bounding rect. Sizing the rect from the actual projected corners keeps the
// morph start-rect matched to the node's true on-screen size at any zoom.
export function projectRect(
  worldCenter: { x: number; y: number; z: number },
  halfExtents: { x: number; y: number },
  viewProjectionMatrix: number[],
  viewportWidth: number,
  viewportHeight: number,
): ScreenRect {
  const { x: cx, y: cy, z: cz } = worldCenter;
  const { x: hx, y: hy } = halfExtents;

  const corners = [
    { x: cx - hx, y: cy - hy, z: cz },
    { x: cx + hx, y: cy - hy, z: cz },
    { x: cx + hx, y: cy + hy, z: cz },
    { x: cx - hx, y: cy + hy, z: cz },
  ].map((corner) =>
    projectToScreen(corner, viewProjectionMatrix, viewportWidth, viewportHeight),
  );

  const xs = corners.map((p) => p.x);
  const ys = corners.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
