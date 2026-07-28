import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { use$ } from '@legendapp/state/react';
import { useToday } from '../../src/hooks/useToday';
import { useWeeklyProgress } from '../../src/hooks/useWeeklyProgress';
import { GreetingHeader } from '../../src/components/GreetingHeader';
import { TodayStatsRow } from '../../src/components/TodayStatsRow';
import { HabitTimeline } from '../../src/components/HabitTimeline';
import { CircularProgress } from '../../src/components/CircularProgress';
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
  const { totalActive, pending, completed, entries } = useToday();
  const weekly = useWeeklyProgress();
  const displayName = use$(settings$.profile.displayName);
  const colors = useThemeColors();

  const [activeHabitId, setActiveHabitId] = useState<string | null>(pending[0]?.habit.id ?? null);
  useEffect(() => {
    setActiveHabitId(pending[0]?.habit.id ?? null);
  }, [pending[0]?.habit.id]);

  if (totalActive === 0) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          logo
          title="No tienes hábitos para hoy"
          description="Agrega tu primer hábito para empezar a construir tu racha."
          actionLabel="Agregar Hábito"
          onAction={() => router.push('/habit/new')}
        />
        <Fab onPress={() => router.push('/habit/new')} gradient />
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

  const bestCurrentStreak = Math.max(0, ...entries.map((e) => e.currentStreak));
  const totalToday = pending.length + completed.length;
  const completedRatio = totalToday > 0 ? completed.length / totalToday : 0;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <GreetingHeader displayName={displayName} />
        <TodayStatsRow
          currentStreak={bestCurrentStreak}
          weeklyCompleted={weekly.completedCount}
          weeklyTotal={weekly.totalCount}
        />

        {pending.length === 0 ? (
          <View style={[styles.banner, { backgroundColor: colors.success }]}>
            <Text style={[typography.body, { color: colors.background, fontWeight: '600' }]}>
              ¡Listo por hoy!
            </Text>
          </View>
        ) : null}

        <HabitTimeline
          entries={entries}
          activeHabitId={activeHabitId}
          onSetActive={(habitId) => setActiveHabitId(habitId)}
          onToggleGeneric={(entry) => toggleGeneric(entry)}
          onToggleReminder={(entry, reminderId) => toggleReminder(entry, reminderId)}
          onPressDetail={(habitId) => router.push(`/habit/${habitId}`)}
        />
      </ScrollView>

      <Pressable
        onPress={() => router.push('/(tabs)/progress')}
        style={[styles.summaryPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <CircularProgress progress={completedRatio} size={28} strokeWidth={3} />
        <Text style={[typography.body, { color: colors.text, flex: 1, fontWeight: '600' }]}>
          {completed.length}/{totalToday} completados hoy
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>

      <Fab onPress={() => router.push('/habit/new')} gradient />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
    gap: spacing.lg,
  },
  banner: {
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: spacing.md,
    marginRight: 88,
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.full,
  },
});
