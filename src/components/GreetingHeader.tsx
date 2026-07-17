import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { easing } from '../theme/motion';

export interface GreetingHeaderProps {
  displayName: string;
}

const WAVE_ANGLES = [0, 14, -8, 14, -4, 10, 0];
const WAVE_STEP_DURATION = 160;
const WAVE_PAUSE_DURATION = 2500;

export function GreetingHeader({ displayName }: GreetingHeaderProps) {
  const colors = useThemeColors();
  const name = displayName.trim();
  const greetingPrefix = name.length > 0 ? `¡Hola, ${name}! ` : '¡Hola! ';
  const rotation = useSharedValue(0);

  useEffect(() => {
    const steps = WAVE_ANGLES.slice(1).map((angle) =>
      withTiming(angle, { duration: WAVE_STEP_DURATION, easing: easing.standard }),
    );
    steps.push(withTiming(0, { duration: WAVE_PAUSE_DURATION }));
    rotation.value = withRepeat(withSequence(...steps), -1, false);
  }, []);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.texts}>
      <View style={styles.greetingLine}>
        <Text style={[typography.title, { color: colors.text }]}>{greetingPrefix}</Text>
        <Animated.Text style={[typography.title, { color: colors.text }, waveStyle]}>👋</Animated.Text>
      </View>
      <Text style={[typography.body, { color: colors.textMuted }]}>Un día más, un paso más.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  texts: {
    gap: 2,
  },
  greetingLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
