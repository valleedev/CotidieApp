import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing, radii, typography } from '../theme/tokens';
import type { Weekday } from '../domain/types';

export interface WeekdayPickerProps {
  value: Weekday[];
  onChange: (days: Weekday[]) => void;
}

const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
const LABELS: Record<Weekday, string> = { 0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };

export function WeekdayPicker({ value, onChange }: WeekdayPickerProps) {
  const colors = useThemeColors();
  const isDaily = value.length === 7;

  function toggleDay(day: Weekday) {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day));
    } else {
      onChange([...value, day].sort((a, b) => a - b));
    }
  }

  function toggleDaily() {
    onChange(isDaily ? [] : ALL_DAYS);
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {ALL_DAYS.map((day) => {
          const selected = value.includes(day);
          return (
            <Pressable
              key={day}
              onPress={() => toggleDay(day)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[typography.caption, { color: selected ? colors.background : colors.text }]}>
                {LABELS[day]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable onPress={toggleDaily} style={styles.dailyShortcut}>
        <Text style={[typography.caption, { color: colors.primary }]}>
          {isDaily ? 'Quitar diario' : 'Diario'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyShortcut: {
    alignSelf: 'flex-start',
  },
});
