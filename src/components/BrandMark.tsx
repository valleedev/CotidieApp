import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/useThemeColors';
import { radii } from '../theme/tokens';

export interface BrandMarkProps {
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
  iconSize?: number;
}

export function BrandMark({ icon = 'checkmark', size = 48, iconSize = 24 }: BrandMarkProps) {
  const colors = useThemeColors();

  return (
    <LinearGradient
      colors={[colors.primary, colors.success]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.mark, { width: size, height: size, borderRadius: radii.full }]}
    >
      <Ionicons name={icon} size={iconSize} color={colors.text} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mark: { alignItems: 'center', justifyContent: 'center' },
});
