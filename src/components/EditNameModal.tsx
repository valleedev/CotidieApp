import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing, radii, typography } from '../theme/tokens';
import { BottomSheet } from './BottomSheet';

export interface EditNameModalProps {
  visible: boolean;
  initialValue: string;
  onSave: (value: string) => void;
  onClose: () => void;
}

export function EditNameModal({ visible, initialValue, onSave, onClose }: EditNameModalProps) {
  const colors = useThemeColors();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.body}>
        <Text style={[typography.eyebrow, styles.title, { color: colors.textMuted }]}>
          Editar nombre
        </Text>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Tu nombre"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            typography.body,
            { color: colors.text, borderColor: colors.border },
          ]}
          maxLength={40}
          autoFocus
        />
        <Pressable
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            onSave(value.trim());
            onClose();
          }}
        >
          <Text style={[typography.body, styles.saveLabel, { color: colors.text }]}>
            Guardar
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.md,
  },
  title: {},
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  saveButton: {
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  saveLabel: {
    fontWeight: '600',
  },
});
