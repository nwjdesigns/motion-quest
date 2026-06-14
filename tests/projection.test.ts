import { describe, it, expect } from 'vitest';
import { projectToScreen, projectRect, type ScreenPoint } from '../src/lib/projection';

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

const IDENTITY_RECT: number[] = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];

describe('projectRect', () => {
  it('builds a bounding rect from the four projected world corners', () => {
    // Center at origin, plane half-extents 0.8 x 0.45 (the 1.6 x 0.9 node).
    // Corners NDC x ∈ {-0.8, 0.8}, y ∈ {-0.45, 0.45}.
    // screenX: (-0.8+1)/2*800 = 80, (0.8+1)/2*800 = 720 → width 640
    // screenY: (1-0.45)/2*600 = 165, (1+0.45)/2*600 = 435 → height 270
    const rect = projectRect(
      { x: 0, y: 0, z: 0 },
      { x: 0.8, y: 0.45 },
      IDENTITY_RECT,
      800,
      600,
    );

    expect(rect.x).toBeCloseTo(80, 1);
    expect(rect.y).toBeCloseTo(165, 1);
    expect(rect.width).toBeCloseTo(640, 1);
    expect(rect.height).toBeCloseTo(270, 1);
  });

  it('scales the rect with the projection instead of using a fixed size', () => {
    // w=2 projection halves NDC, so the on-screen rect is half the size.
    // This is the whole point of the fix: at a different zoom the rect differs.
    const perspMatrix: number[] = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 2,
    ];

    const rect = projectRect(
      { x: 0, y: 0, z: 0 },
      { x: 0.8, y: 0.45 },
      perspMatrix,
      800,
      600,
    );

    // NDC x ∈ {-0.4, 0.4} → screenX 240, 560 → width 320 (half of 640)
    // NDC y ∈ {-0.225, 0.225} → screenY 232.5, 367.5 → height 135 (half of 270)
    expect(rect.width).toBeCloseTo(320, 1);
    expect(rect.height).toBeCloseTo(135, 1);
  });

  it('centers the rect on the projected center', () => {
    const rect = projectRect(
      { x: 0, y: 0, z: 0 },
      { x: 0.8, y: 0.45 },
      IDENTITY_RECT,
      800,
      600,
    );

    expect(rect.x + rect.width / 2).toBeCloseTo(400, 1);
    expect(rect.y + rect.height / 2).toBeCloseTo(300, 1);
  });
});
