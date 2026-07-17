import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { spacing, shadow, gradients } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { spring } from '../theme/motion';

export interface FabProps {
  onPress: () => void;
  variant?: 'floating' | 'inline';
  gradient?: boolean;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Fab({ onPress, variant = 'floating', gradient = false, style }: FabProps) {
  const colors = useThemeColors();
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = () => {
    scale.value = withSpring(0.9, spring.snappy);
  };
  const onPressOut = () => {
    scale.value = withSpring(1, spring.snappy);
  };

  if (gradient) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.fab, variant === 'floating' ? styles.floating : null, shadow.fab, pressStyle, style]}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientFill}
        >
          <Ionicons name="add" size={28} color={colors.background} />
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        styles.fab,
        variant === 'floating' ? styles.floating : null,
        { backgroundColor: colors.primary },
        shadow.fab,
        pressStyle,
        style,
      ]}
    >
      <Ionicons name="add" size={28} color={colors.background} />
    </AnimatedPressable>
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
