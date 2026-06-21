/**
 * Mark behaviour engine — pure, framework-free core for the SVG pinwheel mark.
 *
 * A single pure step function advances the mark's state given the current
 * inputs (orbit velocity, navigation events, loading, hover) and a frame
 * deltaTime. Outputs are a cumulative `rotationAngle` (degrees, applied via CSS
 * `transform: rotate()`) and a `scale` (px, the mark's rendered size).
 *
 * Conventions:
 *  - Clockwise (CW) is the default / forward direction → positive angle delta.
 *  - Counter-clockwise (CCW) is for back / reverse → negative angle delta.
 *  - All rates are expressed per-second; callers pass deltaTime in seconds.
 */

// ── Tunable constants ────────────────────────────────────────────────────────

/** Idle spin: 0.5 RPM = 180 deg/min = 3 deg/s, clockwise. */
export const IDLE_DEG_PER_SEC = 3;

/** Loading spin: ~2.5x idle. Within the spec's 2-3x band. */
export const LOADING_DEG_PER_SEC = IDLE_DEG_PER_SEC * 2.5; // 7.5 deg/s

/** Hover spin: a noticeable bump above idle, below loading. */
export const HOVER_DEG_PER_SEC = IDLE_DEG_PER_SEC * 2; // 6 deg/s

/** Mark size on the homepage (px). */
export const HOMEPAGE_SCALE = 32;

/** Mark size on a detail page (px). */
export const DETAIL_SCALE = 24;

/** Nav burst sweep: a quarter turn. */
export const BURST_DEGREES = 90;

/** Nav burst duration (seconds). */
export const BURST_DURATION = 0.6;

/**
 * Orbit response curve: maps the per-frame azimuthal delta reported by the
 * Three.js OrbitControls (radians) onto a target mark speed (deg/s). The orbit
 * delta is small per frame, so we scale it up and treat its magnitude as the
 * driver (direction of drag does not flip the mark's CW spin).
 */
const ORBIT_GAIN = 600; // deg/s per (rad/frame), before clamping
const ORBIT_MAX_DEG_PER_SEC = IDLE_DEG_PER_SEC * 8; // hard ceiling
/** Below this |orbitVelocity| we treat orbiting as stopped. */
const ORBIT_DEAD_ZONE = 0.001;

/**
 * Velocity smoothing: how quickly the current angular velocity chases its
 * target (per second). Lower = smoother / slower deceleration. This is what
 * gives the "decelerates smoothly back to idle" feel rather than a snap.
 */
const VELOCITY_LERP_PER_SEC = 4;

/** Scale smoothing toward the target size (per second). */
const SCALE_LERP_PER_SEC = 8;

// ── Types ────────────────────────────────────────────────────────────────────

export type MarkMode = 'idle' | 'hover' | 'orbit' | 'loading' | 'nav';

export interface MarkInputs {
  /** Per-frame azimuthal delta from OrbitControls, in radians. */
  orbitVelocity: number;
  /** Edge-triggered navigation event; null when no new navigation. */
  navEvent: 'forward' | 'back' | null;
  /** True while the WASM player / page is loading. */
  loading: boolean;
  /** True when the pointer is near the mark. */
  hover: boolean;
  /** Desired rendered size in px (e.g. 32 homepage, 24 detail). */
  targetScale: number;
}

export interface MarkState {
  /** Cumulative rotation in degrees (CW positive). */
  rotationAngle: number;
  /** Current angular velocity in deg/s (the continuous-spin component). */
  angularVelocity: number;
  /** Current rendered size in px. */
  scale: number;
  /** Seconds remaining in the active nav burst (0 when none). */
  burstRemaining: number;
  /** Total duration of the active burst (for ease-out progress math). */
  burstTotal: number;
  /** Burst direction: +1 CW (forward), -1 CCW (back), 0 none. */
  burstDirection: number;
  /** Degrees the active burst still has to deliver. */
  burstDegreesRemaining: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Frame-rate-independent exponential approach of `current` toward `target`. */
function approach(current: number, target: number, ratePerSec: number, dt: number): number {
  const t = 1 - Math.exp(-ratePerSec * dt);
  return current + (target - current) * t;
}

/** Map an orbit velocity (rad/frame) magnitude to a target mark speed (deg/s). */
function orbitTargetSpeed(orbitVelocity: number): number {
  const mag = Math.abs(orbitVelocity);
  return clamp(mag * ORBIT_GAIN, 0, ORBIT_MAX_DEG_PER_SEC);
}

/** Ease-out cubic: fast start, slow finish. progress in [0,1]. */
function easeOutCubic(progress: number): number {
  const p = clamp(progress, 0, 1);
  return 1 - Math.pow(1 - p, 3);
}

// ── Public API ───────────────────────────────────────────────────────────────

export function createMarkState(scale: number = HOMEPAGE_SCALE): MarkState {
  return {
    rotationAngle: 0,
    angularVelocity: IDLE_DEG_PER_SEC,
    scale,
    burstRemaining: 0,
    burstTotal: 0,
    burstDirection: 0,
    burstDegreesRemaining: 0,
  };
}

/**
 * Resolve which behaviour mode is in effect for the given state + inputs.
 * Priority (highest first): nav burst → loading → orbit → hover → idle.
 * This is the simultaneous-input tie-breaker.
 */
export function resolveMarkMode(state: MarkState, in_: MarkInputs): MarkMode {
  if (state.burstRemaining > 0) return 'nav';
  if (in_.loading) return 'loading';
  if (Math.abs(in_.orbitVelocity) >= ORBIT_DEAD_ZONE) return 'orbit';
  if (in_.hover) return 'hover';
  return 'idle';
}

/**
 * Advance the mark by one frame. Pure: returns a new MarkState and never
 * mutates the input. CW (positive) is forward/default; CCW (negative) is back.
 */
export function stepMark(state: MarkState, in_: MarkInputs, dt: number): MarkState {
  if (dt <= 0) {
    // No time elapsed: identity (still pure — return a fresh copy).
    return { ...state };
  }

  // 1. Arm a nav burst on an edge. A burst only arms when none is running, so
  //    holding the same nav event across frames does not re-trigger it.
  let burstRemaining = state.burstRemaining;
  let burstTotal = state.burstTotal;
  let burstDirection = state.burstDirection;
  let burstDegreesRemaining = state.burstDegreesRemaining;

  if (in_.navEvent && burstRemaining <= 0) {
    burstDirection = in_.navEvent === 'forward' ? 1 : -1;
    burstRemaining = BURST_DURATION;
    burstTotal = BURST_DURATION;
    burstDegreesRemaining = BURST_DEGREES;
  }

  // 2. Determine the continuous-spin target speed (deg/s) for this frame.
  //    The burst is additive on top of the continuous spin and is handled
  //    separately below; the continuous component still ticks during a burst.
  let targetSpeed = IDLE_DEG_PER_SEC;
  if (in_.loading) {
    targetSpeed = LOADING_DEG_PER_SEC;
  } else if (Math.abs(in_.orbitVelocity) >= ORBIT_DEAD_ZONE) {
    targetSpeed = Math.max(IDLE_DEG_PER_SEC, orbitTargetSpeed(in_.orbitVelocity));
  } else if (in_.hover) {
    targetSpeed = HOVER_DEG_PER_SEC;
  }

  // 3. Ease the angular velocity toward the target (smooth accel + decel).
  const angularVelocity = approach(state.angularVelocity, targetSpeed, VELOCITY_LERP_PER_SEC, dt);

  // 4. Continuous rotation contribution (always CW).
  let rotationAngle = state.rotationAngle + angularVelocity * dt;

  // 5. Nav burst contribution (ease-out over its duration), additive.
  if (burstRemaining > 0) {
    const prevElapsed = burstTotal - burstRemaining;
    const nextRemaining = Math.max(0, burstRemaining - dt);
    const nextElapsed = burstTotal - nextRemaining;

    const sweptBefore = easeOutCubic(prevElapsed / burstTotal) * BURST_DEGREES;
    const sweptAfter = easeOutCubic(nextElapsed / burstTotal) * BURST_DEGREES;
    const burstDelta = sweptAfter - sweptBefore;

    rotationAngle += burstDirection * burstDelta;
    burstDegreesRemaining = Math.max(0, BURST_DEGREES - sweptAfter);
    burstRemaining = nextRemaining;

    if (burstRemaining <= 0) {
      burstDirection = 0;
      burstTotal = 0;
      burstDegreesRemaining = 0;
    }
  }

  // 6. Ease the scale toward its target size.
  const scale = approach(state.scale, in_.targetScale, SCALE_LERP_PER_SEC, dt);

  return {
    rotationAngle,
    angularVelocity,
    scale,
    burstRemaining,
    burstTotal,
    burstDirection,
    burstDegreesRemaining,
  };
}
