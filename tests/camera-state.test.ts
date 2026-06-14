import { describe, it, expect } from 'vitest';
import {
  serializeCameraState,
  deserializeCameraState,
  type CameraState,
} from '../src/lib/camera-state';

describe('serializeCameraState', () => {
  it('round-trips camera state within floating-point tolerance', () => {
    const state: CameraState = {
      position: { x: 3.14159, y: -2.71828, z: 12.0 },
      target: { x: 0, y: 0, z: 0 },
      zoom: 1.5,
    };

    const serialized = serializeCameraState(state);
    const restored = deserializeCameraState(serialized);

    expect(restored).not.toBeNull();
    expect(restored!.position.x).toBeCloseTo(state.position.x, 10);
    expect(restored!.position.y).toBeCloseTo(state.position.y, 10);
    expect(restored!.position.z).toBeCloseTo(state.position.z, 10);
    expect(restored!.target.x).toBeCloseTo(state.target.x, 10);
    expect(restored!.target.y).toBeCloseTo(state.target.y, 10);
    expect(restored!.target.z).toBeCloseTo(state.target.z, 10);
    expect(restored!.zoom).toBeCloseTo(state.zoom, 10);
  });

  it('produces valid JSON string', () => {
    const state: CameraState = {
      position: { x: 1, y: 2, z: 3 },
      target: { x: 0, y: 0, z: 0 },
      zoom: 1,
    };

    const serialized = serializeCameraState(state);
    expect(() => JSON.parse(serialized)).not.toThrow();
  });

  it('round-trips negative and zero values', () => {
    const state: CameraState = {
      position: { x: -100, y: 0, z: -0.001 },
      target: { x: -50, y: -50, z: 0 },
      zoom: 0.1,
    };

    const serialized = serializeCameraState(state);
    const restored = deserializeCameraState(serialized);

    expect(restored).not.toBeNull();
    expect(restored!.position.x).toBeCloseTo(-100, 10);
    expect(restored!.position.z).toBeCloseTo(-0.001, 10);
    expect(restored!.zoom).toBeCloseTo(0.1, 10);
  });

  it('round-trips very large values', () => {
    const state: CameraState = {
      position: { x: 999999, y: -999999, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      zoom: 100,
    };

    const serialized = serializeCameraState(state);
    const restored = deserializeCameraState(serialized);

    expect(restored).not.toBeNull();
    expect(restored!.position.x).toBe(999999);
    expect(restored!.zoom).toBe(100);
  });
});

describe('deserializeCameraState', () => {
  it('returns null for empty string', () => {
    expect(deserializeCameraState('')).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    expect(deserializeCameraState('not json')).toBeNull();
  });

  it('returns null for JSON missing required fields', () => {
    expect(deserializeCameraState('{"position":{"x":1}}')).toBeNull();
  });

  it('returns null for JSON with non-numeric values', () => {
    const bad = JSON.stringify({
      position: { x: 'a', y: 2, z: 3 },
      target: { x: 0, y: 0, z: 0 },
      zoom: 1,
    });
    expect(deserializeCameraState(bad)).toBeNull();
  });

  it('returns null for JSON with NaN values', () => {
    const withNaN = '{"position":{"x":null,"y":2,"z":3},"target":{"x":0,"y":0,"z":0},"zoom":1}';
    expect(deserializeCameraState(withNaN)).toBeNull();
  });
});
