import { describe, test, expect } from 'vitest';
import {
  sequenceEntrance,
  type EntranceEntry,
  type TimelineSlot,
} from '../src/lib/entrance-sequencer';

function byId(timeline: TimelineSlot[], id: string): TimelineSlot {
  const slot = timeline.find((s) => s.id === id);
  if (!slot) throw new Error(`no slot for ${id}`);
  return slot;
}

describe('sequenceEntrance', () => {
  test('empty input produces empty timeline', () => {
    expect(sequenceEntrance([])).toEqual([]);
  });

  test('a single entry starts at its own delay', () => {
    const entries: EntranceEntry[] = [{ id: 'a', delay: 100, duration: 300 }];
    const timeline = sequenceEntrance(entries);
    expect(timeline).toEqual([{ id: 'a', startTime: 100, duration: 300 }]);
  });

  test('independent entries each start at their own delay (stagger offsets)', () => {
    const entries: EntranceEntry[] = [
      { id: 'a', delay: 0, duration: 200 },
      { id: 'b', delay: 150, duration: 200 },
      { id: 'c', delay: 300, duration: 200 },
    ];
    const timeline = sequenceEntrance(entries);
    expect(byId(timeline, 'a').startTime).toBe(0);
    expect(byId(timeline, 'b').startTime).toBe(150);
    expect(byId(timeline, 'c').startTime).toBe(300);
  });

  test('a dependent entry starts after its dependency completes', () => {
    const entries: EntranceEntry[] = [
      { id: 'a', delay: 0, duration: 300 },
      { id: 'b', delay: 0, duration: 200, dependsOn: 'a' },
    ];
    const timeline = sequenceEntrance(entries);
    // a completes at 0 + 300 = 300, so b starts at 300
    expect(byId(timeline, 'a').startTime).toBe(0);
    expect(byId(timeline, 'b').startTime).toBe(300);
  });

  test("a dependent entry's own delay is added on top of the dependency completion", () => {
    const entries: EntranceEntry[] = [
      { id: 'a', delay: 100, duration: 300 },
      { id: 'b', delay: 50, duration: 200, dependsOn: 'a' },
    ];
    const timeline = sequenceEntrance(entries);
    // a starts at 100, completes at 400; b adds its own delay 50 => 450
    expect(byId(timeline, 'a').startTime).toBe(100);
    expect(byId(timeline, 'b').startTime).toBe(450);
  });

  test('chained dependencies cascade (a -> b -> c)', () => {
    const entries: EntranceEntry[] = [
      { id: 'a', delay: 0, duration: 100 },
      { id: 'b', delay: 0, duration: 100, dependsOn: 'a' },
      { id: 'c', delay: 0, duration: 100, dependsOn: 'b' },
    ];
    const timeline = sequenceEntrance(entries);
    expect(byId(timeline, 'a').startTime).toBe(0);
    expect(byId(timeline, 'b').startTime).toBe(100);
    expect(byId(timeline, 'c').startTime).toBe(200);
  });

  test('combined dependencies and stagger offsets resolve together', () => {
    const entries: EntranceEntry[] = [
      { id: 'top', delay: 0, duration: 200 },
      { id: 'footer', delay: 80, duration: 200, dependsOn: 'top' },
      // two independent staggered nodes both depending on footer
      { id: 'node-0', delay: 0, duration: 150, dependsOn: 'footer' },
      { id: 'node-1', delay: 60, duration: 150, dependsOn: 'footer' },
    ];
    const timeline = sequenceEntrance(entries);
    // top: 0..200
    expect(byId(timeline, 'top').startTime).toBe(0);
    // footer: 200 + 80 = 280, completes at 480
    expect(byId(timeline, 'footer').startTime).toBe(280);
    // node-0: footer completes at 480 + 0 = 480
    expect(byId(timeline, 'node-0').startTime).toBe(480);
    // node-1: 480 + 60 = 540
    expect(byId(timeline, 'node-1').startTime).toBe(540);
  });

  test('dependency declared after the dependent in the array still resolves', () => {
    const entries: EntranceEntry[] = [
      { id: 'b', delay: 0, duration: 200, dependsOn: 'a' },
      { id: 'a', delay: 0, duration: 300 },
    ];
    const timeline = sequenceEntrance(entries);
    expect(byId(timeline, 'a').startTime).toBe(0);
    expect(byId(timeline, 'b').startTime).toBe(300);
  });

  test('preserves duration on every slot', () => {
    const entries: EntranceEntry[] = [
      { id: 'a', delay: 0, duration: 333 },
      { id: 'b', delay: 0, duration: 444, dependsOn: 'a' },
    ];
    const timeline = sequenceEntrance(entries);
    expect(byId(timeline, 'a').duration).toBe(333);
    expect(byId(timeline, 'b').duration).toBe(444);
  });

  test('throws when a dependency id does not exist', () => {
    const entries: EntranceEntry[] = [
      { id: 'a', delay: 0, duration: 100, dependsOn: 'ghost' },
    ];
    expect(() => sequenceEntrance(entries)).toThrow(/unknown dependency/i);
  });

  test('throws on a direct circular dependency (a <-> b)', () => {
    const entries: EntranceEntry[] = [
      { id: 'a', delay: 0, duration: 100, dependsOn: 'b' },
      { id: 'b', delay: 0, duration: 100, dependsOn: 'a' },
    ];
    expect(() => sequenceEntrance(entries)).toThrow(/circular/i);
  });

  test('throws on a self-referential circular dependency', () => {
    const entries: EntranceEntry[] = [
      { id: 'a', delay: 0, duration: 100, dependsOn: 'a' },
    ];
    expect(() => sequenceEntrance(entries)).toThrow(/circular/i);
  });

  test('throws on a longer dependency cycle (a -> b -> c -> a)', () => {
    const entries: EntranceEntry[] = [
      { id: 'a', delay: 0, duration: 100, dependsOn: 'c' },
      { id: 'b', delay: 0, duration: 100, dependsOn: 'a' },
      { id: 'c', delay: 0, duration: 100, dependsOn: 'b' },
    ];
    expect(() => sequenceEntrance(entries)).toThrow(/circular/i);
  });

  test('throws on duplicate ids', () => {
    const entries: EntranceEntry[] = [
      { id: 'a', delay: 0, duration: 100 },
      { id: 'a', delay: 0, duration: 100 },
    ];
    expect(() => sequenceEntrance(entries)).toThrow(/duplicate/i);
  });

  test('total entrance duration can be derived from the timeline', () => {
    const entries: EntranceEntry[] = [
      { id: 'a', delay: 0, duration: 200 },
      { id: 'b', delay: 100, duration: 200, dependsOn: 'a' },
    ];
    const timeline = sequenceEntrance(entries);
    const end = Math.max(...timeline.map((s) => s.startTime + s.duration));
    expect(end).toBe(500);
  });
});
