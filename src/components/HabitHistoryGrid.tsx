import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { duration } from '../theme/motion';
import { weekOrder } from '../domain/scheduling';
import { weekdayLetter } from '../lib/format';
import type { HabitHistory, HistoryDay } from '../domain/history';
import type { Weekday } from '../domain/types';

export interface HabitHistoryGridProps {
  history: HabitHistory;
  weekStartsOn: Weekday;
}

const ROW_LABELS = ['Esta semana', 'Semana 2', 'Semana 3'];

export function HabitHistoryGrid({ history, weekStartsOn }: HabitHistoryGridProps) {
  const colors = useThemeColors();
  const columns = weekOrder(weekStartsOn);

  // history.days es cronológico (más antiguo→más reciente); invertimos las filas
  // para que "Esta semana" quede arriba, sin tocar el orden de días dentro de cada fila.
  const rows: HistoryDay[][] = [
    history.days.slice(14, 21),
    history.days.slice(7, 14),
    history.days.slice(0, 7),
  ];

  function cellColor(day: HistoryDay): string {
    if (day.ratio >= 1) return colors.success;
    if (day.ratio > 0) return colors.historyPartial;
    return colors.historyEmpty;
  }

  return (
    <View>
      <View style={styles.legendRow}>
        <LegendItem color={colors.success} label="Completo" />
        <LegendItem color={colors.historyPartial} label="Parcial" />
        <LegendItem color={colors.historyEmpty} label="Sin hacer" />
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.rowLabel} />
          {columns.map((weekday) => (
            <Text key={weekday} style={[typography.caption, styles.cell, { color: colors.textMuted }]}>
              {weekdayLetter(weekday)}
            </Text>
          ))}
        </View>
        {rows.map((week, i) => (
          <View key={ROW_LABELS[i]} style={styles.row}>
            <Text
              style={[typography.caption, styles.rowLabel, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {ROW_LABELS[i]}
            </Text>
            {week.map((day, j) => (
              <View key={day.date} style={styles.cell}>
                <Animated.View
                  entering={FadeIn.delay((i * 7 + j) * 15).duration(duration.normal)}
                  style={[
                    styles.dayCell,
                    { backgroundColor: cellColor(day), opacity: day.isFuture ? 0.4 : 1 },
                  ]}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: radii.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowLabel: {
    width: 84,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCell: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.sm,
  },
});
