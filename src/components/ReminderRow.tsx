import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { WeekdayPicker } from './WeekdayPicker';
import { TimePickerField } from './TimePickerField';
import { describeReminderTime } from '../domain/reminderLabel';
import type { ReminderDraft } from '../domain/reminders';
import type { Weekday } from '../domain/types';

export interface ReminderRowProps {
  value: ReminderDraft;
  habitDaysOfWeek: Weekday[];
  onChange: (next: ReminderDraft) => void;
  onRemove: () => void;
  autoOpenTimePicker?: boolean;
  onAutoOpenHandled?: () => void;
}

export function ReminderRow({
  value,
  habitDaysOfWeek,
  onChange,
  onRemove,
  autoOpenTimePicker,
  onAutoOpenHandled,
}: ReminderRowProps) {
  const colors = useThemeColors();
  const customDays = value.daysOfWeek !== null;
  const { icon, label } = describeReminderTime(value.time);

  function toggleCustomDays() {
    onChange({ ...value, daysOfWeek: customDays ? null : habitDaysOfWeek });
  }

  function handleRemove() {
    Alert.alert('Eliminar recordatorio', '¿Seguro que quieres eliminar este recordatorio?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: onRemove },
    ]);
  }

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={styles.row}>
        <View style={styles.timeLabel}>
          <TimePickerField
            time={value.time}
            onChange={(time) => onChange({ ...value, time })}
            icon={icon}
            iconColor={icon === 'sunny' ? colors.success : colors.textMuted}
            label={label}
            autoOpen={autoOpenTimePicker}
            onAutoOpenHandled={onAutoOpenHandled}
          />
        </View>
        <Switch
          value={value.enabled}
          onValueChange={(enabled) => onChange({ ...value, enabled })}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
        <Pressable onPress={handleRemove} hitSlop={8}>
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
  customDaysSection: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
});
