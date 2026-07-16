import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToday, type TodayHabitEntry } from '../../src/hooks/useToday';
import { HabitCard } from '../../src/components/HabitCard';
import { CompletionControl } from '../../src/components/CompletionControl';
import { StreakBadge } from '../../src/components/StreakBadge';
import { EmptyState } from '../../src/components/EmptyState';
import { addCompletion, undoOneCompletion } from '../../src/state/completions$';
import { LOCAL_USER_ID } from '../../src/lib/localUser';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radii } from '../../src/theme/tokens';

function HabitRow({ entry }: { entry: TodayHabitEntry }) {
  const { habit, count, currentStreak } = entry;
  return (
    <View style={styles.row}>
      <HabitCard habit={habit} onPress={() => router.push(`/habit/${habit.id}`)} />
      <StreakBadge current={currentStreak} color={habit.color} />
      <CompletionControl
        target={habit.targetPerDay}
        count={count}
        color={habit.color}
        onTapEmpty={() => addCompletion(habit.id, LOCAL_USER_ID)}
        onTapFilled={() => undoOneCompletion(habit.id)}
      />
    </View>
  );
}

export default function TodayScreen() {
  const { totalActive, pending, completed } = useToday();
  const colors = useThemeColors();

  if (totalActive === 0) {
    return (
      <EmptyState
        title="Crea tu primer hábito"
        actionLabel="Crear hábito"
        onAction={() => router.push('/habit/new')}
      />
    );
  }

  if (pending.length === 0 && completed.length === 0) {
    return <EmptyState title="Hoy descansas" description="Nada programado." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        {pending.length === 0 ? (
          <View style={[styles.banner, { backgroundColor: colors.success }]}>
            <Text style={[typography.body, { color: colors.background, fontWeight: '600' }]}>
              ¡Listo por hoy!
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>Pendientes</Text>
            {pending.map((entry) => (
              <HabitRow key={entry.habit.id} entry={entry} />
            ))}
          </View>
        )}

        {completed.length > 0 ? (
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>Completados</Text>
            {completed.map((entry) => (
              <HabitRow key={entry.habit.id} entry={entry} />
            ))}
          </View>
        ) : null}
      </ScrollView>
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
  container: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  banner: {
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
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
