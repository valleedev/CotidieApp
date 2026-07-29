import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing, radii, typography } from '../theme/tokens';
import { duration } from '../theme/motion';

export interface EmptyStateProps {
  title: string;
  description?: string;
  logo?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, logo, actionLabel, onAction }: EmptyStateProps) {
  const colors = useThemeColors();

  return (
    <Animated.View entering={FadeIn.duration(duration.normal)} style={styles.outer}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {logo ? (
          <View style={[styles.illustration, { backgroundColor: colors.successBackground, borderColor: colors.successBorder }]}>
            <View style={[styles.illustrationCore, { backgroundColor: colors.flameMuted }]}>
              <Ionicons name="leaf-outline" size={30} color={colors.success} />
            </View>
            <Ionicons name="sparkles" size={15} color={colors.flame} style={styles.sparkleTop} />
            <Ionicons name="sparkles" size={11} color={colors.success} style={styles.sparkleBottom} />
          </View>
        ) : null}
        <Text style={[typography.title, { color: colors.text, textAlign: 'center' }]}>{title}</Text>
        {description ? (
          <Text style={[typography.caption, styles.description, { color: colors.textMuted }]}>
            {description}
          </Text>
        ) : null}
        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add" size={18} color={colors.background} />
            <Text style={[typography.body, { color: colors.background, fontWeight: '600' }]}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
  },
  card: {
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.md,
  },
  illustration: {
    width: 92,
    height: 92,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationCore: {
    width: 58,
    height: 58,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleTop: { position: 'absolute', right: 11, top: 13 },
  sparkleBottom: { position: 'absolute', bottom: 15, left: 12 },
  description: {
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },
});
