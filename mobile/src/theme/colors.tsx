// Trackr Mobile — Design Token System
// Pastel summer iOS theme

export const Colors = {
  // Backgrounds
  bgWarm:        '#fffbeb',   // warm yellow-tinted app background
  bgCard:        '#ffffff',
  bgInput:       '#ffffff',
  bgMuted:       '#fef9c3',   // very light yellow tint for secondary surfaces

  // Yellow gradient (primary action)
  yellowLight:   '#fef9c3',
  yellowMid:     '#fde68a',
  yellow:        '#fbbf24',
  yellowDark:    '#f59e0b',

  // Pastel accents
  peach:         '#ffedd5',
  peachMid:      '#fed7aa',
  pink:          '#fce7f3',
  pinkMid:       '#fbcfe8',
  blue:          '#dbeafe',
  blueMid:       '#bfdbfe',
  purple:        '#ede9fe',
  green:         '#d1fae5',

  // Text (iOS HIG)
  textPrimary:   '#1c1c1e',
  textSecondary: '#6b7280',
  textTertiary:  '#9ca3af',
  textPlaceholder:'#c4c4c6',

  // Borders & dividers
  border:        '#f3f4f6',
  borderActive:  '#fbbf24',

  // Semantic
  error:         '#ef4444',
  errorBg:       '#fef2f2',
  success:       '#10b981',
  successBg:     '#d1fae5',
};

export const Gradients = {
  primaryBtn:  ['#fde68a', '#fbbf24'],
  bgFull:      ['#fffbeb', '#fff7ed', '#ffffff'],
  cardHeader:  ['#fffbeb', '#ffffff'],
  logo:        ['#fde68a', '#fb923c'],
};

export const Radius = {
  xs:   8,
  sm:   12,
  md:   16,
  lg:   20,
  xl:   24,
  xxl:  28,
  pill: 999,
};

export const Shadows = {
  card: {
    shadowColor: '#92400e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  float: {
    shadowColor: '#92400e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  input: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
};
