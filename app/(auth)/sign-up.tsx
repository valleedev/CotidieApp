import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, radii, typography } from '../../src/theme/tokens';

export default function SignUp() {
  const colors = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (!data.session) {
      // Proyecto con confirmación de email activa: no hay sesión hasta confirmar.
      setCheckEmail(true);
      return;
    }
    // Éxito con sesión inmediata: session$ reacciona y Stack.Protected navega solo.
  }

  if (checkEmail) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[typography.title, { color: colors.text }]}>Revisa tu correo</Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Te enviamos un enlace de confirmación a {email}. Ábrelo para activar tu cuenta y volver a
          iniciar sesión.
        </Text>
        <Pressable onPress={() => router.replace('/sign-in')}>
          <Text style={[typography.caption, { color: colors.primary }]}>Ir a iniciar sesión</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.title, { color: colors.text }]}>Crear cuenta</Text>

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
          placeholder="Contraseña (mín. 6 caracteres)"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          autoComplete="password-new"
          style={[styles.input, typography.body, { color: colors.text, borderColor: colors.border }]}
        />

        {error ? <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text> : null}

        <Pressable
          style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
          onPress={handleSubmit}
          disabled={loading || !email || password.length < 6}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[typography.body, styles.buttonText, { color: colors.background }]}>
              Crear cuenta
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push('/sign-in')}>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            ¿Ya tienes cuenta? Iniciar sesión
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
