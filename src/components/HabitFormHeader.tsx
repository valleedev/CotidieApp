import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';

export function HabitFormHeaderLeft({ onPress }: { onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.leftButton}>
      <Ionicons name="close" size={22} color={colors.text} />
    </Pressable>
  );
}

export function HabitFormHeaderTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.titleBlock}>
      <Text style={[typography.eyebrow, { color: colors.textMuted }]}>{eyebrow}</Text>
      <Text style={[typography.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

export function HabitFormHeaderRight({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={8} style={styles.rightButton}>
      <Text style={[typography.body, { color: disabled ? colors.textMuted : colors.primary, fontWeight: '600' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  leftButton: {
    paddingHorizontal: spacing.xs,
  },
  titleBlock: {
    alignItems: 'center',
  },
  rightButton: {
    paddingHorizontal: spacing.xs,
  },
});
