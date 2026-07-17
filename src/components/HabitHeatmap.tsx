import { StyleSheet, View } from 'react-native';
import { spacing } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { weekOrder } from '../domain/scheduling';
import type { HabitHistory, HistoryDay } from '../domain/history';

export interface HabitHeatmapProps {
  history: HabitHistory;
  color: string;
}

// 3 escalones de intensidad para días con progreso parcial/total; 0 = sin relleno.
function cellOpacity(ratio: number): number {
  if (ratio < 1 / 3) return 0.35;
  if (ratio < 2 / 3) return 0.65;
  return 1;
}

function cellColor(
  day: HistoryDay,
  habitColor: string,
  colors: { border: string }
): { backgroundColor: string; opacity: number } {
  const renderable = day.scheduled && day.existed && !day.isFuture;
  if (!renderable) return { backgroundColor: 'transparent', opacity: 1 };
  if (day.ratio <= 0) return { backgroundColor: colors.border, opacity: 1 };
  return { backgroundColor: habitColor, opacity: cellOpacity(day.ratio) };
}

export function HabitHeatmap({ history, color }: HabitHeatmapProps) {
  const colors = useThemeColors();
  const order = weekOrder(history.weekStartsOn);
  const columns = Array.from({ length: history.weeks }, (_, w) => history.days.slice(w * 7, w * 7 + 7));

  return (
    <View style={styles.grid}>
      {columns.map((week, i) => (
        <View key={i} style={styles.column}>
          {order.map((weekday) => {
            const day = week.find((d) => d.weekday === weekday)!;
            return (
              <View
                key={day.date}
                style={[styles.cell, { borderColor: colors.border }, cellColor(day, color, colors)]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 3,
  },
  column: {
    gap: 3,
  },
  cell: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 1,
  },
});
