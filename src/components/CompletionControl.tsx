import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  ZoomIn,
  ZoomOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { spacing, radii } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { duration, easing, spring } from '../theme/motion';

export interface CompletionControlProps {
  target: number;
  count: number;
  color: string;
  onTapEmpty: () => void;
  onTapFilled: () => void;
}

// Opción A — "slots visuales" (spec §3.5): las casillas se llenan en orden,
// la posición no tiene identidad propia; solo cuenta el número lleno/vacío.
export function CompletionControl({ target, count, color, onTapEmpty, onTapFilled }: CompletionControlProps) {
  const colors = useThemeColors();
  const boxes = Array.from({ length: target }, (_, i) => i < count);

  return (
    <View style={styles.row}>
      {boxes.map((filled, index) => (
        <CompletionBox
          key={index}
          filled={filled}
          color={color}
          borderColor={colors.border}
          checkColor={colors.background}
          onPress={filled ? onTapFilled : onTapEmpty}
        />
      ))}
    </View>
  );
}

interface CompletionBoxProps {
  filled: boolean;
  color: string;
  borderColor: string;
  checkColor: string;
  onPress: () => void;
}

function CompletionBox({ filled, color, borderColor, checkColor, onPress }: CompletionBoxProps) {
  const fill = useSharedValue(filled ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    fill.value = withTiming(filled ? 1 : 0, { duration: duration.fast, easing: easing.standard });
  }, [filled, fill]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(fill.value, [0, 1], ['transparent', color]),
    borderColor: interpolateColor(fill.value, [0, 1], [borderColor, color]),
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(withTiming(0.85, { duration: duration.fast }), withSpring(1, spring.snappy));
    onPress();
  };

  return (
    <Pressable onPress={handlePress} hitSlop={4}>
      <Animated.View style={[styles.box, boxStyle]}>
        {filled ? (
          <Animated.View entering={ZoomIn.springify()} exiting={ZoomOut}>
            <Ionicons name="checkmark" size={16} color={checkColor} />
          </Animated.View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  box: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
