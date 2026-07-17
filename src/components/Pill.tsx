import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, typography } from '../theme/tokens';

export interface PillProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  backgroundColor: string;
}

export function Pill({ icon, label, color, backgroundColor }: PillProps) {
  return (
    <View style={[styles.pill, { backgroundColor }]}>
      {icon ? <Ionicons name={icon} size={14} color={color} /> : null}
      <Text style={[typography.caption, styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  label: {
    fontWeight: '600',
  },
});
