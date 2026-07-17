import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { spacing, radii, HABIT_ICONS } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { duration, easing } from '../theme/motion';

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
          <IconSwatch
            key={icon}
            icon={icon}
            selected={selected}
            onPress={() => onChange(icon)}
            surfaceColor={colors.surface}
            selectedColor={colors.primary}
            borderColor={colors.border}
            iconColor={colors.text}
            selectedIconColor={colors.background}
          />
        );
      })}
    </View>
  );
}

interface IconSwatchProps {
  icon: (typeof HABIT_ICONS)[number];
  selected: boolean;
  onPress: () => void;
  surfaceColor: string;
  selectedColor: string;
  borderColor: string;
  iconColor: string;
  selectedIconColor: string;
}

function IconSwatch({
  icon,
  selected,
  onPress,
  surfaceColor,
  selectedColor,
  borderColor,
  iconColor,
  selectedIconColor,
}: IconSwatchProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: duration.fast, easing: easing.standard });
  }, [selected, progress]);

  const swatchStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [surfaceColor, selectedColor]),
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.swatch, { borderColor }, swatchStyle]}>
        <Ionicons name={icon} size={20} color={selected ? selectedIconColor : iconColor} />
      </Animated.View>
    </Pressable>
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
