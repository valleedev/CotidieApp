import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { formatDaysOfWeek } from '../lib/format';
import type { Habit } from '../domain/types';

export interface HabitCardProps {
  habit: Habit;
  onPress: () => void;
  reminderSummary?: string;
  onReorderLongPress?: () => void;
}

// Presentacional: solo nombre/icono/color/días. No sabe de completions —
// las pantallas que necesitan marcar completado componen CompletionControl aparte.
export function HabitCard({ habit, onPress, reminderSummary, onReorderLongPress }: HabitCardProps) {
  const colors = useThemeColors();
  const subtitle = `${habit.category ? habit.category + ' · ' : ''}${formatDaysOfWeek(habit.daysOfWeek)}${reminderSummary ? ' · ' + reminderSummary : ''}`;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.surface }]}
    >
      <View style={[styles.accentBar, { backgroundColor: habit.color }]} />
      <View style={[styles.iconBadge, { backgroundColor: habit.color + '33' }]}>
        <Ionicons name={habit.icon as never} size={22} color={habit.color} />
      </View>
      <View style={styles.texts}>
        <Text style={[typography.body, { color: colors.text }]} numberOfLines={1}>
          {habit.name}
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
      {onReorderLongPress ? (
        <Pressable onLongPress={onReorderLongPress} hitSlop={8} style={styles.dragHandle}>
          <Ionicons name="reorder-three" size={22} color={colors.textMuted} />
        </Pressable>
      ) : null}
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
    paddingLeft: spacing.md + 4,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  dragHandle: {
    padding: spacing.xs,
  },
});
