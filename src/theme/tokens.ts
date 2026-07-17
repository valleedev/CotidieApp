export const colors = {
  // NOTA: no usado activamente — la app es dark-only por ahora (ver useThemeColors.ts).
  // Se conserva para un futuro toggle claro/oscuro sin rediseñar desde cero.
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F7',
    text: '#111114',
    textMuted: '#6B6B72',
    border: '#E3E3E7',
    primary: '#3B82F6',
    success: '#22C55E',
    danger: '#EF4444',
    flame: '#F97316',
    flameMuted: 'rgba(249, 115, 22, 0.12)',
    gold: '#CA8A04',
    goldMuted: 'rgba(202, 138, 4, 0.12)',
    historyPartial: '#86EFAC',
    historyEmpty: '#E3E3E7',
  },
  dark: {
    background: '#0B0F1A',
    surface: '#141B2E',
    surfaceElevated: '#1C2540',
    text: '#F5F7FA',
    textMuted: '#8A93AC',
    border: '#232C46',
    primary: '#4C8DFF',
    primaryMuted: 'rgba(76, 141, 255, 0.16)',
    success: '#34D399',
    successBackground: 'rgba(52, 211, 153, 0.12)',
    successBorder: 'rgba(52, 211, 153, 0.35)',
    successPill: '#123326',
    danger: '#F87171',
    dangerBackground: 'rgba(248, 113, 113, 0.12)',
    flame: '#F97316',
    flameMuted: 'rgba(249, 115, 22, 0.16)',
    gold: '#EAB308',
    goldMuted: 'rgba(234, 179, 8, 0.16)',
    purple: '#A855F7',
    purpleMuted: 'rgba(168, 85, 247, 0.16)',
    historyPartial: '#6EE7B7',
    historyEmpty: '#2B3454',
  },
} as const;

export const shadow = {
  fab: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
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
  hero: { fontSize: 34, fontWeight: '700' as const, lineHeight: 40 },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
};

export const gradients = {
  primary: [colors.dark.primary, colors.dark.success] as [string, string],
} as const;
