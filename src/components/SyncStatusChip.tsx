import { StyleSheet, Text, View } from 'react-native';
import { syncState } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import { Ionicons } from '@expo/vector-icons';
import { habits$ } from '../state/habits$';
import { completions$ } from '../state/completions$';
import { reminders$ } from '../state/reminders$';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing, radii, typography } from '../theme/tokens';

const habitsSync$ = syncState(habits$);
const completionsSync$ = syncState(completions$);
const remindersSync$ = syncState(reminders$);

export function SyncStatusChip() {
  const colors = useThemeColors();
  const isOnline = useNetworkStatus();
  const habitsState = use$(habitsSync$);
  const completionsState = use$(completionsSync$);
  const remindersState = use$(remindersSync$);

  const pending =
    (habitsState.numPendingSets ?? 0) +
    (completionsState.numPendingSets ?? 0) +
    (remindersState.numPendingSets ?? 0);
  const isSetting = habitsState.isSetting || completionsState.isSetting || remindersState.isSetting;
  const error = habitsState.error ?? completionsState.error ?? remindersState.error;

  let icon: keyof typeof Ionicons.glyphMap;
  let label: string;
  let color: string;

  if (!isOnline) {
    icon = 'cloud-offline-outline';
    label = 'Sin conexión';
    color = colors.textMuted;
  } else if (error) {
    icon = 'alert-circle-outline';
    label = 'Error de sincronización';
    color = colors.danger;
  } else if (isSetting || pending > 0) {
    icon = 'sync-outline';
    label = pending > 0 ? `Sincronizando (${pending})` : 'Sincronizando';
    color = colors.primary;
  } else {
    icon = 'checkmark-circle-outline';
    label = 'Sincronizado';
    color = colors.success;
  }

  return (
    <View style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[typography.caption, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
  },
});
