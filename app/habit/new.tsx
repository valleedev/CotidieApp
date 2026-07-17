import { useRef, useState } from 'react';
import { router, Stack } from 'expo-router';
import { HabitForm, type HabitFormHandle } from '../../src/components/HabitForm';
import { HabitFormHeaderLeft, HabitFormHeaderRight, HabitFormHeaderTitle } from '../../src/components/HabitFormHeader';
import { createHabit } from '../../src/state/habits$';
import { createReminder } from '../../src/state/reminders$';
import { diffReminderDrafts } from '../../src/domain/reminders';

export default function NewHabit() {
  const formRef = useRef<HabitFormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <HabitFormHeaderLeft onPress={() => router.back()} />,
          headerTitle: () => <HabitFormHeaderTitle eyebrow="Crear hábito" title="Nuevo hábito" />,
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
        submitLabel="Crear"
        onCanSubmitChange={setCanSubmit}
        onSubmit={(values, reminderDrafts) => {
          const habit = createHabit(values);
          const { toCreate } = diffReminderDrafts(habit.id, [], reminderDrafts);
          toCreate.forEach(createReminder);
          router.back();
        }}
      />
    </>
  );
}
