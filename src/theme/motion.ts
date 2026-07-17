import { Easing, type WithSpringConfig } from 'react-native-reanimated';

export const duration = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

export const easing = {
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  decelerate: Easing.out(Easing.cubic),
  accelerate: Easing.in(Easing.cubic),
} as const;

export const spring: Record<'snappy' | 'gentle' | 'bouncy', WithSpringConfig> = {
  snappy: { damping: 20, stiffness: 300, mass: 0.6 },
  gentle: { damping: 18, stiffness: 180, mass: 0.8 },
  bouncy: { damping: 14, stiffness: 220, mass: 0.9 },
};
