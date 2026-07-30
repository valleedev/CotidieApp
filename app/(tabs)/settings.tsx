import { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { use$ } from '@legendapp/state/react';
import { Ionicons } from '@expo/vector-icons';
import { settings$, updateSettingsProfile } from '../../src/state/settings$';
import { session$ } from '../../src/state/session$';
import { reminders$ } from '../../src/state/reminders$';
import { habits$ } from '../../src/state/habits$';
import { computeSlotCount } from '../../src/domain/reminders';
import {
  openOSNotificationSettingsAsync,
  refreshPermissionStatusAsync,
  requestPermissionAsync,
} from '../../src/notifications/permissions';
import { isRunningAsStandalonePwa } from '../../src/notifications/webPush';
import { useSyncSummary } from '../../src/hooks/useSyncSummary';
import { formatRelativeShort } from '../../src/lib/dates';
import { useThemeMode } from '../../src/theme/useThemeColors';
import { SelectModal } from '../../src/components/SelectModal';
import { EditNameModal } from '../../src/components/EditNameModal';
import { supabase } from '../../src/lib/supabase';
import type { Settings } from '../../src/domain/types';

const THEME_LABELS: Record<Settings['theme'], string> = {
  system: 'Sistema',
  light: 'Claro',
  dark: 'Oscuro',
};

const screenColors = {
  light: {
    background: '#FCF9F5',
    text: '#26221E',
    muted: '#777067',
    faint: '#A19A91',
    border: '#E3DCD3',
    avatar: '#F8E7DC',
    accent: '#B84D2A',
    syncBackground: '#E6EEE2',
    syncText: '#51714D',
    switchTrack: '#E5DFD5',
  },
  dark: {
    background: '#1D1D16',
    text: '#F3EFE8',
    muted: '#AEA79B',
    faint: '#837C72',
    border: '#454136',
    avatar: '#4B2818',
    accent: '#E8875C',
    syncBackground: '#203720',
    syncText: '#A8C69E',
    switchTrack: '#454238',
  },
} as const;

export default function SettingsScreen() {
  const mode = useThemeMode();
  const colors = screenColors[mode];
  const notificationStatus = use$(settings$.local.notificationPermissionStatus);
  const theme = use$(settings$.profile.theme);
  const savedDisplayName = use$(settings$.profile.displayName);
  const session = use$(session$);
  const reminders = use$(reminders$);
  const habits = use$(habits$);
  const sync = useSyncSummary();
  const [editingName, setEditingName] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<'theme' | null>(null);

  const slotCount = computeSlotCount(reminders, habits);
  const displayName = savedDisplayName.trim() || 'Usuario';
  const email = session?.user.email ?? 'Sin correo';
  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  const syncTitle = sync.status === 'synced' ? 'Todo guardado' : sync.status === 'syncing' ? 'Guardando cambios' : sync.status === 'offline' ? 'Sin conexión' : 'No se pudo sincronizar';
  const syncSubtitle = sync.status === 'synced' ? `Sincronizado ${formatRelativeShort(sync.lastSync)}` : sync.status === 'syncing' ? 'Sincronizando…' : sync.status === 'offline' ? 'Los cambios se guardan en este dispositivo' : 'Revisaremos la conexión al volver a abrir';
  const notificationLabel = notificationStatus === 'granted' ? 'Permitidas' : notificationStatus === 'denied' ? 'Bloqueadas' : 'Pendiente';
  const needsHomeScreenInstall = Platform.OS === 'web' && !isRunningAsStandalonePwa();

  useFocusEffect(
    useCallback(() => {
      refreshPermissionStatusAsync();
    }, [])
  );

  function handleNotificationsPress() {
    if (notificationStatus === 'undetermined') requestPermissionAsync();
    else openOSNotificationSettingsAsync();
  }

  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ gap: 23, paddingBottom: 22, paddingHorizontal: 20, paddingTop: 42 }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 14 }}>
          <View style={{ alignItems: 'center', backgroundColor: colors.avatar, borderRadius: 999, height: 56, justifyContent: 'center', width: 56 }}>
            <Text style={{ color: colors.accent, fontFamily: 'serif', fontSize: 23 }}>{initials || '?'}</Text>
          </View>
          <Pressable accessibilityLabel="Editar perfil" onPress={() => setEditingName(true)} style={{ flex: 1, gap: 1 }}>
            <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 27, lineHeight: 29 }}>{displayName}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{email}</Text>
          </Pressable>
          <Pressable accessibilityLabel="Editar nombre" onPress={() => setEditingName(true)} style={{ borderColor: colors.border, borderRadius: 999, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8 }}>
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>Editar</Text>
          </Pressable>
        </View>

        <View style={{ alignItems: 'center', backgroundColor: colors.syncBackground, borderRadius: 14, flexDirection: 'row', gap: 11, paddingHorizontal: 15, paddingVertical: 13 }}>
          <Ionicons color={colors.syncText} name={sync.status === 'synced' ? 'cloud-done-outline' : sync.status === 'syncing' ? 'sync-outline' : sync.status === 'error' ? 'alert-circle-outline' : 'cloud-offline-outline'} size={21} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>{syncTitle}</Text>
            <Text style={{ color: colors.muted, fontSize: 11 }}>{syncSubtitle}</Text>
          </View>
          <Text style={{ color: colors.syncText, fontSize: 12, fontWeight: '800' }}>Sincronizar</Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.25 }}>PREFERENCIAS</Text>
          <View>
            <Pressable accessibilityLabel="Cambiar tema" onPress={() => setPickerOpen('theme')} style={{ alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 14, minHeight: 76 }}>
              <Ionicons color={colors.muted} name="contrast-outline" size={19} />
              <Text style={{ color: colors.text, flex: 1, fontSize: 15 }}>Tema</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>{THEME_LABELS[theme]}</Text>
              <Ionicons color={colors.muted} name="chevron-forward" size={17} />
            </Pressable>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.25 }}>RECORDATORIOS</Text>
          {needsHomeScreenInstall ? (
            <View style={{ backgroundColor: colors.syncBackground, borderRadius: 14, gap: 2, paddingHorizontal: 15, paddingVertical: 13 }}>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>Añade Cotidie a tu pantalla de inicio</Text>
              <Text style={{ color: colors.muted, fontSize: 11 }}>Safari solo permite notificaciones desde la app instalada (Compartir → Añadir a inicio).</Text>
            </View>
          ) : null}
          <View>
            <Pressable accessibilityLabel="Configurar notificaciones" disabled={needsHomeScreenInstall} onPress={handleNotificationsPress} style={{ alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 14, minHeight: 82, opacity: needsHomeScreenInstall ? 0.5 : 1 }}>
              <Ionicons color={colors.muted} name="notifications-outline" size={19} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: colors.text, fontSize: 15 }}>Notificaciones</Text>
                <Text style={{ color: colors.muted, fontSize: 11 }}>{slotCount} programadas</Text>
              </View>
              <View style={{ alignItems: 'center', backgroundColor: notificationStatus === 'denied' ? mode === 'dark' ? '#45251E' : '#F9E6DF' : colors.syncBackground, borderRadius: 999, flexDirection: 'row', gap: 4, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Ionicons color={notificationStatus === 'denied' ? colors.accent : colors.syncText} name={notificationStatus === 'denied' ? 'close' : 'checkmark'} size={12} />
                <Text style={{ color: notificationStatus === 'denied' ? colors.accent : colors.syncText, fontSize: 11, fontWeight: '700' }}>{notificationLabel}</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar sesión" onPress={() => supabase.auth.signOut()} style={{ alignItems: 'center', borderColor: colors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 7, minHeight: 49 }}>
          <Ionicons color={colors.accent} name="log-out-outline" size={18} />
          <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '800' }}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>

      <EditNameModal
        visible={editingName}
        initialValue={savedDisplayName}
        onSave={(value) => updateSettingsProfile({ displayName: value })}
        onClose={() => setEditingName(false)}
      />
      <SelectModal
        visible={pickerOpen === 'theme'}
        title="Tema"
        options={[{ value: 'system', label: 'Sistema' }, { value: 'light', label: 'Claro' }, { value: 'dark', label: 'Oscuro' }]}
        selectedValue={theme}
        onSelect={(value) => updateSettingsProfile({ theme: value as Settings['theme'] })}
        onClose={() => setPickerOpen(null)}
      />
    </View>
  );
}
