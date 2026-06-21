import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createMarkState,
  stepMark,
  HOMEPAGE_SCALE,
  type MarkInputs,
  type MarkState,
} from '../lib/mark-engine';

export interface UseMarkBehaviourOptions {
  /** Desired mark size in px (32 homepage, 24 detail). */
  targetScale?: number;
  /** True while the WASM player / page is loading. */
  loading?: boolean;
  /** True while the pointer is near the mark. */
  hover?: boolean;
}

export interface MarkBehaviour {
  /** Cumulative rotation in degrees (CW positive). */
  rotationAngle: number;
  /** Current rendered size in px. */
  scale: number;
  /** Report the latest per-frame orbit azimuthal delta (radians). */
  setOrbitVelocity: (deltaRadians: number) => void;
  /** Fire a one-shot navigation burst (CW forward / CCW back). */
  triggerNav: (direction: 'forward' | 'back') => void;
}

/**
 * Drives the pure mark engine on a requestAnimationFrame loop and exposes the
 * current { rotationAngle, scale } for a component to apply as a CSS transform.
 *
 * Orbit velocity and nav events are pushed in imperatively (via refs) so that
 * high-frequency updates never re-render the host or restart the loop.
 */
export function useMarkBehaviour({
  targetScale = HOMEPAGE_SCALE,
  loading = false,
  hover = false,
}: UseMarkBehaviourOptions = {}): MarkBehaviour {
  const [output, setOutput] = useState<{ rotationAngle: number; scale: number }>({
    rotationAngle: 0,
    scale: targetScale,
  });

  const stateRef = useRef<MarkState>(createMarkState(targetScale));
  // Latest per-frame orbit delta; reset to 0 once consumed by a frame.
  const orbitVelocityRef = useRef(0);
  // Pending one-shot nav event, consumed on the next frame.
  const pendingNavRef = useRef<'forward' | 'back' | null>(null);
  // Live inputs that may change between renders without restarting the loop.
  const targetScaleRef = useRef(targetScale);
  const loadingRef = useRef(loading);
  const hoverRef = useRef(hover);

  targetScaleRef.current = targetScale;
  loadingRef.current = loading;
  hoverRef.current = hover;

  const setOrbitVelocity = useCallback((deltaRadians: number) => {
    orbitVelocityRef.current = deltaRadians;
  }, []);

  const triggerNav = useCallback((direction: 'forward' | 'back') => {
    pendingNavRef.current = direction;
  }, []);

  useEffect(() => {
    let frame = 0;
    let lastTime: number | null = null;

    const loop = (time: number) => {
      if (lastTime === null) {
        lastTime = time;
        frame = requestAnimationFrame(loop);
        return;
      }
      // Clamp dt to avoid huge jumps after a background tab resumes.
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const navEvent = pendingNavRef.current;
      pendingNavRef.current = null;

      const inputs: MarkInputs = {
        orbitVelocity: orbitVelocityRef.current,
        navEvent,
        loading: loadingRef.current,
        hover: hoverRef.current,
        targetScale: targetScaleRef.current,
      };

      // Orbit delta is a per-frame impulse: consume it after using it.
      orbitVelocityRef.current = 0;

      const next = stepMark(stateRef.current, inputs, dt);
      stateRef.current = next;
      setOutput({ rotationAngle: next.rotationAngle, scale: next.scale });

      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  return {
    rotationAngle: output.rotationAngle,
    scale: output.scale,
    setOrbitVelocity,
    triggerNav,
  };
}
