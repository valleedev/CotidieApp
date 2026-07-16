import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitForm } from '../../src/components/HabitForm';
import { MiniCalendar } from '../../src/components/MiniCalendar';
import { updateHabit, softDeleteHabit } from '../../src/state/habits$';
import { useHabitDetail } from '../../src/hooks/useHabitDetail';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, radii, typography } from '../../src/theme/tokens';

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useHabitDetail(id);
  const colors = useThemeColors();

  useEffect(() => {
    if (!detail) {
      router.back();
    }
  }, [detail]);

  if (!detail) {
    return null;
  }

  const { habit, currentStreak, bestStreak, completedDates } = detail;

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
      <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.statsHeader}>
          <View style={[styles.iconBadge, { backgroundColor: habit.color }]}>
            <Ionicons name={habit.icon as never} size={20} color="#FFFFFF" />
          </View>
          <Text style={[typography.title, { color: colors.text, flex: 1 }]} numberOfLines={1}>
            {habit.name}
          </Text>
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={[typography.title, { color: colors.text }]}>{currentStreak}</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>Racha actual</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[typography.title, { color: colors.text }]}>{bestStreak}</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>Mejor racha</Text>
          </View>
        </View>
        <MiniCalendar completedDates={completedDates} color={habit.color} />
      </View>
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
  statsCard: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
});
