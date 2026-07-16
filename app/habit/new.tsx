import { router } from 'expo-router';
import { HabitForm } from '../../src/components/HabitForm';
import { createHabit } from '../../src/state/habits$';

export default function NewHabit() {
  return (
    <HabitForm
      submitLabel="Crear"
      onSubmit={(values) => {
        createHabit(values);
        router.back();
      }}
    />
  );
}
