export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F7',
    text: '#111114',
    textMuted: '#6B6B72',
    border: '#E3E3E7',
    primary: '#3B82F6',
    success: '#22C55E',
    danger: '#EF4444',
  },
  dark: {
    background: '#111114',
    surface: '#1C1C21',
    text: '#F5F5F7',
    textMuted: '#9B9BA3',
    border: '#2C2C33',
    primary: '#60A5FA',
    success: '#4ADE80',
    danger: '#F87171',
  },
} as const;

export const HABIT_COLORS = [
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#14B8A6',
  '#3B82F6',
  '#6366F1',
  '#A855F7',
  '#EC4899',
  '#6B7280',
] as const;

export const HABIT_ICONS = [
  'water',
  'walk',
  'book',
  'barbell',
  'bicycle',
  'flame',
  'heart',
  'leaf',
  'moon',
  'musical-notes',
  'nutrition',
  'pencil',
  'sunny',
  'time',
  'checkmark-circle',
  'star',
] as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
} as const;

export const typography = {
  title: { fontSize: 24, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};
