import { router } from 'expo-router';
import { HabitForm } from '../../src/components/HabitForm';
import { createHabit } from '../../src/state/habits$';
import { createReminder } from '../../src/state/reminders$';
import { diffReminderDrafts } from '../../src/domain/reminders';

export default function NewHabit() {
  return (
    <HabitForm
      submitLabel="Crear"
      onSubmit={(values, reminderDrafts) => {
        const habit = createHabit(values);
        const { toCreate } = diffReminderDrafts(habit.id, [], reminderDrafts);
        toCreate.forEach(createReminder);
        router.back();
      }}
    />
  );
}
