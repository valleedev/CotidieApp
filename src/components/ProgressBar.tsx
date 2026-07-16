import { StyleSheet, View } from 'react-native';
import { radii } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';

export interface ProgressBarProps {
  value: number; // 0..1
  color?: string;
}

export function ProgressBar({ value, color }: ProgressBarProps) {
  const colors = useThemeColors();
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceElevated }]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped * 100}%`, backgroundColor: color ?? colors.success },
        ]}
      />
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
