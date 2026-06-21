import { describe, test, expect } from 'vitest';
import {
  createMarkState,
  stepMark,
  resolveMarkMode,
  IDLE_DEG_PER_SEC,
  LOADING_DEG_PER_SEC,
  HOVER_DEG_PER_SEC,
  HOMEPAGE_SCALE,
  DETAIL_SCALE,
  BURST_DEGREES,
  BURST_DURATION,
  type MarkInputs,
  type MarkState,
} from '../src/lib/mark-engine';

const noInputs: MarkInputs = {
  orbitVelocity: 0,
  navEvent: null,
  loading: false,
  hover: false,
  targetScale: HOMEPAGE_SCALE,
};

function inputs(partial: Partial<MarkInputs>): MarkInputs {
  return { ...noInputs, ...partial };
}

describe('createMarkState', () => {
  test('initialises at zero rotation, idle velocity, homepage scale', () => {
    const s = createMarkState();
    expect(s.rotationAngle).toBe(0);
    expect(s.angularVelocity).toBeCloseTo(IDLE_DEG_PER_SEC, 5);
    expect(s.scale).toBe(HOMEPAGE_SCALE);
    expect(s.burstRemaining).toBe(0);
  });

  test('accepts an explicit starting scale', () => {
    const s = createMarkState(DETAIL_SCALE);
    expect(s.scale).toBe(DETAIL_SCALE);
  });
});

describe('idle state', () => {
  test('rotates clockwise at ~0.5 RPM (3 deg/s) when idle', () => {
    expect(IDLE_DEG_PER_SEC).toBeCloseTo(3, 5); // 0.5 RPM = 180 deg/min = 3 deg/s
    const s0 = createMarkState();
    const s1 = stepMark(s0, noInputs, 1);
    expect(s1.rotationAngle).toBeCloseTo(IDLE_DEG_PER_SEC, 5);
    expect(s1.angularVelocity).toBeCloseTo(IDLE_DEG_PER_SEC, 5);
  });

  test('rotation accumulates over multiple frames', () => {
    let s = createMarkState();
    s = stepMark(s, noInputs, 1);
    s = stepMark(s, noInputs, 1);
    s = stepMark(s, noInputs, 1);
    expect(s.rotationAngle).toBeCloseTo(IDLE_DEG_PER_SEC * 3, 5);
  });

  test('direction is positive (CW) by convention', () => {
    const s = stepMark(createMarkState(), noInputs, 0.5);
    expect(s.rotationAngle).toBeGreaterThan(0);
  });
});

describe('loading state', () => {
  test('spins at elevated speed (~2-3x idle) while loading', () => {
    expect(LOADING_DEG_PER_SEC).toBeGreaterThanOrEqual(IDLE_DEG_PER_SEC * 2);
    expect(LOADING_DEG_PER_SEC).toBeLessThanOrEqual(IDLE_DEG_PER_SEC * 3 + 1e-9);
    let s = createMarkState();
    // ramp toward loading speed
    for (let i = 0; i < 200; i++) s = stepMark(s, inputs({ loading: true }), 1 / 60);
    expect(s.angularVelocity).toBeCloseTo(LOADING_DEG_PER_SEC, 1);
  });

  test('returns toward idle speed when loading completes', () => {
    let s = createMarkState();
    for (let i = 0; i < 200; i++) s = stepMark(s, inputs({ loading: true }), 1 / 60);
    expect(s.angularVelocity).toBeCloseTo(LOADING_DEG_PER_SEC, 1);
    for (let i = 0; i < 400; i++) s = stepMark(s, noInputs, 1 / 60);
    expect(s.angularVelocity).toBeCloseTo(IDLE_DEG_PER_SEC, 1);
  });
});

describe('hover state', () => {
  test('speeds up toward hover speed on pointer proximity', () => {
    let s = createMarkState();
    for (let i = 0; i < 200; i++) s = stepMark(s, inputs({ hover: true }), 1 / 60);
    expect(s.angularVelocity).toBeCloseTo(HOVER_DEG_PER_SEC, 1);
    expect(HOVER_DEG_PER_SEC).toBeGreaterThan(IDLE_DEG_PER_SEC);
  });

  test('hover speed is below loading speed', () => {
    expect(HOVER_DEG_PER_SEC).toBeLessThan(LOADING_DEG_PER_SEC);
  });
});

describe('orbit-active state', () => {
  test('maps orbit velocity to a higher mark speed', () => {
    let s = createMarkState();
    for (let i = 0; i < 120; i++) {
      s = stepMark(s, inputs({ orbitVelocity: 0.05 }), 1 / 60);
    }
    expect(s.angularVelocity).toBeGreaterThan(IDLE_DEG_PER_SEC * 2);
  });

  test('larger orbit velocity maps to larger mark speed (proportional)', () => {
    let slow = createMarkState();
    let fast = createMarkState();
    for (let i = 0; i < 120; i++) {
      slow = stepMark(slow, inputs({ orbitVelocity: 0.02 }), 1 / 60);
      fast = stepMark(fast, inputs({ orbitVelocity: 0.08 }), 1 / 60);
    }
    expect(fast.angularVelocity).toBeGreaterThan(slow.angularVelocity);
  });

  test('negative orbit velocity (reverse drag) still maps to magnitude', () => {
    let s = createMarkState();
    for (let i = 0; i < 120; i++) {
      s = stepMark(s, inputs({ orbitVelocity: -0.05 }), 1 / 60);
    }
    // magnitude drives speed; rotation still advances CW
    expect(s.angularVelocity).toBeGreaterThan(IDLE_DEG_PER_SEC * 2);
    expect(s.rotationAngle).toBeGreaterThan(0);
  });

  test('decelerates smoothly (not instantly) back to idle when orbiting stops', () => {
    let s = createMarkState();
    for (let i = 0; i < 120; i++) s = stepMark(s, inputs({ orbitVelocity: 0.1 }), 1 / 60);
    const spunUp = s.angularVelocity;
    expect(spunUp).toBeGreaterThan(IDLE_DEG_PER_SEC * 2);

    // one frame after stop: still well above idle (no instant snap)
    const oneFrameAfter = stepMark(s, noInputs, 1 / 60);
    expect(oneFrameAfter.angularVelocity).toBeGreaterThan(IDLE_DEG_PER_SEC + 1);
    expect(oneFrameAfter.angularVelocity).toBeLessThan(spunUp);

    // eventually settles back to idle
    for (let i = 0; i < 400; i++) s = stepMark(s, noInputs, 1 / 60);
    expect(s.angularVelocity).toBeCloseTo(IDLE_DEG_PER_SEC, 1);
  });
});

describe('nav burst', () => {
  test('forward nav adds a quarter-turn CW burst', () => {
    let s = createMarkState();
    const start = s.rotationAngle;
    s = stepMark(s, inputs({ navEvent: 'forward' }), 1 / 60);
    expect(s.burstRemaining).toBeGreaterThan(0);
    expect(s.burstDirection).toBe(1);

    // run the burst to completion
    let guard = 0;
    while (s.burstRemaining > 0 && guard < 10000) {
      s = stepMark(s, noInputs, 1 / 60);
      guard++;
    }
    const delta = s.rotationAngle - start;
    // quarter turn (90deg) plus the idle baseline accrued during the burst
    expect(delta).toBeGreaterThan(BURST_DEGREES - 1);
    expect(delta).toBeLessThan(BURST_DEGREES + 20);
  });

  test('back nav adds a quarter-turn CCW burst (net negative contribution)', () => {
    let withBurst = createMarkState();
    let baseline = createMarkState();
    withBurst = stepMark(withBurst, inputs({ navEvent: 'back' }), 1 / 60);
    baseline = stepMark(baseline, noInputs, 1 / 60);
    expect(withBurst.burstDirection).toBe(-1);

    let guard = 0;
    while (withBurst.burstRemaining > 0 && guard < 10000) {
      withBurst = stepMark(withBurst, noInputs, 1 / 60);
      baseline = stepMark(baseline, noInputs, 1 / 60);
      guard++;
    }
    // the back burst pulls rotation below where pure-idle would be
    expect(withBurst.rotationAngle).toBeLessThan(baseline.rotationAngle);
  });

  test('burst is ease-out: more progress in the first half than the second', () => {
    let s = createMarkState();
    s = stepMark(s, inputs({ navEvent: 'forward' }), 1 / 60);
    const startAngle = s.rotationAngle;

    const half = Math.round(BURST_DURATION / 2 / (1 / 60));
    for (let i = 0; i < half; i++) s = stepMark(s, noInputs, 1 / 60);
    const midAngle = s.rotationAngle;

    let guard = 0;
    while (s.burstRemaining > 0 && guard < 10000) {
      s = stepMark(s, noInputs, 1 / 60);
      guard++;
    }
    const endAngle = s.rotationAngle;

    const firstHalf = midAngle - startAngle;
    const secondHalf = endAngle - midAngle;
    expect(firstHalf).toBeGreaterThan(secondHalf);
  });

  test('burst completes in approximately BURST_DURATION seconds', () => {
    let s = createMarkState();
    s = stepMark(s, inputs({ navEvent: 'forward' }), 1 / 60);
    let elapsed = 0;
    let guard = 0;
    while (s.burstRemaining > 0 && guard < 10000) {
      s = stepMark(s, noInputs, 1 / 60);
      elapsed += 1 / 60;
      guard++;
    }
    expect(elapsed).toBeCloseTo(BURST_DURATION, 1);
  });

  test('nav event only triggers once (edge), not every frame it is held', () => {
    let s = createMarkState();
    s = stepMark(s, inputs({ navEvent: 'forward' }), 1 / 60);
    const firstTotal = s.burstTotal;
    // holding the same event should not re-arm the burst
    s = stepMark(s, inputs({ navEvent: 'forward' }), 1 / 60);
    expect(s.burstTotal).toBe(firstTotal);
    expect(s.burstRemaining).toBeLessThan(firstTotal);
  });
});

describe('scale interpolation', () => {
  test('interpolates 32 -> 24 toward detail target', () => {
    let s = createMarkState(HOMEPAGE_SCALE);
    for (let i = 0; i < 200; i++) {
      s = stepMark(s, inputs({ targetScale: DETAIL_SCALE }), 1 / 60);
    }
    expect(s.scale).toBeCloseTo(DETAIL_SCALE, 1);
  });

  test('interpolates 24 -> 32 toward homepage target', () => {
    let s = createMarkState(DETAIL_SCALE);
    for (let i = 0; i < 200; i++) {
      s = stepMark(s, inputs({ targetScale: HOMEPAGE_SCALE }), 1 / 60);
    }
    expect(s.scale).toBeCloseTo(HOMEPAGE_SCALE, 1);
  });

  test('scale move is gradual, not instant', () => {
    let s = createMarkState(HOMEPAGE_SCALE);
    s = stepMark(s, inputs({ targetScale: DETAIL_SCALE }), 1 / 60);
    expect(s.scale).toBeLessThan(HOMEPAGE_SCALE);
    expect(s.scale).toBeGreaterThan(DETAIL_SCALE);
  });

  test('HOMEPAGE and DETAIL scale constants are 32 and 24', () => {
    expect(HOMEPAGE_SCALE).toBe(32);
    expect(DETAIL_SCALE).toBe(24);
  });
});

describe('priority resolution (simultaneous inputs)', () => {
  test('resolveMarkMode prioritises nav burst over everything', () => {
    const s: MarkState = { ...createMarkState(), burstRemaining: 0.1 };
    const mode = resolveMarkMode(s, inputs({ loading: true, orbitVelocity: 0.2, hover: true }));
    expect(mode).toBe('nav');
  });

  test('loading beats orbit, hover, idle', () => {
    expect(
      resolveMarkMode(createMarkState(), inputs({ loading: true, orbitVelocity: 0.2, hover: true })),
    ).toBe('loading');
  });

  test('orbit beats hover and idle', () => {
    expect(
      resolveMarkMode(createMarkState(), inputs({ orbitVelocity: 0.2, hover: true })),
    ).toBe('orbit');
  });

  test('hover beats idle', () => {
    expect(resolveMarkMode(createMarkState(), inputs({ hover: true }))).toBe('hover');
  });

  test('idle when nothing active', () => {
    expect(resolveMarkMode(createMarkState(), noInputs)).toBe('idle');
  });

  test('orbit velocity below the dead-zone does not trigger orbit mode', () => {
    expect(resolveMarkMode(createMarkState(), inputs({ orbitVelocity: 0.0001 }))).toBe('idle');
  });

  test('during a nav burst, loading still does not override the burst', () => {
    let s = createMarkState();
    s = stepMark(s, inputs({ navEvent: 'forward' }), 1 / 60);
    expect(s.burstRemaining).toBeGreaterThan(0);
    // loading goes true mid-burst: rotation should keep advancing via burst, burst owns it
    const before = s.burstRemaining;
    s = stepMark(s, inputs({ loading: true }), 1 / 60);
    expect(s.burstRemaining).toBeLessThan(before);
  });
});

describe('determinism / purity', () => {
  test('stepMark does not mutate the input state', () => {
    const s0 = createMarkState();
    const snapshot = { ...s0 };
    stepMark(s0, inputs({ orbitVelocity: 0.1, hover: true }), 1 / 60);
    expect(s0).toEqual(snapshot);
  });

  test('same input yields same output', () => {
    const s0 = createMarkState();
    const a = stepMark(s0, inputs({ orbitVelocity: 0.05 }), 1 / 60);
    const b = stepMark(s0, inputs({ orbitVelocity: 0.05 }), 1 / 60);
    expect(a).toEqual(b);
  });

  test('zero deltaTime is a no-op for rotation and scale', () => {
    const s0 = createMarkState(HOMEPAGE_SCALE);
    const s1 = stepMark(s0, inputs({ targetScale: DETAIL_SCALE, hover: true }), 0);
    expect(s1.rotationAngle).toBe(s0.rotationAngle);
    expect(s1.scale).toBe(s0.scale);
  });
});
