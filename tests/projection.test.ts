import { describe, it, expect } from 'vitest';
import { projectToScreen, type ScreenPoint } from '../src/lib/projection';

// Identity-like view-projection: camera at origin looking down -Z,
// with a simple perspective projection.
// For a standard perspective camera at [0,0,5] looking at origin with fov=90, near=0.1, far=100,
// the projection matrix maps the origin (0,0,0) to NDC (0,0,z') which maps to viewport center.

// Helper: build a 4x4 matrix from Three.js-style column-major flat array
// For testing, we use manually constructed matrices with known transforms.

// An identity matrix projects (0,0,0) to NDC (0,0,0) → viewport center
const IDENTITY: number[] = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];

describe('projectToScreen', () => {
  it('projects origin to viewport center with identity matrix', () => {
    const result = projectToScreen(
      { x: 0, y: 0, z: 0 },
      IDENTITY,
      800,
      600,
    );

    expect(result.x).toBeCloseTo(400, 1);
    expect(result.y).toBeCloseTo(300, 1);
  });

  it('projects point at NDC (1,1) to top-right corner', () => {
    // A point that after matrix transform ends up at NDC (1, 1, z)
    // With identity matrix, world (1, 1, 0) → NDC (1, 1, 0)
    // NDC (1, 1) → screen (800, 0) for 800x600 viewport (Y is flipped: NDC +1 = top = screen 0)
    const result = projectToScreen(
      { x: 1, y: 1, z: 0 },
      IDENTITY,
      800,
      600,
    );

    expect(result.x).toBeCloseTo(800, 1);
    expect(result.y).toBeCloseTo(0, 1);
  });

  it('projects point at NDC (-1,-1) to bottom-left corner', () => {
    const result = projectToScreen(
      { x: -1, y: -1, z: 0 },
      IDENTITY,
      800,
      600,
    );

    expect(result.x).toBeCloseTo(0, 1);
    expect(result.y).toBeCloseTo(600, 1);
  });

  it('handles non-square viewports', () => {
    const result = projectToScreen(
      { x: 0.5, y: 0.5, z: 0 },
      IDENTITY,
      1920,
      1080,
    );

    // NDC 0.5 → screen x = (0.5 + 1) / 2 * 1920 = 1440
    // NDC 0.5 → screen y = (1 - 0.5) / 2 * 1080 = 270
    expect(result.x).toBeCloseTo(1440, 1);
    expect(result.y).toBeCloseTo(270, 1);
  });

  it('applies a translation matrix correctly', () => {
    // Column-major translation matrix: translate by (2, 0, 0)
    // This moves the point, so world (0,0,0) → clip (2, 0, 0, 1) → NDC (2, 0)
    // But we want to simulate a camera offset:
    // View matrix translating -2 in X means world (0,0,0) → view (-2, 0, 0)
    // With identity projection, NDC = (-2, 0) → screen x = (-2+1)/2 * 800 = -400
    const translateX: number[] = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      -2, 0, 0, 1,
    ];

    const result = projectToScreen(
      { x: 0, y: 0, z: 0 },
      translateX,
      800,
      600,
    );

    // NDC x = -2 → screen x = (-2 + 1) / 2 * 800 = -400
    expect(result.x).toBeCloseTo(-400, 1);
    expect(result.y).toBeCloseTo(300, 1);
  });

  it('handles perspective division (w != 1)', () => {
    // A matrix that produces w=2 for the origin:
    // Column-major: last row [0,0,0,2] means w component = 2
    const perspMatrix: number[] = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 2,
    ];

    const result = projectToScreen(
      { x: 2, y: 2, z: 0 },
      perspMatrix,
      800,
      600,
    );

    // clip = (2, 2, 0, 2), NDC = (1, 1, 0)
    // screen = (800, 0)
    expect(result.x).toBeCloseTo(800, 1);
    expect(result.y).toBeCloseTo(0, 1);
  });
});
