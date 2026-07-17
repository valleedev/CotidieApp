import { StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { duration } from '../theme/motion';

export interface StreakBadgeProps {
  current: number;
}

// Solo se muestra cuando hay algo que celebrar — sin racha, sin badge.
export function StreakBadge({ current }: StreakBadgeProps) {
  const colors = useThemeColors();

  if (current === 0) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(duration.fast)}
      exiting={FadeOut.duration(duration.fast)}
      style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
      <Text style={[typography.caption, { color: colors.text, fontWeight: '600' }]}>{current} días</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
  },
});
