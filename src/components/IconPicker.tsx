import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, HABIT_ICONS } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';

export interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.grid}>
      {HABIT_ICONS.map((icon) => {
        const selected = icon === value;
        return (
          <Pressable
            key={icon}
            onPress={() => onChange(icon)}
            style={[
              styles.swatch,
              {
                backgroundColor: selected ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name={icon} size={20} color={selected ? colors.background : colors.text} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
