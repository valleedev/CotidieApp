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
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[typography.eyebrow, { color: colors.textMuted }]}>Bienvenida de nuevo</Text>
            <View style={styles.brandRow}>
              <BrandMark />
              <Text style={[typography.title, { color: colors.text }]}>Cotidie</Text>
            </View>
            <Text style={[typography.hero, { color: colors.text }]}>Inicia{'\n'}sesión</Text>
            <Text style={[typography.body, styles.body, { color: colors.textMuted }]}>
              Continúa con tus hábitos donde los dejaste.
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
              placeholder="Contraseña"
              secureTextEntry
              autoComplete="password"
            />

            {error ? <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text> : null}

            <AuthSubmitButton
              label="Iniciar sesión"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !email || !password}
            />
          </View>

          <Pressable onPress={() => router.push('/sign-up')} style={styles.footer}>
            <Text style={[typography.body, { color: colors.textMuted }]}>
              ¿No tienes cuenta?{' '}
              <Text style={{ color: colors.success, fontWeight: '700' }}>Crear una</Text>
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
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
});
