import { describe, test, expect } from 'vitest';
import { getExperimentNav } from '../src/lib/navigation';

describe('getExperimentNav', () => {
  test('returns null/null for single experiment', () => {
    const experiments = [
      { id: 'particle-grid', date: new Date('2025-06-01') },
    ];
    const result = getExperimentNav(experiments, 'particle-grid');
    expect(result).toEqual({ prev: null, next: null });
  });

  test('returns null prev for first (oldest) experiment, valid next', () => {
    const experiments = [
      { id: 'alpha', date: new Date('2025-06-01') },
      { id: 'beta', date: new Date('2025-06-05') },
      { id: 'gamma', date: new Date('2025-06-10') },
    ];
    const result = getExperimentNav(experiments, 'alpha');
    expect(result).toEqual({ prev: null, next: 'beta' });
  });

  test('returns valid prev for last (newest) experiment, null next', () => {
    const experiments = [
      { id: 'alpha', date: new Date('2025-06-01') },
      { id: 'beta', date: new Date('2025-06-05') },
      { id: 'gamma', date: new Date('2025-06-10') },
    ];
    const result = getExperimentNav(experiments, 'gamma');
    expect(result).toEqual({ prev: 'beta', next: null });
  });

  test('returns both prev and next for middle experiment', () => {
    const experiments = [
      { id: 'alpha', date: new Date('2025-06-01') },
      { id: 'beta', date: new Date('2025-06-05') },
      { id: 'gamma', date: new Date('2025-06-10') },
    ];
    const result = getExperimentNav(experiments, 'beta');
    expect(result).toEqual({ prev: 'alpha', next: 'gamma' });
  });

  test('sorts by date correctly, not by insertion order', () => {
    const experiments = [
      { id: 'gamma', date: new Date('2025-06-10') },
      { id: 'alpha', date: new Date('2025-06-01') },
      { id: 'beta', date: new Date('2025-06-05') },
    ];
    // beta is in the middle chronologically regardless of insertion order
    const result = getExperimentNav(experiments, 'beta');
    expect(result).toEqual({ prev: 'alpha', next: 'gamma' });
  });
});
