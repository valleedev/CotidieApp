import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { spacing, shadow, gradients } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';

export interface FabProps {
  onPress: () => void;
  variant?: 'floating' | 'inline';
  gradient?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Fab({ onPress, variant = 'floating', gradient = false, style }: FabProps) {
  const colors = useThemeColors();

  if (gradient) {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.fab, variant === 'floating' ? styles.floating : null, shadow.fab, style]}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientFill}
        >
          <Ionicons name="add" size={28} color={colors.background} />
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.fab,
        variant === 'floating' ? styles.floating : null,
        { backgroundColor: colors.primary },
        shadow.fab,
        style,
      ]}
    >
      <Ionicons name="add" size={28} color={colors.background} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradientFill: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floating: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
});
