import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing, radii, typography } from '../theme/tokens';

export interface AuthTextFieldProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  keyboardType?: TextInputProps['keyboardType'];
}

export function AuthTextField({
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize,
  autoComplete,
  keyboardType,
}: AuthTextFieldProps) {
  const colors = useThemeColors();
  const [secureVisible, setSecureVisible] = useState(false);

  return (
    <View style={[styles.row, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
      <Ionicons name={icon} size={20} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry ? !secureVisible : false}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        style={[typography.body, styles.input, { color: colors.text }]}
      />
      {secureTextEntry ? (
        <Pressable onPress={() => setSecureVisible((v) => !v)} hitSlop={8}>
          <Ionicons
            name={secureVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, paddingVertical: spacing.md },
});
