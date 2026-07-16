import { useColorScheme } from 'react-native';
import { colors } from './tokens';

export function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? colors.dark : colors.light;
}
