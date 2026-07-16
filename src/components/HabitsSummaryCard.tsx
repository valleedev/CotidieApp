import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';

export interface HabitsSummaryCardProps {
  currentStreak: number;
}

export function HabitsSummaryCard({ currentStreak }: HabitsSummaryCardProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.iconBadge, { backgroundColor: colors.primaryMuted }]}>
        <Ionicons name="star" size={20} color={colors.primary} />
      </View>
      <View style={styles.texts}>
        <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>¡Sigue así!</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          La consistencia es la clave del éxito.
        </Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.streak}>
        <Text style={[typography.title, { color: colors.primary }]}>{currentStreak} días</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>racha actual</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
  },
  streak: {
    alignItems: 'center',
    gap: 2,
  },
});
