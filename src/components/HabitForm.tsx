import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, typography, HABIT_COLORS } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { WeekdayPicker } from './WeekdayPicker';
import { IconPicker } from './IconPicker';
import type { Habit, Weekday } from '../domain/types';

export interface HabitFormValues {
  name: string;
  color: string;
  icon: string;
  daysOfWeek: Weekday[];
  targetPerDay: number;
}

export interface HabitFormProps {
  initial?: Habit;
  submitLabel: string;
  onSubmit: (values: HabitFormValues) => void;
}

export function HabitForm({ initial, submitLabel, onSubmit }: HabitFormProps) {
  const colors = useThemeColors();
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? HABIT_COLORS[0]);
  const [icon, setIcon] = useState(initial?.icon ?? 'checkmark-circle');
  const [daysOfWeek, setDaysOfWeek] = useState<Weekday[]>(initial?.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6]);
  const [targetPerDay, setTargetPerDay] = useState(initial?.targetPerDay ?? 1);

  const nameError = name.trim().length === 0;
  const daysError = daysOfWeek.length === 0;
  const canSubmit = !nameError && !daysError;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({ name: name.trim(), color, icon, daysOfWeek, targetPerDay });
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.field}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Nombre</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ej. Leer"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            typography.body,
            { color: colors.text, borderColor: nameError ? colors.danger : colors.border },
          ]}
        />
      </View>

      <View style={styles.field}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Color</Text>
        <View style={styles.colorRow}>
          {HABIT_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[
                styles.colorSwatch,
                { backgroundColor: c, borderColor: c === color ? colors.text : 'transparent' },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Icono</Text>
        <IconPicker value={icon} onChange={setIcon} />
      </View>

      <View style={styles.field}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>¿Qué días?</Text>
        <WeekdayPicker value={daysOfWeek} onChange={setDaysOfWeek} />
        {daysError ? (
          <Text style={[typography.caption, { color: colors.danger }]}>Elige al menos un día.</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Veces al día</Text>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => setTargetPerDay((t) => Math.max(1, t - 1))}
            style={[styles.stepperButton, { borderColor: colors.border }]}
          >
            <Ionicons name="remove" size={18} color={colors.text} />
          </Pressable>
          <Text style={[typography.body, { color: colors.text, minWidth: 24, textAlign: 'center' }]}>
            {targetPerDay}
          </Text>
          <Pressable
            onPress={() => setTargetPerDay((t) => Math.min(10, t + 1))}
            style={[styles.stepperButton, { borderColor: colors.border }]}
          >
            <Ionicons name="add" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={!canSubmit}
        style={[
          styles.submitButton,
          { backgroundColor: canSubmit ? colors.primary : colors.border },
        ]}
      >
        <Text style={[typography.body, { color: colors.background, fontWeight: '600' }]}>
          {submitLabel}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    borderWidth: 3,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
});
