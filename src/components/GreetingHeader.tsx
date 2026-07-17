import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';

export interface GreetingHeaderProps {
  displayName: string;
}

export function GreetingHeader({ displayName }: GreetingHeaderProps) {
  const colors = useThemeColors();
  const name = displayName.trim();
  const greeting = name.length > 0 ? `¡Hola, ${name}! 👋` : '¡Hola! 👋';

  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text style={[typography.title, { color: colors.text }]}>{greeting}</Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>Un día más, un paso más.</Text>
      </View>
      <View style={[styles.avatar, { backgroundColor: colors.surfaceElevated, borderColor: colors.primary }]}>
        <Ionicons name="person-outline" size={22} color={colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
