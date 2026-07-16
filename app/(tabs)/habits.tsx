import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useActiveHabits } from '../../src/hooks/useHabits';
import { HabitCard } from '../../src/components/HabitCard';
import { EmptyState } from '../../src/components/EmptyState';
import { reorderHabits, softDeleteHabit } from '../../src/state/habits$';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing } from '../../src/theme/tokens';
import type { Habit } from '../../src/domain/types';

export default function HabitsScreen() {
  const habits = useActiveHabits();
  const colors = useThemeColors();

  if (habits.length === 0) {
    return (
      <EmptyState
        title="Crea tu primer hábito"
        actionLabel="Crear hábito"
        onAction={() => router.push('/habit/new')}
      />
    );
  }

  function confirmDelete(habit: Habit) {
    Alert.alert('Eliminar hábito', `¿Seguro que quieres eliminar "${habit.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => softDeleteHabit(habit.id) },
    ]);
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
          <HabitCard habit={item} onPress={() => router.push(`/habit/${item.id}`)} />
          <Pressable onLongPress={drag} style={styles.dragHandle}>
            <Ionicons name="reorder-three" size={22} color={colors.textMuted} />
          </Pressable>
        </View>
      </Swipeable>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DraggableFlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onDragEnd={({ data }) => reorderHabits(data.map((h) => h.id))}
        contentContainerStyle={styles.list}
      />
      <Pressable
        onPress={() => router.push('/habit/new')}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
    gap: spacing.sm,
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
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
