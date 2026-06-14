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
