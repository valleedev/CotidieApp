import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { duration, easing } from '../theme/motion';
import { weekOrder } from '../domain/scheduling';
import { weekdayLetter } from '../lib/format';
import type { HabitHistory } from '../domain/history';
import type { Weekday } from '../domain/types';

export interface WeeklyBarChartProps {
  history: HabitHistory;
  weekStartsOn: Weekday;
  color: string;
}

const CHART_HEIGHT = 160;
const LEVELS = [100, 75, 50, 25, 0];

export function WeeklyBarChart({ history, weekStartsOn, color }: WeeklyBarChartProps) {
  const colors = useThemeColors();
  const order = weekOrder(weekStartsOn);
  const week = history.days.slice(-7);

  return (
    <View style={styles.container}>
      <View style={styles.axisLabels}>
        {LEVELS.map((level) => (
          <Text key={level} style={[typography.caption, { color: colors.textMuted }]}>
            {level}%
          </Text>
        ))}
      </View>
      <View style={styles.chartArea}>
        <View style={styles.gridLines}>
          {LEVELS.map((level) => (
            <View key={level} style={[styles.gridLine, { borderColor: colors.border }]} />
          ))}
        </View>
        <View style={styles.bars}>
          {order.map((weekday, index) => {
            const day = week.find((d) => d.weekday === weekday);
            const ratio = day?.ratio ?? 0;
            return (
              <View key={weekday} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <Bar ratio={Math.max(0, Math.min(1, ratio))} color={color} delay={index * 40} />
                </View>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {weekdayLetter(weekday)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function Bar({ ratio, color, delay }: { ratio: number; color: string; delay: number }) {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withDelay(
      delay,
      withTiming(ratio * 100, { duration: duration.normal, easing: easing.decelerate })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({ height: `${height.value}%` }));

  return <Animated.View style={[styles.bar, style, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  axisLabels: {
    height: CHART_HEIGHT,
    justifyContent: 'space-between',
  },
  chartArea: {
    flex: 1,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CHART_HEIGHT,
    justifyContent: 'space-between',
  },
  gridLine: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  bars: {
    height: CHART_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  barTrack: {
    flex: 1,
    width: 20,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
  },
});
