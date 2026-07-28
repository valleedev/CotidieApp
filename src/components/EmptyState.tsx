import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing, radii, typography } from '../theme/tokens';
import { duration } from '../theme/motion';
import { BrandMark } from './BrandMark';

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
        {logo ? <BrandMark size={64} iconSize={28} /> : null}
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
