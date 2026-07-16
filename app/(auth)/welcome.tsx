import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, radii, typography } from '../../src/theme/tokens';

export default function Welcome() {
  const colors = useThemeColors();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.hero}>
        <Text style={[typography.title, { color: colors.text }]}>Cotidie</Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Tus hábitos, sincronizados en todos tus dispositivos.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/sign-up')}
        >
          <Text style={[typography.body, styles.buttonText, { color: colors.background }]}>Crear cuenta</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.buttonOutline, { borderColor: colors.border }]}
          onPress={() => router.push('/sign-in')}
        >
          <Text style={[typography.body, styles.buttonText, { color: colors.text }]}>Iniciar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
  button: {
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonOutline: {
    borderWidth: 1,
  },
  buttonText: {
    fontWeight: '600',
  },
});
