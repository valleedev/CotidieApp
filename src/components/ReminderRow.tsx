import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { WeekdayPicker } from './WeekdayPicker';
import { describeReminderTime } from '../domain/reminderLabel';
import type { ReminderDraft } from '../domain/reminders';
import type { Weekday } from '../domain/types';

export interface ReminderRowProps {
  value: ReminderDraft;
  habitDaysOfWeek: Weekday[];
  onChange: (next: ReminderDraft) => void;
  onRemove: () => void;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function ReminderRow({ value, habitDaysOfWeek, onChange, onRemove }: ReminderRowProps) {
  const colors = useThemeColors();
  const [hourStr, minuteStr] = value.time.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  const customDays = value.daysOfWeek !== null;
  const { icon, label } = describeReminderTime(value.time);

  function setTime(nextHour: number, nextMinute: number) {
    const h = ((nextHour % 24) + 24) % 24;
    const m = ((nextMinute % 60) + 60) % 60;
    onChange({ ...value, time: `${pad(h)}:${pad(m)}` });
  }

  function toggleCustomDays() {
    onChange({ ...value, daysOfWeek: customDays ? null : habitDaysOfWeek });
  }

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={styles.row}>
        <View style={styles.timeLabel}>
          <Ionicons name={icon} size={18} color={icon === 'sunny' ? colors.success : colors.textMuted} />
          <View style={styles.timeStepperRow}>
            <MiniStepper value={pad(hour)} onDecrement={() => setTime(hour - 1, minute)} onIncrement={() => setTime(hour + 1, minute)} />
            <Text style={[typography.body, { color: colors.text }]}>:</Text>
            <MiniStepper value={pad(minute)} onDecrement={() => setTime(hour, minute - 5)} onIncrement={() => setTime(hour, minute + 5)} />
            <Text style={[typography.caption, { color: colors.textMuted }]}> · {label}</Text>
          </View>
        </View>
        <Switch
          value={value.enabled}
          onValueChange={(enabled) => onChange({ ...value, enabled })}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </Pressable>
      </View>

      <View style={[styles.customDaysSection, { borderTopColor: colors.border }]}>
        <Pressable onPress={toggleCustomDays}>
          <Text style={[typography.caption, { color: colors.primary }]}>
            {customDays ? 'Personalizar días' : 'Todos los días del hábito'}
          </Text>
        </Pressable>

        {customDays ? (
          <WeekdayPicker
            value={value.daysOfWeek ?? habitDaysOfWeek}
            onChange={(days) => onChange({ ...value, daysOfWeek: days })}
          />
        ) : null}
      </View>
    </View>
  );
}

function MiniStepper({
  value,
  onDecrement,
  onIncrement,
}: {
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  const colors = useThemeColors();
  return (
    <View style={styles.miniStepper}>
      <Pressable onPress={onDecrement} hitSlop={6}>
        <Ionicons name="chevron-back" size={12} color={colors.textMuted} />
      </Pressable>
      <Text style={[typography.body, { color: colors.text, minWidth: 22, textAlign: 'center' }]}>{value}</Text>
      <Pressable onPress={onIncrement} hitSlop={6}>
        <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  timeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  timeStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  customDaysSection: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
});
