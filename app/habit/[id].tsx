import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { use$ } from '@legendapp/state/react';
import { HabitForm } from '../../src/components/HabitForm';
import { habits$, updateHabit, softDeleteHabit } from '../../src/state/habits$';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = use$(habits$[id]);
  const colors = useThemeColors();

  useEffect(() => {
    if (!habit || habit.deletedAt !== null) {
      router.back();
    }
  }, [habit]);

  if (!habit || habit.deletedAt !== null) {
    return null;
  }

  function handleDelete() {
    Alert.alert('Eliminar hábito', `¿Seguro que quieres eliminar "${habit!.name}"?`, [
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
      <HabitForm
        initial={habit}
        submitLabel="Guardar"
        onSubmit={(values) => {
          updateHabit(id, values);
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
