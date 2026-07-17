import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing, radii, typography } from '../theme/tokens';
import { weekOrder } from '../domain/scheduling';
import type { Weekday } from '../domain/types';

export interface WeekdayPickerProps {
  value: Weekday[];
  onChange: (days: Weekday[]) => void;
  showSummary?: boolean;
}

const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
const DISPLAY_ORDER: Weekday[] = weekOrder(1); // Lunes primero, solo para render
const LABELS: Record<Weekday, string> = { 0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };

export function WeekdayPicker({ value, onChange, showSummary = false }: WeekdayPickerProps) {
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

  const summaryText = isDaily ? 'Todos los días' : `${value.length} día${value.length === 1 ? '' : 's'}`;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {DISPLAY_ORDER.map((day) => {
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
      {showSummary ? (
        <View style={styles.summaryRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={[typography.caption, { color: colors.textMuted }]}>{summaryText}</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}> · </Text>
          <Pressable onPress={toggleDaily}>
            <Text style={[typography.caption, { color: colors.primary }]}>
              {isDaily ? 'Quitar diario' : 'Diario'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={toggleDaily} style={styles.dailyShortcut}>
          <Text style={[typography.caption, { color: colors.primary }]}>
            {isDaily ? 'Quitar diario' : 'Diario'}
          </Text>
        </Pressable>
      )}
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
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
