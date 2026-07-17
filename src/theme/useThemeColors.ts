import { useColorScheme } from 'react-native';
import { use$ } from '@legendapp/state/react';
import { colors } from './tokens';
import { settings$ } from '../state/settings$';

export function useThemeMode(): 'light' | 'dark' {
  const preference = use$(settings$.profile.theme);
  const system = useColorScheme();
  if (preference === 'system') return system === 'light' ? 'light' : 'dark';
  return preference;
}

export function useThemeColors() {
  return colors[useThemeMode()];
}
