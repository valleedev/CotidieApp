import { useRef, useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { HabitForm, type HabitFormHandle } from '../../../src/components/HabitForm';
import {
  HabitFormHeaderLeft,
  HabitFormHeaderRight,
  HabitFormHeaderTitle,
} from '../../../src/components/HabitFormHeader';
import { updateHabit, softDeleteHabit } from '../../../src/state/habits$';
import { reminders$, createReminder, updateReminder, softDeleteReminder } from '../../../src/state/reminders$';
import { diffReminderDrafts } from '../../../src/domain/reminders';
import { useHabitDetail } from '../../../src/hooks/useHabitDetail';
import { useThemeColors } from '../../../src/theme/useThemeColors';
import { spacing, typography } from '../../../src/theme/tokens';

export default function EditHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useHabitDetail(id);
  const colors = useThemeColors();
  const formRef = useRef<HabitFormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  if (!detail) {
    return null;
  }

  const { habit } = detail;
  const existingReminders = Object.values(reminders$.get()).filter(
    (r) => r.habitId === id && r.deletedAt === null
  );

  function handleDelete() {
    Alert.alert('Eliminar hábito', `¿Seguro que quieres eliminar "${habit.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          softDeleteHabit(id);
          router.back();
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerLeft: () => <HabitFormHeaderLeft onPress={() => router.back()} />,
          headerTitle: () => <HabitFormHeaderTitle eyebrow="Editar hábito" title={habit.name} />,
          headerRight: () => (
            <HabitFormHeaderRight
              label="Guardar"
              disabled={!canSubmit}
              onPress={() => formRef.current?.submit()}
            />
          ),
        }}
      />
      <HabitForm
        ref={formRef}
        initial={habit}
        initialReminders={existingReminders}
        submitLabel="Guardar"
        onCanSubmitChange={setCanSubmit}
        onSubmit={(values, reminderDrafts) => {
          updateHabit(id, values);
          const { toCreate, toUpdate, toDeleteIds } = diffReminderDrafts(
            id,
            existingReminders,
            reminderDrafts
          );
          toCreate.forEach(createReminder);
          toUpdate.forEach(({ id: reminderId, patch }) => updateReminder(reminderId, patch));
          toDeleteIds.forEach(softDeleteReminder);
          router.back();
        }}
      />
      <Pressable onPress={handleDelete} style={styles.deleteButton}>
        <Text style={[typography.body, { color: colors.danger }]}>Eliminar hábito</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
});
