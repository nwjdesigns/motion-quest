export interface Particle {
  x: number;
  y: number;
  z: number;
  scale: number;
}

export interface ParticleOptions {
  spread?: number;
  minScale?: number;
  maxScale?: number;
  seed?: number;
}

function createRng(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateParticles(
  count: number,
  options?: ParticleOptions,
): Particle[] {
  if (count === 0) return [];

  const spread = options?.spread ?? 15;
  const minScale = options?.minScale ?? 0.02;
  const maxScale = options?.maxScale ?? 0.08;
  const rng = createRng(options?.seed ?? 7);

  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: (rng() * 2 - 1) * spread,
      y: (rng() * 2 - 1) * spread,
      z: (rng() * 2 - 1) * spread,
      scale: minScale + rng() * (maxScale - minScale),
    });
  }
  return particles;
}
