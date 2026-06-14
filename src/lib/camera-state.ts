export interface CameraState {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  zoom: number;
}

export function serializeCameraState(state: CameraState): string {
  return JSON.stringify({
    position: state.position,
    target: state.target,
    zoom: state.zoom,
  });
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isVec3(v: unknown): v is { x: number; y: number; z: number } {
  if (v === null || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return isFiniteNumber(o.x) && isFiniteNumber(o.y) && isFiniteNumber(o.z);
}

export function deserializeCameraState(raw: string): CameraState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!isVec3(parsed.position) || !isVec3(parsed.target) || !isFiniteNumber(parsed.zoom)) {
      return null;
    }
    return {
      position: { x: parsed.position.x, y: parsed.position.y, z: parsed.position.z },
      target: { x: parsed.target.x, y: parsed.target.y, z: parsed.target.z },
      zoom: parsed.zoom,
    };
  } catch {
    return null;
  }
}
