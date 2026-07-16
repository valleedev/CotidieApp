import { addDays, startOfWeek } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { toLocalDateString } from '../lib/dates';
import type { ISODate } from '../domain/types';

export interface MiniCalendarProps {
  completedDates: Set<ISODate>;
  color: string;
  weeks?: number;
  weekStartsOn?: 0 | 1;
}

const LABELS_MONDAY_FIRST = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const LABELS_SUNDAY_FIRST = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

// Grid binario de días hechos/no hechos — sin gradiente de intensidad,
// eso queda para las gráficas de Fase 5.
export function MiniCalendar({ completedDates, color, weeks = 5, weekStartsOn = 1 }: MiniCalendarProps) {
  const colors = useThemeColors();
  const now = new Date();
  const gridStart = startOfWeek(addDays(now, -(weeks - 1) * 7), { weekStartsOn });
  const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i));
  const rows = Array.from({ length: weeks }, (_, i) => days.slice(i * 7, i * 7 + 7));
  const labels = weekStartsOn === 1 ? LABELS_MONDAY_FIRST : LABELS_SUNDAY_FIRST;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {labels.map((label, i) => (
          <Text key={`${label}-${i}`} style={[typography.caption, styles.cell, { color: colors.textMuted }]}>
            {label}
          </Text>
        ))}
      </View>
      {rows.map((week, i) => (
        <View key={i} style={styles.row}>
          {week.map((day) => {
            const dateStr = toLocalDateString(day);
            const done = completedDates.has(dateStr);
            const future = day > now;
            return (
              <View key={dateStr} style={styles.cell}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: done ? color : 'transparent',
                      borderColor: colors.border,
                      opacity: future ? 0.3 : 1,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: radii.full,
    borderWidth: 1,
  },
});
