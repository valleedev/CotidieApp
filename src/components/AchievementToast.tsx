import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { use$ } from '@legendapp/state/react';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { celebration$ } from '../state/celebration$';
import { useThemeColors } from '../theme/useThemeColors';
import { radii, shadow, spacing } from '../theme/tokens';
import { duration, spring } from '../theme/motion';

const AUTO_DISMISS_MS = 1800;
const HIDDEN_OFFSET = -60;

export function AchievementToast() {
  const event = use$(celebration$);
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState('');
  const translateY = useSharedValue(HIDDEN_OFFSET);
  const opacity = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!event) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    setMessage(event.message);
    setMounted(true);
    translateY.value = withSpring(0, spring.bouncy);
    opacity.value = withTiming(1, { duration: duration.fast });

    timerRef.current = setTimeout(() => {
      opacity.value = withTiming(0, { duration: duration.normal });
      translateY.value = withTiming(HIDDEN_OFFSET, { duration: duration.normal }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!mounted) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        animatedStyle,
        {
          position: 'absolute',
          top: insets.top + spacing.sm,
          left: spacing.md,
          right: spacing.md,
          alignItems: 'center',
          zIndex: 50,
        },
      ]}
    >
      <View
        style={[
          shadow.card,
          {
            backgroundColor: colors.successBackground,
            borderColor: colors.successBorder,
            borderWidth: 1,
            borderRadius: radii.lg,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        <Text style={{ color: colors.success, fontSize: 15, fontWeight: '700' }}>{message}</Text>
      </View>
    </Animated.View>
  );
}
