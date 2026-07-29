import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useThemeColors } from '../theme/useThemeColors';
import { duration, easing } from '../theme/motion';

export interface AnimatedSplashProps {
  visible: boolean;
  onExitComplete: () => void;
}

// Mismo tamaño/posición que el splash nativo (assets/splash-icon.png, imageWidth 200 en
// app.json) — el mark se dibuja estático desde el primer frame, sin animar entrada, para que
// el handoff nativo → custom sea invisible. Solo el glow y el texto entran animados.
const MARK_SIZE = 168;
const RING_D = 'M 232.6,89.6 A 168,168 0 1 1 91.7,221.1';
const FLAME_D =
  'M 256,150 C 232,182 200,222 200,270 C 200,314 224,344 258,344 C 292,344 316,316 316,278 C 316,246 298,220 276,192 C 282,214 280,230 270,230 C 260,230 256,218 262,200 C 266,186 262,166 256,150 Z';
const DOTS = [
  { cx: 96.7, cy: 196.7, r: 6 },
  { cx: 128.5, cy: 143.6, r: 9 },
  { cx: 188.5, cy: 100.0, r: 13 },
];
const IDLE_PULSE_DELAY = 900; // arranca después de que el texto ya asentó, para no "saltar" en el handoff

export function AnimatedSplash({ visible, onExitComplete }: AnimatedSplashProps) {
  const colors = useThemeColors();

  const overlayOpacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const markPulse = useSharedValue(1);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkTranslateY = useSharedValue(12);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(12);

  useEffect(() => {
    glowOpacity.value = withDelay(150, withTiming(0.5, { duration: duration.slow }));

    markPulse.value = withDelay(
      IDLE_PULSE_DELAY,
      withRepeat(
        withSequence(
          withTiming(1.03, { duration: duration.slow, easing: easing.standard }),
          withTiming(1, { duration: duration.slow, easing: easing.standard }),
        ),
        -1,
        true,
      ),
    );

    wordmarkOpacity.value = withDelay(200, withTiming(1, { duration: duration.slow, easing: easing.decelerate }));
    wordmarkTranslateY.value = withDelay(200, withTiming(0, { duration: duration.slow, easing: easing.decelerate }));

    taglineOpacity.value = withDelay(340, withTiming(1, { duration: duration.slow, easing: easing.decelerate }));
    taglineTranslateY.value = withDelay(340, withTiming(0, { duration: duration.slow, easing: easing.decelerate }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!visible) {
      overlayOpacity.value = withTiming(0, { duration: duration.slow, easing: easing.accelerate }, (finished) => {
        if (finished) runOnJS(onExitComplete)();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));
  const markStyle = useAnimatedStyle(() => ({ transform: [{ scale: markPulse.value }] }));
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkTranslateY.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.background, zIndex: 50 }, overlayStyle]}
    >
      <View style={styles.markAnchor}>
        <View style={styles.markBox}>
          <Animated.View style={[styles.glow, glowStyle]}>
            <Svg width={MARK_SIZE * 1.8} height={MARK_SIZE * 1.8} viewBox="0 0 100 100">
              <Defs>
                <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#F28B67" stopOpacity={0.35} />
                  <Stop offset="100%" stopColor="#F28B67" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Circle cx="50" cy="50" r="50" fill="url(#glow)" />
            </Svg>
          </Animated.View>

          <Animated.View style={markStyle}>
            <Svg width={MARK_SIZE} height={MARK_SIZE} viewBox="0 0 512 512">
              <Path d={RING_D} fill="none" stroke="#F28B67" strokeWidth={26} strokeLinecap="round" />
              {DOTS.map((dot, i) => (
                <Circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill="#7CA58A" />
              ))}
              <Path d={FLAME_D} fill="#F28B67" />
            </Svg>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.wordmark, { color: colors.text }, wordmarkStyle]}>Cotidie</Animated.Text>
        <Animated.Text style={[styles.tagline, { color: colors.textMuted }, taglineStyle]}>
          A diario, mejor tú.
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Centra el mark en el centro exacto de pantalla (igual que el splash nativo) — el
  // texto cuelga debajo sin recentrar el bloque completo, así el icono no "salta" de posición.
  markAnchor: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ translateY: -MARK_SIZE / 2 }],
  },
  markBox: {
    width: MARK_SIZE,
    height: MARK_SIZE,
  },
  glow: {
    position: 'absolute',
    top: -MARK_SIZE * 0.4,
    left: -MARK_SIZE * 0.4,
  },
  wordmark: {
    marginTop: 20,
    fontSize: 34,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  tagline: {
    marginTop: 4,
    fontSize: 15,
  },
});
