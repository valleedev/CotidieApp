import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
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
  const offset = circumference * (1 - clamped);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
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
          strokeDashoffset={offset}
          fill="none"
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
    </View>
  );
}
