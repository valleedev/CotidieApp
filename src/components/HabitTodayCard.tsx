import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  ZoomIn,
  ZoomOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { duration } from '../theme/motion';
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function HabitTodayCard({ entry, onPress, onToggleGeneric, onToggleReminder }: HabitTodayCardProps) {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(true);
  const { habit, count, target, currentStreak, reminders } = entry;
  const done = isDone(count, target);
  const hasReminders = reminders.length > 0;

  const doneProgress = useSharedValue(done ? 1 : 0);
  useEffect(() => {
    doneProgress.value = withTiming(done ? 1 : 0, { duration: duration.normal });
  }, [done, doneProgress]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(doneProgress.value, [0, 1], [colors.surface, colors.successBackground]),
    borderColor: interpolateColor(doneProgress.value, [0, 1], [colors.border, colors.successBorder]),
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.card, cardAnimatedStyle]}
      layout={LinearTransition.duration(duration.normal)}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconBadge, { backgroundColor: habit.color }]}>
          <Ionicons name={habit.icon as never} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.texts}>
          <Text style={[typography.body, { color: colors.text }]} numberOfLines={1}>
            {habit.name}
          </Text>
          {habit.category ? (
            <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={1}>
              {habit.category}
            </Text>
          ) : null}
        </View>
        <StreakBadge current={currentStreak} />
        {done ? (
          <AnimatedPressable
            key="done"
            entering={ZoomIn}
            exiting={ZoomOut}
            onPress={hasReminders ? undefined : onToggleGeneric}
            disabled={hasReminders}
            hitSlop={8}
            style={[styles.doneCheck, { backgroundColor: colors.success }]}
          >
            <Ionicons name="checkmark" size={16} color={colors.background} />
          </AnimatedPressable>
        ) : hasReminders ? (
          <Animated.View key="reminders" entering={ZoomIn} exiting={ZoomOut} style={styles.rightControls}>
            <View style={[styles.countChip, { backgroundColor: colors.surfaceElevated }]}>
              <Text style={[typography.caption, { color: colors.text, fontWeight: '600' }]}>
                {count}/{target}
              </Text>
            </View>
            <Pressable onPress={() => setExpanded((e) => !e)} hitSlop={8}>
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View key="control" entering={ZoomIn} exiting={ZoomOut}>
            <CompletionControl
              target={target}
              count={count}
              color={habit.color}
              onTapEmpty={onToggleGeneric}
              onTapFilled={onToggleGeneric}
            />
          </Animated.View>
        )}
      </View>

      {hasReminders && expanded ? (
        <Animated.View
          entering={FadeIn.duration(duration.fast)}
          exiting={FadeOut.duration(duration.fast)}
          style={[styles.remindersBlock, { backgroundColor: colors.surfaceElevated }]}
        >
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
        </Animated.View>
      ) : null}

      {done ? (
        <Animated.View
          entering={FadeIn.duration(duration.normal)}
          exiting={FadeOut.duration(duration.fast)}
          style={[styles.banner, { backgroundColor: colors.successPill }]}
        >
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={[typography.caption, { color: colors.success }]}>¡Muy bien! Hábito completado</Text>
        </Animated.View>
      ) : null}
    </AnimatedPressable>
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
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
