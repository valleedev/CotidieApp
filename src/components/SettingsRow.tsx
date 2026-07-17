import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing, radii, typography } from '../theme/tokens';
import { Pill, type PillProps } from './Pill';

export interface SettingsCardProps {
  children: ReactNode;
}

export function SettingsCard({ children }: SettingsCardProps) {
  const colors = useThemeColors();
  const rows = Children.toArray(children).filter(Boolean);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {rows.map((row, index) => (
        <Fragment key={index}>
          {row}
          {index < rows.length - 1 ? (
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          ) : null}
        </Fragment>
      ))}
    </View>
  );
}

export interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackgroundColor: string;
  title: string;
  titleColor?: string;
  subtitle?: string;
  trailingValue?: string;
  trailingMutedText?: string;
  pill?: PillProps;
  showChevron?: boolean;
  onPress?: () => void;
}

export function SettingsRow({
  icon,
  iconColor,
  iconBackgroundColor,
  title,
  titleColor,
  subtitle,
  trailingValue,
  trailingMutedText,
  pill,
  showChevron = true,
  onPress,
}: SettingsRowProps) {
  const colors = useThemeColors();

  const inner = (
    <View style={styles.row}>
      <View style={[styles.iconSquare, { backgroundColor: iconBackgroundColor }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.textGroup}>
        <Text style={[typography.body, styles.title, { color: titleColor ?? colors.text }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: colors.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {trailingValue ? (
        <Text style={[typography.body, styles.trailingValue, { color: colors.primary }]}>
          {trailingValue}
        </Text>
      ) : null}
      {trailingMutedText ? (
        <Text style={[typography.caption, { color: colors.textMuted }]}>{trailingMutedText}</Text>
      ) : null}
      {pill ? <Pill {...pill} /> : null}
      {showChevron ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </View>
  );

  if (!onPress) return inner;

  return <Pressable onPress={onPress}>{inner}</Pressable>;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.md + 40 + spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  iconSquare: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: '600',
  },
  trailingValue: {
    fontWeight: '600',
  },
});
