import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing, radii, typography } from '../theme/tokens';

export interface AuthSubmitButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function AuthSubmitButton({ label, onPress, loading, disabled }: AuthSubmitButtonProps) {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;

  return (
    <Pressable onPress={onPress} disabled={isDisabled} style={styles.shape}>
      <LinearGradient
        colors={[colors.primary, colors.success]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.fill, { opacity: disabled && !loading ? 0.5 : 1 }]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={[typography.body, styles.label]}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shape: { borderRadius: radii.lg, overflow: 'hidden' },
  fill: { paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: '700', color: '#FFFFFF' },
});
