import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { consistencyLabel } from '../domain/streaks';
import { ProgressBar } from './ProgressBar';

export interface ConsistencySummaryCardProps {
  ratio: number | null;
}

export function ConsistencySummaryCard({ ratio }: ConsistencySummaryCardProps) {
  const colors = useThemeColors();
  const value = ratio ?? 0;
  const percent = Math.round(value * 100);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.successBackground, borderColor: colors.successBorder },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.iconBadge, { backgroundColor: colors.successPill }]}>
          <Ionicons name="flame" size={22} color={colors.success} />
        </View>
        <View style={styles.texts}>
          <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
            Constancia · 30 días
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            ¡Sigue así! vas por buen camino.
          </Text>
        </View>
        <View style={styles.percentBlock}>
          <Text style={[typography.hero, { color: colors.success, lineHeight: undefined }]}>
            {percent}%
          </Text>
          {ratio !== null ? (
            <View style={[styles.pill, { backgroundColor: colors.successPill }]}>
              <Ionicons name="star" size={12} color={colors.success} />
              <Text style={[typography.caption, { color: colors.success, fontWeight: '600' }]}>
                {consistencyLabel(ratio)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <ProgressBar value={value} color={colors.success} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  percentBlock: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
});
