import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { WeekdayPicker } from './WeekdayPicker';
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
        <View style={styles.timeRow}>
          <Stepper label={pad(hour)} onDecrement={() => setTime(hour - 1, minute)} onIncrement={() => setTime(hour + 1, minute)} />
          <Text style={[typography.body, { color: colors.text }]}>:</Text>
          <Stepper label={pad(minute)} onDecrement={() => setTime(hour, minute - 5)} onIncrement={() => setTime(hour, minute + 5)} />
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
  );
}

function Stepper({
  label,
  onDecrement,
  onIncrement,
}: {
  label: string;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  const colors = useThemeColors();
  return (
    <View style={styles.stepper}>
      <Pressable onPress={onDecrement} style={[styles.stepperButton, { borderColor: colors.border }]}>
        <Ionicons name="remove" size={16} color={colors.text} />
      </Pressable>
      <Text style={[typography.body, { color: colors.text, minWidth: 28, textAlign: 'center' }]}>{label}</Text>
      <Pressable onPress={onIncrement} style={[styles.stepperButton, { borderColor: colors.border }]}>
        <Ionicons name="add" size={16} color={colors.text} />
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
