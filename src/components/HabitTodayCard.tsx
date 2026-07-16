import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { isDone } from '../domain/completion';
import { formatDayPart } from '../lib/format';
import { CompletionControl } from './CompletionControl';
import { StreakBadge } from './StreakBadge';
import type { TodayHabitEntry } from '../hooks/useToday';
import type { ID } from '../domain/types';

export interface HabitTodayCardProps {
  entry: TodayHabitEntry;
  onPress: () => void;
  onToggleGeneric: () => void;
  onToggleReminder: (reminderId: ID) => void;
}

export function HabitTodayCard({ entry, onPress, onToggleGeneric, onToggleReminder }: HabitTodayCardProps) {
  const colors = useThemeColors();
  const { habit, count, target, currentStreak, reminders } = entry;
  const done = isDone(count, target);
  const hasReminders = reminders.length > 0;

  const cardStyle = done
    ? { backgroundColor: colors.successBackground, borderColor: colors.successBorder }
    : { backgroundColor: colors.surface, borderColor: colors.border };

  return (
    <Pressable onPress={onPress} style={[styles.card, cardStyle]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBadge, { backgroundColor: habit.color }]}>
          <Ionicons name={habit.icon as never} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.texts}>
          <Text
            style={[
              typography.body,
              { color: colors.text, textDecorationLine: done ? 'line-through' : 'none' },
            ]}
            numberOfLines={1}
          >
            {habit.name}
          </Text>
        </View>
        <StreakBadge current={currentStreak} color={habit.color} />
        {done ? (
          <View style={[styles.doneCheck, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark" size={16} color={colors.background} />
          </View>
        ) : hasReminders ? (
          <View style={[styles.countChip, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[typography.caption, { color: colors.text, fontWeight: '600' }]}>
              {count}/{target}
            </Text>
          </View>
        ) : (
          <CompletionControl
            target={target}
            count={count}
            color={habit.color}
            onTapEmpty={onToggleGeneric}
            onTapFilled={onToggleGeneric}
          />
        )}
      </View>

      {hasReminders ? (
        <View style={[styles.remindersBlock, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Registra tu {habit.name.toLowerCase()} de hoy
          </Text>
          {reminders.map(({ reminder, done: reminderDone }) => (
            <Pressable
              key={reminder.id}
              onPress={() => onToggleReminder(reminder.id)}
              style={styles.reminderRow}
            >
              <Ionicons
                name={formatDayPart(reminder.time) === 'Mañana' ? 'sunny-outline' : 'moon-outline'}
                size={16}
                color={colors.textMuted}
              />
              <Text style={[typography.body, { color: colors.text, flex: 1 }]}>
                {formatDayPart(reminder.time)} · {reminder.time}
              </Text>
              <View
                style={[
                  styles.reminderCheck,
                  {
                    backgroundColor: reminderDone ? habit.color : 'transparent',
                    borderColor: reminderDone ? habit.color : colors.border,
                  },
                ]}
              >
                {reminderDone ? <Ionicons name="checkmark" size={14} color={colors.background} /> : null}
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      {done ? (
        <View style={[styles.banner, { backgroundColor: colors.successPill }]}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={[typography.caption, { color: colors.success }]}>¡Muy bien! Hábito completado</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  countChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  doneCheck: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remindersBlock: {
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  reminderCheck: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
});
