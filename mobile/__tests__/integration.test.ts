/**
 * Trackr Mobile — Integration Tests
 * Tests for data processing logic that integrates multiple parts of the app.
 */

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
  it('correctly maps a contact linked by string application ID', () => {
    const contacts = [{ name: 'Sarah Connor', application: 'app001' }];
    expect(buildContactMap(contacts)['app001']).toBe('Sarah Connor');
  });

  it('correctly maps a contact linked by a populated application object', () => {
    const contacts = [{ name: 'John Smith', application: { _id: 'app002', company: 'Google' } }];
    expect(buildContactMap(contacts)['app002']).toBe('John Smith');
  });

  it('skips contacts with no linked application', () => {
    expect(Object.keys(buildContactMap([{ name: 'Ghost', application: undefined }]))).toHaveLength(0);
  });

  it('builds a map with multiple contacts correctly', () => {
    const contacts = [
      { name: 'Alice', application: 'app1' },
      { name: 'Bob',   application: { _id: 'app2', company: 'Meta' } },
    ];
    const map = buildContactMap(contacts);
    expect(Object.keys(map)).toHaveLength(2);
    expect(map['app1']).toBe('Alice');
    expect(map['app2']).toBe('Bob');
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
  it('adds application ID from a string reference', () => {
    expect(buildInterviewSet([{ application: 'app1' }]).has('app1')).toBe(true);
  });

  it('adds application ID from a populated application object', () => {
    expect(buildInterviewSet([{ application: { _id: 'app2', company: 'Apple' } }]).has('app2')).toBe(true);
  });

  it('returns an empty set when no interviews have linked applications', () => {
    expect(buildInterviewSet([{ application: null }, {}]).size).toBe(0);
  });

  it('does not duplicate application IDs across multiple interviews', () => {
    const set = buildInterviewSet([
      { application: 'app1' },
      { application: 'app1' },
      { application: 'app2' },
    ]);
    expect(set.size).toBe(2);
  });
});

// ─── Stale Application Filter ─────────────────────────────────────────────────

function filterStaleApps(apps: { dateApplied?: string }[], daysThreshold = 14) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysThreshold);
  return apps.filter((a) => a.dateApplied && new Date(a.dateApplied) < cutoff);
}

describe('Stale Application Filter', () => {
  it('includes applications older than the threshold', () => {
    const old = new Date();
    old.setDate(old.getDate() - 20);
    expect(filterStaleApps([{ dateApplied: old.toISOString() }])).toHaveLength(1);
  });

  it('excludes applications applied within the threshold', () => {
    const recent = new Date();
    recent.setDate(recent.getDate() - 3);
    expect(filterStaleApps([{ dateApplied: recent.toISOString() }])).toHaveLength(0);
  });

  it('excludes applications with no dateApplied', () => {
    expect(filterStaleApps([{}])).toHaveLength(0);
  });

  it('correctly separates stale and fresh applications in a mixed list', () => {
    const old = new Date();
    old.setDate(old.getDate() - 30);
    const fresh = new Date();
    fresh.setDate(fresh.getDate() - 2);
    const result = filterStaleApps([
      { dateApplied: old.toISOString() },
      { dateApplied: fresh.toISOString() },
    ]);
    expect(result).toHaveLength(1);
  });
});
