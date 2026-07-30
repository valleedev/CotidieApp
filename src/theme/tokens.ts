export const colors = {
  light: {
    background: '#FCF9F5', surface: '#F5F0E9', surfaceElevated: '#FFFCF8', text: '#26221E', textMuted: '#777067', border: '#E3DCD3',
    primary: '#B84D2A', primaryMuted: '#F8E7DC', success: '#527652', successBackground: '#E6EEE2', successBorder: '#B6CEAF', successPill: '#E6EEE2', danger: '#B84D2A', dangerBackground: '#F8E7DC',
    flame: '#B97B21', flameMuted: '#F7EDD8', gold: '#B97B21', goldMuted: '#F7EDD8', purple: '#7E5C91', purpleMuted: '#EEE5F0', historyPartial: '#DCE8D8', historyEmpty: '#EFEAE2',
  },
  dark: {
    background: '#1D1D16', surface: '#27251D', surfaceElevated: '#24221A', text: '#F3EFE8', textMuted: '#AEA79B', border: '#454136',
    primary: '#E8875C', primaryMuted: '#4A2819', success: '#A8C39F', successBackground: '#203720', successBorder: '#3D5A3B', successPill: '#203720', danger: '#E8875C', dangerBackground: '#4A2819',
    flame: '#C28B2A', flameMuted: '#3A2D0D', gold: '#C28B2A', goldMuted: '#3A2D0D', purple: '#A586B4', purpleMuted: '#362B3A', historyPartial: '#29442A', historyEmpty: '#302D23',
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
  '#526F9E',
  '#B84D2A',
  '#B37B24',
  '#70833D',
  '#3E7166',
  '#7B5D91',
  '#AD4F6B',
  '#827160',
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
