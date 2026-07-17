import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing, radii, typography, gradients } from '../theme/tokens';

export interface AuthActionRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  subtitle?: string;
  showChevron?: boolean;
  variant?: 'surface' | 'gradient';
  onPress?: () => void;
}

export function AuthActionRow({
  icon,
  iconColor,
  label,
  subtitle,
  showChevron = true,
  variant = 'surface',
  onPress,
}: AuthActionRowProps) {
  const colors = useThemeColors();
  const isGradient = variant === 'gradient';
  const chevronColor = isGradient ? colors.text : colors.textMuted;

  const inner = (
    <View style={styles.inner}>
      <Ionicons name={icon} size={22} color={iconColor ?? colors.text} />
      <View style={styles.textGroup}>
        <Text style={[typography.body, styles.label, { color: colors.text }]}>{label}</Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: colors.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {showChevron ? <Ionicons name="chevron-forward" size={18} color={chevronColor} /> : null}
    </View>
  );

  if (isGradient) {
    return (
      <Pressable onPress={onPress} style={styles.shape}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientFill}
        >
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.shape,
        styles.surface,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
      ]}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shape: { borderRadius: radii.lg, overflow: 'hidden' },
  gradientFill: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  surface: { borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  textGroup: { flex: 1, gap: 2 },
  label: { fontWeight: '600' },
});
