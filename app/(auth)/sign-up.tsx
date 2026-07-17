import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';
import { BrandMark } from '../../src/components/BrandMark';
import { AuthTextField } from '../../src/components/AuthTextField';
import { AuthSubmitButton } from '../../src/components/AuthSubmitButton';

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
        <View style={styles.checkEmailContent}>
          <BrandMark icon="mail" size={64} iconSize={30} />
          <Text style={[typography.title, styles.checkEmailTitle, { color: colors.text }]}>
            Revisa tu correo
          </Text>
          <Text style={[typography.body, styles.checkEmailBody, { color: colors.textMuted }]}>
            Te enviamos un enlace de confirmación a{' '}
            <Text style={{ color: colors.text, fontWeight: '600' }}>{email}</Text>. Ábrelo para activar
            tu cuenta y volver a iniciar sesión.
          </Text>
        </View>

        <Pressable onPress={() => router.replace('/sign-in')} style={styles.footer}>
          <Text style={{ color: colors.success, fontWeight: '700', fontSize: 16 }}>Ir a iniciar sesión</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.success} />
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[typography.eyebrow, { color: colors.textMuted }]}>Crea tu cuenta</Text>
            <View style={styles.brandRow}>
              <BrandMark />
              <Text style={[typography.title, { color: colors.text }]}>Cotidie</Text>
            </View>
            <Text style={[typography.hero, { color: colors.text }]}>Crea tu{'\n'}cuenta</Text>
            <Text style={[typography.body, styles.body, { color: colors.textMuted }]}>
              Empieza a construir hábitos que se mantienen.
            </Text>
          </View>

          <View style={styles.form}>
            <AuthTextField
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="Correo"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
            <AuthTextField
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña (mín. 6 caracteres)"
              secureTextEntry
              autoComplete="password-new"
            />

            {error ? <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text> : null}

            <AuthSubmitButton
              label="Crear cuenta"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !email || password.length < 6}
            />
          </View>

          <Pressable onPress={() => router.push('/sign-in')} style={styles.footer}>
            <Text style={[typography.body, { color: colors.textMuted }]}>
              ¿Ya tienes cuenta?{' '}
              <Text style={{ color: colors.success, fontWeight: '700' }}>Iniciar sesión</Text>
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.success} />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.lg, gap: spacing.lg, justifyContent: 'space-between' },
  header: { gap: spacing.sm },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  body: { lineHeight: 22 },
  form: { gap: spacing.sm },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, padding: spacing.lg },
  checkEmailContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg },
  checkEmailTitle: { textAlign: 'center' },
  checkEmailBody: { textAlign: 'center', lineHeight: 22 },
});
