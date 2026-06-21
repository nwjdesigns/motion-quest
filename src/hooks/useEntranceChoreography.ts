import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import {
  sequenceEntrance,
  type EntranceEntry,
  type TimelineSlot,
} from '../lib/entrance-sequencer';

/**
 * Homepage entrance choreography.
 *
 * The pure `entrance-sequencer` decides TIMING; this hook owns the runtime:
 * it builds the homepage plan, drives an rAF clock, and exposes a per-element
 * 0..1 progress value that components map to their own enter animation
 * (fade/slide/scale). It also decides when to skip the entrance entirely.
 *
 * Skip conditions (show final state immediately):
 *  - `prefers-reduced-motion: reduce`
 *  - returning from a detail page, detected via the `mq-camera` sessionStorage
 *    key that ConstellationScene writes/reads.
 */

// Timing constants (ms). Sequence: top bar -> footer -> nodes (staggered) -> particles.
const TOPBAR_DURATION = 420;
const FOOTER_DELAY = 90;
const FOOTER_DURATION = 420;
const NODE_DELAY_AFTER_FOOTER = 60;
const NODE_DURATION = 520;
const NODE_STAGGER = 70;
const PARTICLES_DELAY = 120;
const PARTICLES_DURATION = 900;

export interface EntranceState {
  /** True when the entrance is bypassed and everything is shown immediately. */
  skipped: boolean;
  /** 0..1 enter progress for a given element id (1 == fully entered). */
  progressFor: (id: string) => number;
}

/**
 * Build the homepage entrance plan for `nodeCount` constellation nodes.
 * Exported for unit testing the plan shape independently of the clock.
 */
export function buildHomepageEntrancePlan(nodeCount: number): EntranceEntry[] {
  const plan: EntranceEntry[] = [
    { id: 'topbar', delay: 0, duration: TOPBAR_DURATION },
    {
      id: 'footer',
      delay: FOOTER_DELAY,
      duration: FOOTER_DURATION,
      dependsOn: 'topbar',
    },
  ];

  // Constellation nodes cascade after the footer, staggered amongst themselves.
  for (let i = 0; i < nodeCount; i++) {
    plan.push({
      id: `node-${i}`,
      delay: NODE_DELAY_AFTER_FOOTER + i * NODE_STAGGER,
      duration: NODE_DURATION,
      dependsOn: 'footer',
    });
  }

  // Particles fade in after the footer (independent of node count so the plan
  // is well-defined even with zero nodes).
  plan.push({
    id: 'particles',
    delay: PARTICLES_DELAY,
    duration: PARTICLES_DURATION,
    dependsOn: 'footer',
  });

  return plan;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isReturningVisit(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem('mq-camera') !== null;
}

function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

export function useEntranceChoreography(nodeCount: number): EntranceState {
  // Decide once, on mount, whether to skip. Reading the same things the
  // component tree reads keeps behaviour consistent and avoids re-deciding
  // mid-entrance.
  const skipped = useMemo(
    () => prefersReducedMotion() || isReturningVisit(),
    [],
  );

  const timeline = useMemo<TimelineSlot[]>(
    () => sequenceEntrance(buildHomepageEntrancePlan(nodeCount)),
    [nodeCount],
  );

  const slotById = useMemo(() => {
    const m = new Map<string, TimelineSlot>();
    for (const slot of timeline) m.set(slot.id, slot);
    return m;
  }, [timeline]);

  // Elapsed time since the entrance started, in ms. Stays 0 until the first
  // frame so nothing flashes in a half-entered state.
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (skipped) return;
    if (typeof requestAnimationFrame === 'undefined') return;

    const total = timeline.reduce(
      (max, s) => Math.max(max, s.startTime + s.duration),
      0,
    );

    // Anchor the clock at mount so elapsed reflects real time from the moment
    // the entrance begins (not from the first frame, which would always read 0).
    startRef.current =
      typeof performance !== 'undefined' ? performance.now() : 0;

    let raf = 0;
    const tick = () => {
      const now =
        typeof performance !== 'undefined' ? performance.now() : startRef.current!;
      const t = now - startRef.current!;
      setElapsed(t);
      if (t < total) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [skipped, timeline]);

  const progressFor = useCallback(
    (id: string): number => {
      if (skipped) return 1;
      const slot = slotById.get(id);
      // Unknown id: fail open so we never leave an unmanaged element invisible.
      if (!slot) return 1;
      if (slot.duration <= 0) return elapsed >= slot.startTime ? 1 : 0;
      return clamp01((elapsed - slot.startTime) / slot.duration);
    },
    [skipped, slotById, elapsed],
  );

  return { skipped, progressFor };
}
