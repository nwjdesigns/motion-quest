/**
 * Pure entrance sequencer.
 *
 * Takes an ordered list of entrance entries and resolves them into an absolute
 * timeline. The sequencer concerns itself with TIMING only: each entry's own
 * enter animation (fade/slide/scale) is the caller's responsibility.
 *
 * Timing rules:
 *  - An independent entry starts at its own `delay` (used for stagger offsets).
 *  - A dependent entry (`dependsOn: 'X'`) starts after X completes
 *    (X.startTime + X.duration), plus the dependent's own `delay`.
 *  - Dependencies may be declared in any order within the array.
 *
 * Errors:
 *  - Duplicate ids throw.
 *  - A `dependsOn` referencing an unknown id throws.
 *  - Any dependency cycle (including self-reference) throws.
 */
export interface EntranceEntry {
  id: string;
  /** Offset applied after the entry's start condition is met (ms). */
  delay: number;
  /** How long this entry's enter animation runs (ms). */
  duration: number;
  /** Id of an entry that must complete before this one starts. */
  dependsOn?: string;
}

export interface TimelineSlot {
  id: string;
  startTime: number;
  duration: number;
}

export function sequenceEntrance(entries: EntranceEntry[]): TimelineSlot[] {
  if (entries.length === 0) return [];

  const byId = new Map<string, EntranceEntry>();
  for (const entry of entries) {
    if (byId.has(entry.id)) {
      throw new Error(`Duplicate entrance entry id: "${entry.id}"`);
    }
    byId.set(entry.id, entry);
  }

  for (const entry of entries) {
    if (entry.dependsOn !== undefined && !byId.has(entry.dependsOn)) {
      throw new Error(
        `Entry "${entry.id}" has an unknown dependency: "${entry.dependsOn}"`,
      );
    }
  }

  const startTimes = new Map<string, number>();
  const resolving = new Set<string>();

  function resolveStart(id: string): number {
    const cached = startTimes.get(id);
    if (cached !== undefined) return cached;

    if (resolving.has(id)) {
      throw new Error(`Circular dependency detected involving "${id}"`);
    }
    resolving.add(id);

    // Non-null: every id in this map came from `byId`.
    const entry = byId.get(id)!;
    let base = 0;
    if (entry.dependsOn !== undefined) {
      const dep = byId.get(entry.dependsOn)!;
      base = resolveStart(dep.id) + dep.duration;
    }
    const start = base + entry.delay;

    resolving.delete(id);
    startTimes.set(id, start);
    return start;
  }

  return entries.map((entry) => ({
    id: entry.id,
    startTime: resolveStart(entry.id),
    duration: entry.duration,
  }));
}
