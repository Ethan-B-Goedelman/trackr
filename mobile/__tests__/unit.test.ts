/**
 * Trackr Mobile — Unit Tests
 * Tests for pure utility functions used throughout the mobile app.
 */

// ─── Salary Formatter ─────────────────────────────────────────────────────────

function formatSalary(min?: number | null, max?: number | null): string | null {
  if (!min && !max) return null;
  return [min, max]
    .filter(Boolean)
    .map((v) => `$${((v as number) / 1000).toFixed(0)}k`)
    .join(' – ');
}

describe('Salary Formatter', () => {
  it('formats a full salary range correctly', () => {
    expect(formatSalary(70000, 100000)).toBe('$70k – $100k');
  });

  it('formats only min salary when max is absent', () => {
    expect(formatSalary(55000, null)).toBe('$55k');
  });

  it('formats only max salary when min is absent', () => {
    expect(formatSalary(null, 90000)).toBe('$90k');
  });

  it('returns null when no salary is provided', () => {
    expect(formatSalary()).toBeNull();
    expect(formatSalary(null, null)).toBeNull();
  });
});

// ─── Dashboard Greeting ───────────────────────────────────────────────────────

function greeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

describe('Dashboard Greeting', () => {
  it('returns Good morning in the morning', () => {
    expect(greeting(6)).toBe('Good morning');
    expect(greeting(11)).toBe('Good morning');
  });

  it('returns Good afternoon in the afternoon', () => {
    expect(greeting(12)).toBe('Good afternoon');
    expect(greeting(16)).toBe('Good afternoon');
  });

  it('returns Good evening in the evening', () => {
    expect(greeting(17)).toBe('Good evening');
    expect(greeting(21)).toBe('Good evening');
  });
});

// ─── Status Style Lookup ──────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'Applied':      { bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' },
  'Phone Screen': { bg: '#fef9c3', text: '#a16207', dot: '#fbbf24' },
  'Technical':    { bg: '#ede9fe', text: '#6d28d9', dot: '#8b5cf6' },
  'Onsite':       { bg: '#ffedd5', text: '#c2410c', dot: '#f97316' },
  'Offer':        { bg: '#fce7f3', text: '#be185d', dot: '#ec4899' },
  'Accepted':     { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  'Rejected':     { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' },
};

describe('Status Style Lookup', () => {
  it('has a style defined for every application status', () => {
    const statuses = ['Applied', 'Phone Screen', 'Technical', 'Onsite', 'Offer', 'Accepted', 'Rejected'];
    statuses.forEach((s) => expect(STATUS_STYLES[s]).toBeDefined());
  });

  it('each status style has bg, text, and dot colour properties', () => {
    Object.values(STATUS_STYLES).forEach((style) => {
      expect(style).toHaveProperty('bg');
      expect(style).toHaveProperty('text');
      expect(style).toHaveProperty('dot');
    });
  });

  it('falls back gracefully for an unknown status', () => {
    const fallback = STATUS_STYLES['Unknown'] ?? STATUS_STYLES['Applied'];
    expect(fallback).toBeDefined();
    expect(fallback.bg).toBe('#dbeafe');
  });
});

// ─── Initials Generator ───────────────────────────────────────────────────────

function getInitials(firstName?: string, lastName?: string, email?: string): string {
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  if (fullName) {
    return fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }
  return email?.[0]?.toUpperCase() ?? '?';
}

describe('Initials Generator', () => {
  it('generates initials from first and last name', () => {
    expect(getInitials('Ethan', 'Goedelman')).toBe('EG');
  });

  it('uses only first name initial when last name is missing', () => {
    expect(getInitials('Ethan', undefined)).toBe('E');
  });

  it('falls back to email initial when no name is provided', () => {
    expect(getInitials(undefined, undefined, 'ethan@example.com')).toBe('E');
  });

  it('returns ? when no name or email is available', () => {
    expect(getInitials()).toBe('?');
  });
});
