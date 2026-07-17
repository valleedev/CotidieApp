import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radii, gradients } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';

export interface ProgressBarProps {
  value: number; // 0..1
  color?: string;
  gradient?: boolean;
}

export function ProgressBar({ value, color, gradient = false }: ProgressBarProps) {
  const colors = useThemeColors();
  const clamped = Math.max(0, Math.min(1, value));
  const widthStyle = { width: `${clamped * 100}%` } as const;

  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceElevated }]}>
      {gradient ? (
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, widthStyle]}
        />
      ) : (
        <View style={[styles.fill, widthStyle, { backgroundColor: color ?? colors.success }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.full,
  },
});
