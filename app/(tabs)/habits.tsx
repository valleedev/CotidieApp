import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { use$ } from '@legendapp/state/react';
import { useActiveHabits } from '../../src/hooks/useHabits';
import { useProgress } from '../../src/hooks/useProgress';
import { HabitCard } from '../../src/components/HabitCard';
import { EmptyState } from '../../src/components/EmptyState';
import { HabitsSummaryCard } from '../../src/components/HabitsSummaryCard';
import { Fab } from '../../src/components/Fab';
import { reorderHabits, softDeleteHabit } from '../../src/state/habits$';
import { reminders$ } from '../../src/state/reminders$';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';
import type { Habit } from '../../src/domain/types';

export default function HabitsScreen() {
  const habits = useActiveHabits();
  const progress = useProgress();
  const reminders = Object.values(use$(reminders$));
  const colors = useThemeColors();

  if (habits.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          title="Crea tu primer hábito"
          actionLabel="Crear hábito"
          onAction={() => router.push('/habit/new')}
        />
      </SafeAreaView>
    );
  }

  const bestCurrentStreak = Math.max(0, ...progress.map((e) => e.currentStreak));

  function confirmDelete(habit: Habit) {
    Alert.alert('Eliminar hábito', `¿Seguro que quieres eliminar "${habit.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => softDeleteHabit(habit.id) },
    ]);
  }

  function reminderSummaryFor(habit: Habit): string {
    return reminders
      .filter((r) => r.habitId === habit.id && r.deletedAt === null && r.enabled)
      .map((r) => r.time)
      .join(', ');
  }

  function renderItem({ item, drag, isActive }: RenderItemParams<Habit>) {
    return (
      <Swipeable
        renderRightActions={() => (
          <Pressable
            onPress={() => confirmDelete(item)}
            style={[styles.deleteAction, { backgroundColor: colors.danger }]}
          >
            <Ionicons name="trash" size={20} color="#FFFFFF" />
          </Pressable>
        )}
      >
        <View style={[styles.itemWrapper, { opacity: isActive ? 0.7 : 1 }]}>
          <HabitCard
            habit={item}
            onPress={() => router.push(`/habit/${item.id}`)}
            reminderSummary={reminderSummaryFor(item)}
          />
          <Pressable onLongPress={drag} style={styles.dragHandle}>
            <Ionicons name="reorder-three" size={22} color={colors.textMuted} />
          </Pressable>
        </View>
      </Swipeable>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <DraggableFlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onDragEnd={({ data }) => reorderHabits(data.map((h) => h.id))}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTexts}>
              <Text style={[typography.title, { color: colors.text }]}>Hábitos</Text>
              <Text style={[typography.body, { color: colors.textMuted }]}>
                Pequeñas acciones, grandes cambios.
              </Text>
            </View>
            <Fab variant="inline" onPress={() => router.push('/habit/new')} />
          </View>
        }
        ListFooterComponent={<HabitsSummaryCard currentStreak={bestCurrentStreak} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTexts: {
    gap: 2,
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dragHandle: {
    padding: spacing.sm,
  },
  deleteAction: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
});
