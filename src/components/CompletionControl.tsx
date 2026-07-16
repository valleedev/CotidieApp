import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radii } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';

export interface CompletionControlProps {
  target: number;
  count: number;
  color: string;
  onTapEmpty: () => void;
  onTapFilled: () => void;
}

// Opción A — "slots visuales" (spec §3.5): las casillas se llenan en orden,
// la posición no tiene identidad propia; solo cuenta el número lleno/vacío.
export function CompletionControl({ target, count, color, onTapEmpty, onTapFilled }: CompletionControlProps) {
  const colors = useThemeColors();
  const boxes = Array.from({ length: target }, (_, i) => i < count);

  return (
    <View style={styles.row}>
      {boxes.map((filled, index) => (
        <Pressable
          key={index}
          onPress={filled ? onTapFilled : onTapEmpty}
          style={[
            styles.box,
            {
              backgroundColor: filled ? color : 'transparent',
              borderColor: filled ? color : colors.border,
            },
          ]}
        >
          {filled ? <Ionicons name="checkmark" size={16} color={colors.background} /> : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  box: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
