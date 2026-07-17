import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { use$ } from '@legendapp/state/react';
import { Ionicons } from '@expo/vector-icons';
import { settings$, updateSettingsProfile } from '../../src/state/settings$';
import { session$ } from '../../src/state/session$';
import { reminders$ } from '../../src/state/reminders$';
import { habits$ } from '../../src/state/habits$';
import { computeSlotCount, isApproachingIOSLimit } from '../../src/domain/reminders';
import {
  openOSNotificationSettingsAsync,
  refreshPermissionStatusAsync,
  requestPermissionAsync,
} from '../../src/notifications/permissions';
import { listScheduledSummaryAsync, scheduleTestNotificationAsync } from '../../src/notifications/debug';
import { useSyncSummary, type SyncStatus } from '../../src/hooks/useSyncSummary';
import { formatRelativeShort } from '../../src/lib/dates';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, radii, typography } from '../../src/theme/tokens';
import { Avatar } from '../../src/components/Avatar';
import { SettingsCard, SettingsRow } from '../../src/components/SettingsRow';
import { SelectModal } from '../../src/components/SelectModal';
import { EditNameModal } from '../../src/components/EditNameModal';
import { supabase } from '../../src/lib/supabase';
import type { Settings, Weekday } from '../../src/domain/types';

const NOTIFICATION_STATUS_LABELS = {
  granted: 'Permitidas',
  denied: 'Bloqueadas',
  undetermined: 'Pendiente',
} as const;

const SYNC_STATUS_COPY: Record<SyncStatus, { title: string; subtitle: string; label: string }> = {
  synced: { title: 'Estado', subtitle: 'Todo al día', label: 'Al día' },
  syncing: { title: 'Estado', subtitle: 'Sincronizando…', label: 'Sincronizando' },
  error: { title: 'Estado', subtitle: 'No se pudo sincronizar', label: 'Error' },
  offline: { title: 'Estado', subtitle: 'Sin conexión', label: 'Sin conexión' },
};

const THEME_LABELS: Record<Settings['theme'], string> = {
  system: 'Sistema',
  light: 'Claro',
  dark: 'Oscuro',
};

export default function SettingsScreen() {
  const colors = useThemeColors();
  const notificationStatus = use$(settings$.local.notificationPermissionStatus);
  const weekStartsOn = use$(settings$.profile.weekStartsOn);
  const theme = use$(settings$.profile.theme);
  const savedDisplayName = use$(settings$.profile.displayName);
  const session = use$(session$);
  const reminders = use$(reminders$);
  const habits = use$(habits$);
  const sync = useSyncSummary();

  const [editingName, setEditingName] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<'theme' | 'weekStart' | null>(null);

  const slotCount = computeSlotCount(reminders, habits);
  const approachingLimit = isApproachingIOSLimit(slotCount);

  useFocusEffect(
    useCallback(() => {
      refreshPermissionStatusAsync();
    }, [])
  );

  function handleNotificationsPress() {
    if (notificationStatus === 'undetermined') {
      requestPermissionAsync();
    } else {
      openOSNotificationSettingsAsync();
    }
  }

  async function handleSendTestNotification() {
    try {
      await scheduleTestNotificationAsync();
      Alert.alert('Notificación de prueba enviada', 'Te llegará en 5 segundos. Puedes bajar la app para verla como una notificación real.');
    } catch (error) {
      Alert.alert('No se pudo enviar', String(error));
    }
  }

  async function handleShowScheduled() {
    const { count, entries } = await listScheduledSummaryAsync();
    const body =
      count === 0
        ? 'No hay notificaciones programadas.'
        : entries.map((e) => `• ${e.title} — ${e.description}`).join('\n');
    Alert.alert(`Notificaciones programadas (${count})`, body);
  }

  const displayName = savedDisplayName.trim() || 'Usuario';
  const email = session?.user.email ?? 'Sin correo';
  const syncCopy = SYNC_STATUS_COPY[sync.status];

  const syncIcon: keyof typeof Ionicons.glyphMap =
    sync.status === 'synced'
      ? 'cloud-done'
      : sync.status === 'syncing'
        ? 'sync'
        : sync.status === 'error'
          ? 'alert-circle'
          : 'cloud-offline';
  const syncColor =
    sync.status === 'synced'
      ? colors.success
      : sync.status === 'syncing'
        ? colors.primary
        : sync.status === 'error'
          ? colors.danger
          : colors.textMuted;
  const syncBackground =
    sync.status === 'synced'
      ? colors.successBackground
      : sync.status === 'syncing'
        ? colors.primaryMuted
        : sync.status === 'error'
          ? colors.dangerBackground
          : colors.surfaceElevated;

  const notificationsColor = notificationStatus === 'denied' ? colors.danger : colors.success;
  const notificationsBackground =
    notificationStatus === 'denied' ? colors.dangerBackground : colors.successBackground;

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.hero, { color: colors.text }]}>Ajustes</Text>

        <Pressable
          style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setEditingName(true)}
        >
          <Avatar name={displayName} size={56} />
          <View style={styles.profileText}>
            <Text style={[typography.body, styles.profileName, { color: colors.text }]}>
              {displayName}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <View style={styles.section}>
          <Text style={[typography.eyebrow, { color: colors.textMuted }]}>SINCRONIZACIÓN</Text>
          <SettingsCard>
            <SettingsRow
              icon={syncIcon}
              iconColor={syncColor}
              iconBackgroundColor={syncBackground}
              title={syncCopy.title}
              subtitle={syncCopy.subtitle}
              pill={{ icon: 'checkmark', label: syncCopy.label, color: syncColor, backgroundColor: syncBackground }}
              showChevron={false}
            />
            <SettingsRow
              icon="sync-outline"
              iconColor={colors.primary}
              iconBackgroundColor={colors.primaryMuted}
              title="Sincronizar ahora"
              subtitle="Última sincronización"
              trailingMutedText={formatRelativeShort(sync.lastSync)}
            />
          </SettingsCard>
        </View>

        <View style={styles.section}>
          <Text style={[typography.eyebrow, { color: colors.textMuted }]}>PREFERENCIAS</Text>
          <SettingsCard>
            <SettingsRow
              icon="calendar"
              iconColor={colors.purple}
              iconBackgroundColor={colors.purpleMuted}
              title="Inicio de semana"
              subtitle="Define qué día inicia tu semana"
              trailingValue={weekStartsOn === 1 ? 'Lunes' : 'Domingo'}
              onPress={() => setPickerOpen('weekStart')}
            />
            <SettingsRow
              icon="moon"
              iconColor={colors.primary}
              iconBackgroundColor={colors.primaryMuted}
              title="Tema"
              subtitle="Apariencia de la aplicación"
              trailingValue={THEME_LABELS[theme]}
              onPress={() => setPickerOpen('theme')}
            />
            <SettingsRow
              icon="notifications"
              iconColor={notificationsColor}
              iconBackgroundColor={notificationsBackground}
              title="Notificaciones"
              subtitle="Gestiona tus notificaciones"
              pill={{
                icon: notificationStatus === 'denied' ? 'close' : 'checkmark',
                label: NOTIFICATION_STATUS_LABELS[notificationStatus],
                color: notificationsColor,
                backgroundColor: notificationsBackground,
              }}
              onPress={handleNotificationsPress}
            />
            <SettingsRow
              icon="send"
              iconColor={colors.primary}
              iconBackgroundColor={colors.primaryMuted}
              title="Enviar notificación de prueba"
              subtitle="Llega en 5 segundos, sirve para confirmar que funcionan"
              onPress={handleSendTestNotification}
            />
            <SettingsRow
              icon="list"
              iconColor={colors.primary}
              iconBackgroundColor={colors.primaryMuted}
              title="Ver notificaciones programadas"
              subtitle={`${slotCount} programadas actualmente`}
              onPress={handleShowScheduled}
            />
          </SettingsCard>
          {approachingLimit ? (
            <Text style={[typography.caption, { color: colors.danger }]}>
              Tienes {slotCount} recordatorios programados, cerca del límite de 64 de iOS. Considera
              reducir recordatorios en días sueltos o usar "Diario".
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={[typography.eyebrow, { color: colors.textMuted }]}>CUENTA</Text>
          <SettingsCard>
            <SettingsRow
              icon="log-out"
              iconColor={colors.danger}
              iconBackgroundColor={colors.dangerBackground}
              title="Cerrar sesión"
              titleColor={colors.danger}
              subtitle="Salir de tu cuenta actual"
              onPress={() => supabase.auth.signOut()}
            />
          </SettingsCard>
        </View>
      </ScrollView>

      <EditNameModal
        visible={editingName}
        initialValue={savedDisplayName}
        onSave={(value) => updateSettingsProfile({ displayName: value })}
        onClose={() => setEditingName(false)}
      />

      <SelectModal
        visible={pickerOpen === 'weekStart'}
        title="Inicio de semana"
        options={[
          { value: '1', label: 'Lunes' },
          { value: '0', label: 'Domingo' },
        ]}
        selectedValue={String(weekStartsOn)}
        onSelect={(value) => updateSettingsProfile({ weekStartsOn: Number(value) as Weekday })}
        onClose={() => setPickerOpen(null)}
      />

      <SelectModal
        visible={pickerOpen === 'theme'}
        title="Tema"
        options={[
          { value: 'system', label: 'Sistema' },
          { value: 'light', label: 'Claro' },
          { value: 'dark', label: 'Oscuro' },
        ]}
        selectedValue={theme}
        onSelect={(value) => updateSettingsProfile({ theme: value as Settings['theme'] })}
        onClose={() => setPickerOpen(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontWeight: '700',
  },
});
