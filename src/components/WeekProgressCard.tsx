import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { weekOrder } from '../domain/scheduling';
import { weekdayLetter } from '../lib/format';
import { ProgressBar } from './ProgressBar';
import type { WeeklyProgress } from '../domain/weeklyProgress';
import type { Weekday } from '../domain/types';

export interface WeekProgressCardProps {
  weekly: WeeklyProgress;
  weekStartsOn: Weekday;
  now?: Date;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function WeekProgressCard({ weekly, weekStartsOn, now = new Date() }: WeekProgressCardProps) {
  const colors = useThemeColors();
  const dateLabel = capitalize(format(now, "EEEE, d 'de' MMMM", { locale: es }));
  const ratio = weekly.totalCount > 0 ? weekly.completedCount / weekly.totalCount : 0;
  const order = weekOrder(weekStartsOn);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.left}>
        <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>{dateLabel}</Text>
        <View style={styles.dotsRow}>
          {order.map((weekday) => {
            const day = weekly.days.find((d) => d.weekday === weekday)!;
            return (
              <View key={weekday} style={styles.dotColumn}>
                <View
                  style={[
                    styles.dotOuter,
                    day.isToday
                      ? { borderWidth: 2, borderColor: colors.success }
                      : { borderWidth: 0 },
                  ]}
                >
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    {weekdayLetter(weekday)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: day.isFullyCompleted
                        ? colors.success
                        : day.isFuture
                          ? 'transparent'
                          : colors.border,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Progreso semanal</Text>
        <Text style={[typography.title, { color: colors.text }]}>
          {weekly.completedCount} / {weekly.totalCount}
        </Text>
        <ProgressBar value={ratio} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  left: {
    flex: 1,
    gap: spacing.sm,
  },
  right: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dotColumn: {
    alignItems: 'center',
    gap: 4,
  },
  dotOuter: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
  },
});
