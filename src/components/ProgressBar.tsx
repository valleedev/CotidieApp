import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { radii } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { duration, easing } from '../theme/motion';

export interface ProgressBarProps {
  value: number; // 0..1
  color?: string;
  gradient?: boolean;
}

export function ProgressBar({ value, color, gradient = false }: ProgressBarProps) {
  const colors = useThemeColors();
  const clamped = Math.max(0, Math.min(1, value));

  const progress = useSharedValue(clamped);
  useEffect(() => {
    progress.value = withTiming(clamped, { duration: duration.normal, easing: easing.decelerate });
  }, [clamped, progress]);

  const widthStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceElevated }]}>
      {gradient ? (
        <Animated.View style={[styles.fill, styles.fillClip, widthStyle]}>
          <LinearGradient
            colors={[colors.primary, colors.success]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientFill}
          />
        </Animated.View>
      ) : (
        <Animated.View style={[styles.fill, widthStyle, { backgroundColor: color ?? colors.success }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.full,
  },
  fillClip: {
    overflow: 'hidden',
  },
  gradientFill: {
    width: '100%',
    height: '100%',
  },
});
