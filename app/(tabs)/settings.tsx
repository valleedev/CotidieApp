import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { use$ } from '@legendapp/state/react';
import { settings$, updateSettingsProfile } from '../../src/state/settings$';
import { reminders$ } from '../../src/state/reminders$';
import { habits$ } from '../../src/state/habits$';
import { computeSlotCount, isApproachingIOSLimit } from '../../src/domain/reminders';
import {
  openOSNotificationSettingsAsync,
  refreshPermissionStatusAsync,
  requestPermissionAsync,
} from '../../src/notifications/permissions';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, radii, typography } from '../../src/theme/tokens';
import { SyncStatusChip } from '../../src/components/SyncStatusChip';
import { supabase } from '../../src/lib/supabase';

const STATUS_LABELS = {
  granted: 'Concedido',
  denied: 'Denegado',
  undetermined: 'No solicitado',
} as const;

export default function Settings() {
  const colors = useThemeColors();
  const status = use$(settings$.local.notificationPermissionStatus);
  const weekStartsOn = use$(settings$.profile.weekStartsOn);
  const savedDisplayName = use$(settings$.profile.displayName);
  const reminders = use$(reminders$);
  const habits = use$(habits$);
  const slotCount = computeSlotCount(reminders, habits);
  const approachingLimit = isApproachingIOSLimit(slotCount);
  const [displayName, setDisplayName] = useState(savedDisplayName);

  useFocusEffect(
    useCallback(() => {
      refreshPermissionStatusAsync();
    }, [])
  );

  function handleAction() {
    if (status === 'undetermined') {
      requestPermissionAsync();
    } else if (status === 'denied') {
      openOSNotificationSettingsAsync();
    }
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.title, { color: colors.text }]}>Ajustes</Text>

      <SyncStatusChip />

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[typography.body, { color: colors.text }]}>Perfil</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          onBlur={() => updateSettingsProfile({ displayName: displayName.trim() })}
          placeholder="Tu nombre"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            typography.body,
            { color: colors.text, borderColor: colors.border },
          ]}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.row}>
          <Text style={[typography.body, { color: colors.text }]}>Notificaciones</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>{STATUS_LABELS[status]}</Text>
        </View>
        {status !== 'granted' ? (
          <Pressable onPress={handleAction} style={styles.actionButton}>
            <Text style={[typography.body, { color: colors.primary }]}>
              {status === 'undetermined' ? 'Activar notificaciones' : 'Abrir Ajustes'}
            </Text>
          </Pressable>
        ) : null}
        {approachingLimit ? (
          <Text style={[typography.caption, { color: colors.danger }]}>
            Tienes {slotCount} recordatorios programados, cerca del límite de 64 de iOS. Considera
            reducir recordatorios en días sueltos o usar "Diario".
          </Text>
        ) : null}
      </View>

      {/* Selector de tema oculto: app dark-only por ahora, ver useThemeColors.ts */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.row}>
          <Text style={[typography.body, { color: colors.text }]}>La semana empieza en</Text>
          <Pressable onPress={() => updateSettingsProfile({ weekStartsOn: weekStartsOn === 1 ? 0 : 1 })}>
            <Text style={[typography.caption, { color: colors.primary }]}>
              {weekStartsOn === 1 ? 'Lunes' : 'Domingo'}
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable onPress={() => supabase.auth.signOut()} style={styles.actionButton}>
        <Text style={[typography.body, { color: colors.danger }]}>Cerrar sesión</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
