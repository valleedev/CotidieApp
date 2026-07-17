import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing, radii, typography } from '../theme/tokens';

export interface EditNameModalProps {
  visible: boolean;
  initialValue: string;
  onSave: (value: string) => void;
  onClose: () => void;
}

export function EditNameModal({ visible, initialValue, onSave, onClose }: EditNameModalProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState(initialValue);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => setValue(initialValue)}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: colors.surfaceElevated, paddingBottom: insets.bottom + spacing.md },
          ]}
        >
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
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
