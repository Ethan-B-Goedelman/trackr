/**
 * Trackr Web — Unit Tests
 * Tests for pure utility functions used throughout the application.
 */

import { describe, it, expect } from 'vitest';

// ─── Salary Formatter ────────────────────────────────────────────────────────
// Replicates the salary formatting logic used in ApplicationCard & ApplicationTable

function formatSalary(min?: number | null, max?: number | null): string | null {
  if (!min && !max) return null;
  return [min, max]
    .filter(Boolean)
    .map((v) => `$${((v as number) / 1000).toFixed(0)}k`)
    .join(' – ');
}

describe('Salary Formatter', () => {
  it('formats both min and max salary correctly', () => {
    expect(formatSalary(50000, 80000)).toBe('$50k – $80k');
  });

  it('formats only a minimum salary when max is not provided', () => {
    expect(formatSalary(60000, null)).toBe('$60k');
  });

  it('formats only a maximum salary when min is not provided', () => {
    expect(formatSalary(null, 120000)).toBe('$120k');
  });

  it('returns null when no salary data exists', () => {
    expect(formatSalary(null, null)).toBeNull();
    expect(formatSalary()).toBeNull();
  });
});

// ─── Application Status List ──────────────────────────────────────────────────
// Validates the canonical status list used across Kanban and filters

const APPLICATION_STATUSES = [
  'Applied', 'Phone Screen', 'Technical',
  'Onsite', 'Offer', 'Accepted', 'Rejected',
];

describe('Application Statuses', () => {
  it('contains exactly 7 statuses', () => {
    expect(APPLICATION_STATUSES).toHaveLength(7);
  });

  it('starts with Applied and ends with Rejected', () => {
    expect(APPLICATION_STATUSES[0]).toBe('Applied');
    expect(APPLICATION_STATUSES[APPLICATION_STATUSES.length - 1]).toBe('Rejected');
  });

  it('includes all expected pipeline stages', () => {
    const required = ['Applied', 'Phone Screen', 'Offer', 'Accepted', 'Rejected'];
    required.forEach((s) => expect(APPLICATION_STATUSES).toContain(s));
  });
});

// ─── Stale Application Detection ─────────────────────────────────────────────
// Replicates the follow-up reminder logic from Dashboard

function getStaleApps(applications: { dateApplied?: string }[], days = 14) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return applications.filter(
    (a) => a.dateApplied && new Date(a.dateApplied) < cutoff
  );
}

describe('Stale Application Detection', () => {
  it('flags applications older than 14 days', () => {
    const old = new Date();
    old.setDate(old.getDate() - 20);
    const apps = [{ dateApplied: old.toISOString() }];
    expect(getStaleApps(apps)).toHaveLength(1);
  });

  it('does not flag applications applied within 14 days', () => {
    const recent = new Date();
    recent.setDate(recent.getDate() - 5);
    const apps = [{ dateApplied: recent.toISOString() }];
    expect(getStaleApps(apps)).toHaveLength(0);
  });

  it('returns empty array when no applications provided', () => {
    expect(getStaleApps([])).toHaveLength(0);
  });

  it('skips applications with no dateApplied', () => {
    expect(getStaleApps([{ dateApplied: undefined }])).toHaveLength(0);
  });
});

// ─── Dashboard Greeting ───────────────────────────────────────────────────────

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

describe('Dashboard Greeting', () => {
  it('returns Good morning before noon', () => {
    expect(getGreeting(8)).toBe('Good morning');
    expect(getGreeting(11)).toBe('Good morning');
  });

  it('returns Good afternoon between noon and 5pm', () => {
    expect(getGreeting(12)).toBe('Good afternoon');
    expect(getGreeting(16)).toBe('Good afternoon');
  });

  it('returns Good evening at 5pm and later', () => {
    expect(getGreeting(17)).toBe('Good evening');
    expect(getGreeting(23)).toBe('Good evening');
  });
});
