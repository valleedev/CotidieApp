import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing, typography } from '../theme/tokens';
import { BottomSheet } from './BottomSheet';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectModalProps<T extends string> {
  visible: boolean;
  title: string;
  options: SelectOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

export function SelectModal<T extends string>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: SelectModalProps<T>) {
  const colors = useThemeColors();

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={[typography.eyebrow, styles.title, { color: colors.textMuted }]}>
        {title}
      </Text>
      {options.map((option) => {
        const selected = option.value === selectedValue;
        return (
          <Pressable
            key={option.value}
            style={styles.option}
            onPress={() => {
              onSelect(option.value);
              onClose();
            }}
          >
            <Text style={[typography.body, { color: colors.text }]}>{option.label}</Text>
            {selected ? (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            ) : null}
          </Pressable>
        );
      })}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
});
