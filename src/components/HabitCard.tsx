import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { formatDaysOfWeek } from '../lib/format';
import type { Habit } from '../domain/types';

export interface HabitCardProps {
  habit: Habit;
  onPress: () => void;
}

// Presentacional: solo nombre/icono/color/días. No sabe de completions —
// las pantallas que necesitan marcar completado componen CompletionControl aparte.
export function HabitCard({ habit, onPress }: HabitCardProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.iconBadge, { backgroundColor: habit.color }]}>
        <Ionicons name={habit.icon as never} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.texts}>
        <Text style={[typography.body, { color: colors.text }]} numberOfLines={1}>
          {habit.name}
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          {formatDaysOfWeek(habit.daysOfWeek)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 2,
  },
});
