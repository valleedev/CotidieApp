import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, radii, typography } from '../../src/theme/tokens';

export default function SignIn() {
  const colors = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
    }
    // Éxito: session$ reacciona vía onAuthStateChange y Stack.Protected navega solo.
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.title, { color: colors.text }]}>Iniciar sesión</Text>

      <View style={styles.form}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Correo"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={[styles.input, typography.body, { color: colors.text, borderColor: colors.border }]}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          autoComplete="password"
          style={[styles.input, typography.body, { color: colors.text, borderColor: colors.border }]}
        />

        {error ? <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text> : null}

        <Pressable
          style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
          onPress={handleSubmit}
          disabled={loading || !email || !password}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[typography.body, styles.buttonText, { color: colors.background }]}>
              Iniciar sesión
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push('/sign-up')}>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            ¿No tienes cuenta? Crear una
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  form: {
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  button: {
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  buttonText: {
    fontWeight: '600',
  },
});
