import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, typography, HABIT_COLORS } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { WeekdayPicker } from './WeekdayPicker';
import { IconPicker } from './IconPicker';
import { ReminderRow } from './ReminderRow';
import type { Habit, Reminder, Weekday } from '../domain/types';
import type { ReminderDraft } from '../domain/reminders';
import { refreshPermissionStatusAsync, requestPermissionAsync } from '../notifications/permissions';

export interface HabitFormValues {
  name: string;
  color: string;
  icon: string;
  category: string;
  daysOfWeek: Weekday[];
  targetPerDay: number;
}

export interface HabitFormHandle {
  submit: () => void;
}

export interface HabitFormProps {
  initial?: Habit;
  initialReminders?: Reminder[];
  submitLabel: string;
  onSubmit: (values: HabitFormValues, reminderDrafts: ReminderDraft[]) => void;
  onCanSubmitChange?: (canSubmit: boolean) => void;
}

function reminderToDraft(reminder: Reminder): ReminderDraft {
  return { id: reminder.id, time: reminder.time, daysOfWeek: reminder.daysOfWeek, enabled: reminder.enabled };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function currentTimeRounded(): string {
  const now = new Date();
  const minutes = Math.round(now.getMinutes() / 5) * 5;
  const hours = (now.getHours() + Math.floor(minutes / 60)) % 24;
  return `${pad(hours)}:${pad(minutes % 60)}`;
}

export const HabitForm = forwardRef<HabitFormHandle, HabitFormProps>(function HabitForm(
  { initial, initialReminders = [], submitLabel, onSubmit, onCanSubmitChange },
  ref
) {
  const colors = useThemeColors();
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? HABIT_COLORS[0]);
  const [icon, setIcon] = useState(initial?.icon ?? 'checkmark-circle');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [daysOfWeek, setDaysOfWeek] = useState<Weekday[]>(initial?.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6]);
  const [targetPerDay, setTargetPerDay] = useState(initial?.targetPerDay ?? 1);
  const [reminderDrafts, setReminderDrafts] = useState<ReminderDraft[]>(
    initialReminders.map(reminderToDraft)
  );
  const [autoOpenIndex, setAutoOpenIndex] = useState<number | null>(null);

  const nameError = name.trim().length === 0;
  const daysError = daysOfWeek.length === 0;
  const canSubmit = !nameError && !daysError;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(
      { name: name.trim(), color, icon, category: category.trim(), daysOfWeek, targetPerDay },
      reminderDrafts
    );
  }

  useImperativeHandle(ref, () => ({ submit: handleSubmit }), [handleSubmit]);

  useEffect(() => {
    onCanSubmitChange?.(canSubmit);
  }, [canSubmit, onCanSubmitChange]);

  async function handleAddReminder() {
    const status = await refreshPermissionStatusAsync();
    if (status === 'undetermined') {
      await requestPermissionAsync();
    }
    setReminderDrafts((drafts) => {
      setAutoOpenIndex(drafts.length);
      return [...drafts, { time: currentTimeRounded(), daysOfWeek: null, enabled: true }];
    });
  }

  function updateReminderDraft(index: number, next: ReminderDraft) {
    setReminderDrafts((drafts) => drafts.map((d, i) => (i === index ? next : d)));
  }

  function removeReminderDraft(index: number) {
    setReminderDrafts((drafts) => drafts.filter((_, i) => i !== index));
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.field}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Nombre</Text>
        <View
          style={[
            styles.nameCard,
            { backgroundColor: colors.surface, borderColor: nameError ? colors.danger : colors.border },
          ]}
        >
          <View style={[styles.iconBadge, { backgroundColor: color }]}>
            <Ionicons name={icon as never} size={18} color="#FFFFFF" />
          </View>
          <View style={styles.nameTextBlock}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej. Leer"
              placeholderTextColor={colors.textMuted}
              style={[typography.body, { color: colors.text }]}
            />
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="Añadir categoría (opcional)"
              placeholderTextColor={colors.textMuted}
              style={[typography.caption, { color: colors.textMuted }]}
            />
          </View>
          {name.length > 0 ? (
            <Pressable
              onPress={() => setName('')}
              hitSlop={8}
              style={[styles.clearButton, { backgroundColor: colors.surfaceElevated }]}
            >
              <Ionicons name="close" size={14} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Icono y color</Text>
        <View style={[styles.iconColorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconPicker value={icon} onChange={setIcon} />
          <View style={styles.colorRow}>
            {HABIT_COLORS.map((c) => {
              const selected = c === color;
              return (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={[styles.colorSwatch, { backgroundColor: c }]}
                >
                  {selected ? <Ionicons name="checkmark" size={18} color="#FFFFFF" /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>¿Qué días?</Text>
        <WeekdayPicker value={daysOfWeek} onChange={setDaysOfWeek} showSummary />
        {daysError ? (
          <Text style={[typography.caption, { color: colors.danger }]}>Elige al menos un día.</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Veces al día</Text>
        <View style={[styles.targetCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Pressable
            onPress={() => setTargetPerDay((t) => Math.max(1, t - 1))}
            style={[styles.targetButton, { backgroundColor: colors.background }]}
          >
            <Ionicons name="remove" size={18} color={colors.text} />
          </Pressable>
          <View style={styles.targetCenter}>
            <Text style={[typography.title, { color: colors.text }]}>{targetPerDay}</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>veces al día</Text>
          </View>
          <Pressable
            onPress={() => setTargetPerDay((t) => Math.min(10, t + 1))}
            style={[styles.targetButton, { backgroundColor: colors.successBackground }]}
          >
            <Ionicons name="add" size={18} color={colors.success} />
          </Pressable>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Recordatorios</Text>
        {reminderDrafts.map((draft, index) => (
          <ReminderRow
            key={draft.id ?? `new-${index}`}
            value={draft}
            habitDaysOfWeek={daysOfWeek}
            onChange={(next) => updateReminderDraft(index, next)}
            onRemove={() => removeReminderDraft(index)}
            autoOpenTimePicker={autoOpenIndex === index}
            onAutoOpenHandled={() => setAutoOpenIndex(null)}
          />
        ))}
        <Pressable onPress={handleAddReminder} style={[styles.addReminderButton, { borderColor: colors.success }]}>
          <Ionicons name="add-circle-outline" size={18} color={colors.success} />
          <Text style={[typography.body, { color: colors.success }]}>Añadir recordatorio</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  nameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  nameTextBlock: {
    flex: 1,
    gap: 2,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconColorCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  targetButton: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetCenter: {
    alignItems: 'center',
  },
  addReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
  },
});
