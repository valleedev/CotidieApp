import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';
import { radii } from '../theme/tokens';

export interface AvatarProps {
  name: string;
  size?: number;
}

function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function Avatar({ name, size = 56 }: AvatarProps) {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: radii.full,
          backgroundColor: colors.primaryMuted,
          borderColor: colors.primary,
        },
      ]}
    >
      <Text style={[styles.initials, { color: colors.text, fontSize: size * 0.36 }]}>
        {initialsFor(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
  },
});
