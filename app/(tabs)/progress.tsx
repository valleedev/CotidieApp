import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { use$ } from '@legendapp/state/react';
import { useProgress } from '../../src/hooks/useProgress';
import { settings$ } from '../../src/state/settings$';
import { ConsistencySummaryCard } from '../../src/components/ConsistencySummaryCard';
import { WeeklyBarChart } from '../../src/components/WeeklyBarChart';
import { HabitStreakRow } from '../../src/components/HabitStreakRow';
import { EmptyState } from '../../src/components/EmptyState';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, radii, typography } from '../../src/theme/tokens';
import { overallConsistency } from '../../src/domain/streaks';

const COLLAPSED_COUNT = 3;

export default function Progress() {
  const entries = useProgress();
  const weekStartsOn = use$(settings$.profile.weekStartsOn);
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(false);

  if (entries.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          title="Aún no tienes hábitos"
          actionLabel="Crear hábito"
          onAction={() => router.push('/habit/new')}
        />
      </SafeAreaView>
    );
  }

  const overall = overallConsistency(entries);
  const bestEntry = entries.reduce((best, e) => (e.currentStreak > best.currentStreak ? e : best));
  const byStreak = [...entries].sort((a, b) => b.currentStreak - a.currentStreak);
  const visible = expanded ? byStreak : byStreak.slice(0, COLLAPSED_COUNT);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.hero, { color: colors.text }]}>Progreso</Text>
          <Text style={[typography.body, { color: colors.textMuted }]}>
            Tu constancia te acerca a tu mejor versión.
          </Text>
        </View>

        <ConsistencySummaryCard ratio={overall} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="bar-chart" size={18} color={colors.primary} />
            </View>
            <Text style={[typography.body, { color: colors.text, fontWeight: '600', flex: 1 }]}>
              Constancia semanal · {bestEntry.habit.name}
            </Text>
            <View style={[styles.periodPill, { backgroundColor: colors.surfaceElevated }]}>
              <Text style={[typography.caption, { color: colors.text }]}>Esta semana</Text>
              <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
            </View>
          </View>
          <WeeklyBarChart history={bestEntry.history} weekStartsOn={weekStartsOn} color={colors.success} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="flag" size={18} color={colors.primary} />
            </View>
            <Text style={[typography.body, { color: colors.text, fontWeight: '600', flex: 1 }]}>
              Rachas por hábito
            </Text>
            {byStreak.length > COLLAPSED_COUNT ? (
              <Pressable style={styles.verTodos} onPress={() => setExpanded((v) => !v)}>
                <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>
                  {expanded ? 'Ver menos' : 'Ver todos'}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </Pressable>
            ) : null}
          </View>
          <View style={[styles.listCard, { backgroundColor: colors.surface }]}>
            {visible.map((entry, i) => (
              <View key={entry.habit.id}>
                <HabitStreakRow entry={entry} weekStartsOn={weekStartsOn} />
                {i < visible.length - 1 ? (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                ) : null}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  header: {
    gap: 2,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  verTodos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  listCard: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
