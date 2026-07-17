import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { easing } from '../theme/motion';

export interface GreetingHeaderProps {
  displayName: string;
}

const WAVE_ANGLES = [0, 14, -8, 14, -4, 10, 0];
const WAVE_STEP_DURATION = 160;

export function GreetingHeader({ displayName }: GreetingHeaderProps) {
  const colors = useThemeColors();
  const name = displayName.trim();
  const greetingPrefix = name.length > 0 ? `¡Hola, ${name}! ` : '¡Hola! ';
  const rotation = useSharedValue(0);

  useEffect(() => {
    const steps = WAVE_ANGLES.slice(1).map((angle) =>
      withTiming(angle, { duration: WAVE_STEP_DURATION, easing: easing.standard }),
    );
    rotation.value = withRepeat(withSequence(...steps), 2, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <View style={styles.greetingLine}>
          <Text style={[typography.title, { color: colors.text }]}>{greetingPrefix}</Text>
          <Animated.Text style={[typography.title, { color: colors.text }, waveStyle]}>👋</Animated.Text>
        </View>
        <Text style={[typography.body, { color: colors.textMuted }]}>Un día más, un paso más.</Text>
      </View>
      <Pressable
        onPress={() => router.push('/settings')}
        style={[styles.avatar, { backgroundColor: colors.surfaceElevated, borderColor: colors.primary }]}
      >
        <Ionicons name="person-outline" size={22} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  greetingLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
