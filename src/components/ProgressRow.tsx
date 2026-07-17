import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { HabitHeatmap } from './HabitHeatmap';
import type { ProgressEntry } from '../hooks/useProgress';

export interface ProgressRowProps {
  entry: ProgressEntry;
}

function formatConsistency(value: number | null): string {
  return value === null ? '—' : `${Math.round(value * 100)}%`;
}

export function ProgressRow({ entry }: ProgressRowProps) {
  const colors = useThemeColors();
  const { habit, currentStreak, bestStreak, consistency30d, history } = entry;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: habit.color }]}>
          <Ionicons name={habit.icon as never} size={20} color="#FFFFFF" />
        </View>
        <Text style={[typography.body, { color: colors.text, flex: 1 }]} numberOfLines={1}>
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
        <View style={styles.stat}>
          <Text style={[typography.title, { color: colors.text }]}>{formatConsistency(consistency30d)}</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>Constancia 30d</Text>
        </View>
      </View>
      <HabitHeatmap history={history} color={habit.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  header: {
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
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
});
