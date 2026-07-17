import { useEffect } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitFormHeaderLeft, HabitFormHeaderRight } from '../../src/components/HabitFormHeader';
import { StatCard } from '../../src/components/StatCard';
import { HabitHistoryGrid } from '../../src/components/HabitHistoryGrid';
import { HabitDetailBanner } from '../../src/components/HabitDetailBanner';
import { useHabitDetail } from '../../src/hooks/useHabitDetail';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, radii, typography } from '../../src/theme/tokens';

function targetLabel(target: number): string {
  return target === 1 ? '1 vez al día' : `${target} veces al día`;
}

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

  const { habit, currentStreak, bestStreak, history, weekStartsOn, reminderTimesLabel, daysSummary, targetPerDay } =
    detail;

  const scheduleParts = [daysSummary, reminderTimesLabel || null, targetLabel(targetPerDay)].filter(
    (part): part is string => !!part
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: 'Detalle',
          headerLeft: () => <HabitFormHeaderLeft icon="chevron-back" onPress={() => router.back()} />,
          headerRight: () => (
            <HabitFormHeaderRight
              label="Editar"
              disabled={false}
              onPress={() => router.push(`/habit/${id}/edit`)}
            />
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: habit.color }]}>
            <Ionicons name={habit.icon as never} size={32} color="#FFFFFF" />
          </View>
          <Text style={[typography.title, { color: colors.text }]} numberOfLines={1}>
            {habit.name}
          </Text>
          <View style={styles.scheduleRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.flame} />
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {scheduleParts.join(' · ')}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon="flame"
            iconColor={colors.flame}
            iconBg={colors.flameMuted}
            value={currentStreak}
            label="Racha actual"
            subtitle="¡Sigue así!"
          />
          <StatCard
            icon="star"
            iconColor={colors.gold}
            iconBg={colors.goldMuted}
            value={bestStreak}
            label="Mejor racha"
            subtitle="Tu récord"
          />
        </View>

        <View style={styles.section}>
          <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>Últimas 3 semanas</Text>
          <HabitHistoryGrid history={history} weekStartsOn={weekStartsOn} />
        </View>

        <HabitDetailBanner onPressStats={() => router.dismissTo('/progress')} />

        <Pressable
          style={[styles.reminderRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push(`/habit/${id}/edit`)}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.success} />
          <Text style={[typography.body, { color: colors.text, flex: 1 }]}>Recordatorios</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {reminderTimesLabel || 'Sin recordatorios'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
});
