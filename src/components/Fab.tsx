import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, shadow } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';

export interface FabProps {
  onPress: () => void;
  variant?: 'floating' | 'inline';
  style?: StyleProp<ViewStyle>;
}

export function Fab({ onPress, variant = 'floating', style }: FabProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.fab,
        variant === 'floating' ? styles.floating : null,
        { backgroundColor: colors.primary },
        shadow.fab,
        style,
      ]}
    >
      <Ionicons name="add" size={28} color={colors.background} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floating: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
});
