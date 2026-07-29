import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitSymbol } from './HabitSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { duration } from '../theme/motion';
import { CompletionControl } from './CompletionControl';
import { StreakBadge } from './StreakBadge';
import { formatDayPart } from '../lib/format';
import type { TodayHabitEntry } from '../hooks/useToday';
import type { ID } from '../domain/types';

export interface HabitTimelineProps {
  entries: TodayHabitEntry[];
  activeHabitId: string | null;
  onSetActive: (habitId: string) => void;
  onToggleGeneric: (entry: TodayHabitEntry) => void;
  onToggleReminder: (entry: TodayHabitEntry, reminderId: ID) => void;
  onPressDetail: (habitId: string) => void;
}

export function HabitTimeline({
  entries,
  activeHabitId,
  onSetActive,
  onToggleGeneric,
  onToggleReminder,
  onPressDetail,
}: HabitTimelineProps) {
  const engaged = entries.map((e) => e.done || e.habit.id === activeHabitId);

  return (
    <View>
      {entries.map((entry, index) => (
        <TimelineRow
          key={entry.habit.id}
          entry={entry}
          isActive={entry.habit.id === activeHabitId}
          isFirst={index === 0}
          isLast={index === entries.length - 1}
          topEngaged={index === 0 ? false : engaged[index - 1]}
          bottomEngaged={engaged[index]}
          onSetActive={() => onSetActive(entry.habit.id)}
          onToggleGeneric={() => onToggleGeneric(entry)}
          onToggleReminder={(reminderId) => onToggleReminder(entry, reminderId)}
          onPressDetail={() => onPressDetail(entry.habit.id)}
        />
      ))}
    </View>
  );
}

interface TimelineRowProps {
  entry: TodayHabitEntry;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  topEngaged: boolean;
  bottomEngaged: boolean;
  onSetActive: () => void;
  onToggleGeneric: () => void;
  onToggleReminder: (reminderId: ID) => void;
  onPressDetail: () => void;
}

function TimelineRow({
  entry,
  isActive,
  isFirst,
  isLast,
  topEngaged,
  bottomEngaged,
  onSetActive,
  onToggleGeneric,
  onToggleReminder,
  onPressDetail,
}: TimelineRowProps) {
  const colors = useThemeColors();
  const { habit, count, target, currentStreak, reminders, done } = entry;
  const hasReminders = reminders.length > 0;
  const isMulti = hasReminders || target > 1;

  return (
    <Animated.View layout={LinearTransition.duration(duration.normal)} style={styles.row}>
      <View style={styles.dotColumn}>
        {!isFirst ? (
          <View style={[styles.line, { backgroundColor: topEngaged ? colors.primary : colors.border }]} />
        ) : (
          <View style={styles.lineSpacer} />
        )}
        <Dot
          done={done}
          isActive={isActive}
          color={colors.primary}
          onPress={isMulti ? onSetActive : onToggleGeneric}
        />
        {!isLast ? (
          <View style={[styles.line, { backgroundColor: bottomEngaged ? colors.primary : colors.border }]} />
        ) : (
          <View style={styles.lineSpacer} />
        )}
      </View>

      <View style={styles.content}>
        {isActive ? (
          <View
            style={[
              styles.activeCard,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.primary },
            ]}
          >
            <Pressable onPress={onSetActive} style={styles.activeHeaderRow}>
              <View style={[styles.iconBadge, { backgroundColor: habit.color }]}>
                <HabitSymbol icon={habit.icon} size={16} color="#FFFFFF" />
              </View>
              <View style={styles.texts}>
                <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]} numberOfLines={1}>
                  {habit.name}
                </Text>
                {habit.category ? (
                  <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={1}>
                    {habit.category}
                  </Text>
                ) : null}
              </View>
              <StreakBadge current={currentStreak} />
              <Pressable onPress={onPressDetail} hitSlop={8}>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            </Pressable>

            {hasReminders ? (
              <View style={[styles.remindersBlock, { backgroundColor: colors.surface }]}>
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
            ) : isMulti ? (
              <View style={styles.controlRow}>
                <Text style={[typography.caption, { color: colors.textMuted, flex: 1 }]}>
                  {count}/{target}
                </Text>
                <CompletionControl
                  target={target}
                  count={count}
                  color={habit.color}
                  onTapEmpty={onToggleGeneric}
                  onTapFilled={onToggleGeneric}
                />
              </View>
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
          </View>
        ) : (
          <Pressable onPress={onSetActive} style={styles.collapsedRow}>
            <Text
              style={[typography.body, { color: done ? colors.text : colors.textMuted }]}
              numberOfLines={1}
            >
              {habit.name}
            </Text>
            {habit.category ? (
              <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={1}>
                {habit.category}
              </Text>
            ) : null}
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

interface DotProps {
  done: boolean;
  isActive: boolean;
  color: string;
  onPress: () => void;
}

function Dot({ done, isActive, color, onPress }: DotProps) {
  const colors = useThemeColors();

  if (done) {
    return (
      <Pressable onPress={onPress} hitSlop={10}>
        <Animated.View entering={ZoomIn} exiting={ZoomOut} style={[styles.dotDone, { backgroundColor: color }]}>
          <Ionicons name="checkmark" size={14} color={colors.background} />
        </Animated.View>
      </Pressable>
    );
  }

  if (isActive) {
    return (
      <Pressable onPress={onPress} hitSlop={10}>
        <LinearGradient
          colors={[color, colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.dotActive}
        >
          <View style={[styles.dotActiveInner, { backgroundColor: colors.background }]} />
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} hitSlop={10}>
      <View style={[styles.dotUpcoming, { borderColor: colors.border }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  dotColumn: {
    width: 32,
    alignItems: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: spacing.sm,
  },
  lineSpacer: {
    width: 2,
    flex: 1,
    minHeight: spacing.sm,
  },
  dotDone: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActiveInner: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
  },
  dotUpcoming: {
    width: 16,
    height: 16,
    borderRadius: radii.full,
    borderWidth: 2,
  },
  content: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
  },
  collapsedRow: {
    gap: 2,
    paddingVertical: spacing.xs,
  },
  activeCard: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  activeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
