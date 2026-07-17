import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { use$ } from '@legendapp/state/react';
import { useToday } from '../../src/hooks/useToday';
import { useWeeklyProgress } from '../../src/hooks/useWeeklyProgress';
import { GreetingHeader } from '../../src/components/GreetingHeader';
import { WeekProgressCard } from '../../src/components/WeekProgressCard';
import { HabitTodayCard } from '../../src/components/HabitTodayCard';
import { EmptyState } from '../../src/components/EmptyState';
import { Fab } from '../../src/components/Fab';
import { addCompletion, undoOneCompletion } from '../../src/state/completions$';
import { settings$ } from '../../src/state/settings$';
import { isDone } from '../../src/domain/completion';
import { currentUserId } from '../../src/state/session$';
import { todayLocalDateString } from '../../src/lib/dates';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography, radii } from '../../src/theme/tokens';
import type { TodayHabitEntry } from '../../src/hooks/useToday';

function toggleGeneric(entry: TodayHabitEntry) {
  if (isDone(entry.count, entry.target)) {
    undoOneCompletion(entry.habit.id);
  } else {
    addCompletion(entry.habit.id, currentUserId()!);
  }
}

function toggleReminder(entry: TodayHabitEntry, reminderId: string) {
  const today = todayLocalDateString();
  const status = entry.reminders.find((r) => r.reminder.id === reminderId);
  if (status?.done) {
    undoOneCompletion(entry.habit.id, today, reminderId);
  } else {
    addCompletion(entry.habit.id, currentUserId()!, today, reminderId);
  }
}

export default function TodayScreen() {
  const { totalActive, pending, completed } = useToday();
  const weekly = useWeeklyProgress();
  const weekStartsOn = use$(settings$.profile.weekStartsOn);
  const displayName = use$(settings$.profile.displayName);
  const colors = useThemeColors();

  if (totalActive === 0) {
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

  if (pending.length === 0 && completed.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState title="Hoy descansas" description="Nada programado." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <GreetingHeader displayName={displayName} />
        <WeekProgressCard weekly={weekly} weekStartsOn={weekStartsOn} />

        {pending.length === 0 ? (
          <View style={[styles.banner, { backgroundColor: colors.success }]}>
            <Text style={[typography.body, { color: colors.background, fontWeight: '600' }]}>
              ¡Listo por hoy!
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBadge, { backgroundColor: colors.surfaceElevated }]}>
                <Ionicons name="clipboard-outline" size={16} color={colors.primary} />
              </View>
              <Text style={[typography.body, { color: colors.text, fontWeight: '600', flex: 1 }]}>
                Pendientes
              </Text>
              <View style={[styles.countBadge, { backgroundColor: colors.surfaceElevated }]}>
                <Text style={[typography.caption, { color: colors.text }]}>{pending.length}</Text>
              </View>
            </View>
            {pending.map((entry) => (
              <HabitTodayCard
                key={entry.habit.id}
                entry={entry}
                onPress={() => router.push(`/habit/${entry.habit.id}`)}
                onToggleGeneric={() => toggleGeneric(entry)}
                onToggleReminder={(reminderId) => toggleReminder(entry, reminderId)}
              />
            ))}
          </View>
        )}

        {completed.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBadge, { backgroundColor: colors.successBackground }]}>
                <Ionicons name="checkmark" size={16} color={colors.success} />
              </View>
              <Text style={[typography.body, { color: colors.text, fontWeight: '600', flex: 1 }]}>
                Completados
              </Text>
              <View style={[styles.countBadge, { backgroundColor: colors.surfaceElevated }]}>
                <Text style={[typography.caption, { color: colors.text }]}>{completed.length}</Text>
              </View>
            </View>
            {completed.map((entry) => (
              <HabitTodayCard
                key={entry.habit.id}
                entry={entry}
                onPress={() => router.push(`/habit/${entry.habit.id}`)}
                onToggleGeneric={() => toggleGeneric(entry)}
                onToggleReminder={(reminderId) => toggleReminder(entry, reminderId)}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
      <Fab onPress={() => router.push('/habit/new')} gradient />
    </SafeAreaView>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  countBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  sectionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
});
