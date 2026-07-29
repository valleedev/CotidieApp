import { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useThemeColors } from '../theme/useThemeColors';

export interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0..1
  color?: string;
  trackColor?: string;
}

export function CircularProgress({
  size = 32,
  strokeWidth = 4,
  progress,
  color,
  trackColor,
}: CircularProgressProps) {
  const colors = useThemeColors();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const scale = useSharedValue(1);
  const center = size / 2;

  useEffect(() => {
    scale.value = withSequence(withTiming(1.08, { duration: 130 }), withTiming(1, { duration: 190 }));
  }, [clamped, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ height: size, width: size }, animatedStyle]}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor ?? colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color ?? colors.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          fill="none"
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
    </Animated.View>
  );
}
