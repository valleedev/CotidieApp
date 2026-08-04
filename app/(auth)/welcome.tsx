import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { friendlyAuthErrorMessage } from '../../src/lib/authErrors';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';
import { AuthActionRow } from '../../src/components/AuthActionRow';
import { BrandMark } from '../../src/components/BrandMark';

export default function Welcome() {
  const colors = useThemeColors();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  async function handleGoogle() {
    if (googleLoading) return;
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      // Import diferido: el módulo nativo de Google Sign-In no existe en un
      // dev client que no fue recompilado con el plugin — importarlo estático
      // rompería esta pantalla entera (TurboModuleRegistry.getEnforcing lanza
      // al cargar el módulo, no al llamarlo).
      const { signInWithGoogle } = await import('../../src/lib/googleAuth');
      await signInWithGoogle();
    } catch (e) {
      setGoogleError(friendlyAuthErrorMessage(e));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[typography.eyebrow, { color: colors.textMuted }]}>Bienvenida</Text>

        <View style={styles.brandRow}>
          <BrandMark />
          <Text style={[typography.title, { color: colors.text }]}>Cotidie</Text>
        </View>

        <Text style={[typography.hero, { color: colors.text }]}>Tus hábitos,{'\n'}cada día</Text>

        <Text style={[typography.body, styles.body, { color: colors.textMuted }]}>
          Registra tus hábitos y sigue tu progreso, incluso{' '}
          <Text style={{ color: colors.success }}>sin conexión</Text>. Todo se sincroniza solo cuando
          vuelves a tener señal.
        </Text>

        <View style={styles.actions}>
          <AuthActionRow icon="logo-google" label="Continuar con Google" onPress={handleGoogle} />
          {googleError ? (
            <Text style={[typography.caption, { color: colors.danger }]}>{googleError}</Text>
          ) : null}
          <AuthActionRow icon="logo-apple" label="Continuar con Apple" />

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[typography.caption, { color: colors.textMuted }]}>o con tu correo</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <AuthActionRow
            icon="mail"
            label="Crear cuenta"
            variant="gradient"
            onPress={() => router.push('/sign-up')}
          />

          <AuthActionRow
            icon="shield-checkmark"
            iconColor={colors.success}
            label="Seguro y privado"
            subtitle="Tus datos están protegidos."
          />
        </View>

        <Pressable onPress={() => router.push('/sign-in')} style={styles.footer}>
          <Text style={[typography.body, { color: colors.textMuted }]}>
            ¿Ya tienes cuenta?{' '}
            <Text style={{ color: colors.success, fontWeight: '700' }}>Inicia sesión</Text>
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.success} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  body: { lineHeight: 22 },
  actions: { gap: spacing.sm },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.xs },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
});
