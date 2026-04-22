/**
 * Trackr Web — Integration Tests
 * Tests for data processing logic that integrates multiple parts of the app.
 */

import { describe, it, expect } from 'vitest';

// ─── Contact Map Builder ──────────────────────────────────────────────────────

function buildContactMap(contacts: { name: string; application?: any }[]): Record<string, string> {
  const map: Record<string, string> = {};
  contacts.forEach((c) => {
    if (!c.application) return;
    const appId = typeof c.application === 'object' ? c.application._id : c.application;
    if (appId) map[appId] = c.name;
  });
  return map;
}

describe('Contact Map Builder', () => {
  it('maps a contact with a string application ID', () => {
    const contacts = [{ name: 'Jane Smith', application: 'app123' }];
    expect(buildContactMap(contacts)['app123']).toBe('Jane Smith');
  });

  it('maps a contact with a populated application object', () => {
    const contacts = [{ name: 'John Doe', application: { _id: 'app456', company: 'Acme' } }];
    expect(buildContactMap(contacts)['app456']).toBe('John Doe');
  });

  it('ignores contacts with no linked application', () => {
    expect(Object.keys(buildContactMap([{ name: 'No App' }]))).toHaveLength(0);
  });

  it('handles multiple contacts correctly', () => {
    const contacts = [
      { name: 'Alice',   application: 'app1' },
      { name: 'Bob',     application: 'app2' },
      { name: 'Charlie', application: { _id: 'app3', company: 'Corp' } },
    ];
    const map = buildContactMap(contacts);
    expect(map['app1']).toBe('Alice');
    expect(map['app2']).toBe('Bob');
    expect(map['app3']).toBe('Charlie');
  });
});

// ─── Interview Set Builder ────────────────────────────────────────────────────

function buildInterviewSet(interviews: { application?: any }[]): Set<string> {
  const set = new Set<string>();
  interviews.forEach((i) => {
    if (!i.application) return;
    const appId = typeof i.application === 'object' ? i.application._id : i.application;
    if (appId) set.add(appId);
  });
  return set;
}

describe('Interview Set Builder', () => {
  it('adds application IDs from string references', () => {
    const set = buildInterviewSet([{ application: 'app1' }, { application: 'app2' }]);
    expect(set.has('app1')).toBe(true);
    expect(set.has('app2')).toBe(true);
  });

  it('adds application IDs from populated application objects', () => {
    const set = buildInterviewSet([{ application: { _id: 'app3', company: 'Acme' } }]);
    expect(set.has('app3')).toBe(true);
  });

  it('ignores interviews with no linked application', () => {
    expect(buildInterviewSet([{ application: null }, {}]).size).toBe(0);
  });

  it('deduplicates multiple interviews for the same application', () => {
    const set = buildInterviewSet([
      { application: 'app1' },
      { application: 'app1' },
      { application: 'app1' },
    ]);
    expect(set.size).toBe(1);
  });
});

// ─── Pagination ───────────────────────────────────────────────────────────────

function getTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

describe('Pagination', () => {
  it('calculates correct page count for exact multiples', () => {
    expect(getTotalPages(40, 20)).toBe(2);
    expect(getTotalPages(100, 20)).toBe(5);
  });

  it('rounds up when items do not divide evenly', () => {
    expect(getTotalPages(21, 20)).toBe(2);
    expect(getTotalPages(1, 20)).toBe(1);
  });

  it('returns 0 pages when there are no items', () => {
    expect(getTotalPages(0, 20)).toBe(0);
  });
});
