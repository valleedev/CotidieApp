import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';

export interface HabitDetailBannerProps {
  onPressStats: () => void;
}

export function HabitDetailBanner({ onPressStats }: HabitDetailBannerProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.successBackground, borderColor: colors.successBorder },
      ]}
    >
      <View style={[styles.iconBadge, { backgroundColor: colors.successPill }]}>
        <Ionicons name="locate" size={20} color={colors.success} />
      </View>
      <View style={styles.texts}>
        <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
          ¡Vas por buen camino!
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          La constancia crea resultados.
        </Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.successBorder }]} />
      <Pressable onPress={onPressStats} hitSlop={8} style={styles.linkButton}>
        <Text style={[typography.caption, { color: colors.success, fontWeight: '600' }]}>
          Ver estadísticas
        </Text>
        <Ionicons name="chevron-forward" size={14} color={colors.success} />
      </Pressable>
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
    gap: spacing.sm,
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
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: spacing.xs,
  },
});
