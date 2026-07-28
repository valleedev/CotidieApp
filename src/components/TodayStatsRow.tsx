import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { ProgressBar } from './ProgressBar';

export interface TodayStatsRowProps {
  currentStreak: number;
  weeklyCompleted: number;
  weeklyTotal: number;
}

export function TodayStatsRow({ currentStreak, weeklyCompleted, weeklyTotal }: TodayStatsRowProps) {
  const colors = useThemeColors();
  const ratio = weeklyTotal > 0 ? weeklyCompleted / weeklyTotal : 0;

  return (
    <View style={styles.row}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.streakHeader}>
          <Ionicons name="flame" size={16} color={colors.flame} />
          <Text style={[typography.caption, { color: colors.textMuted }]}>Racha</Text>
        </View>
        <Text style={[typography.title, { color: colors.text }]}>{currentStreak} días</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Progreso semanal</Text>
        <Text style={[typography.title, { color: colors.text }]}>
          {weeklyCompleted}/{weeklyTotal}
        </Text>
        <ProgressBar value={ratio} gradient />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
