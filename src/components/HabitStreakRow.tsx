import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { weekOrder } from '../domain/scheduling';
import type { ProgressEntry } from '../hooks/useProgress';
import type { Weekday } from '../domain/types';

export interface HabitStreakRowProps {
  entry: ProgressEntry;
  weekStartsOn: Weekday;
}

const STREAK_COLOR = '#F97316';

export function HabitStreakRow({ entry, weekStartsOn }: HabitStreakRowProps) {
  const colors = useThemeColors();
  const { habit, currentStreak, history } = entry;
  const order = weekOrder(weekStartsOn);
  const week = history.days.slice(-7);

  return (
    <Pressable style={styles.row} onPress={() => router.push(`/habit/${habit.id}`)}>
      <View style={[styles.iconBadge, { backgroundColor: habit.color + '33' }]}>
        <Ionicons name={habit.icon as never} size={20} color={habit.color} />
      </View>
      <View style={styles.middle}>
        <Text style={[typography.body, { color: colors.text }]} numberOfLines={1}>
          {habit.name}
        </Text>
        <View style={styles.dotsRow}>
          {order.map((weekday) => {
            const day = week.find((d) => d.weekday === weekday);
            const filled = (day?.ratio ?? 0) > 0;
            const isFuture = day?.isFuture ?? false;
            return (
              <View
                key={weekday}
                style={[
                  styles.dot,
                  {
                    backgroundColor: filled ? habit.color : isFuture ? 'transparent' : colors.border,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
      <View style={styles.streak}>
        <Ionicons name="flame" size={16} color={STREAK_COLOR} />
        <View>
          <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]}>
            {currentStreak}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>días</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
    gap: spacing.xs,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
