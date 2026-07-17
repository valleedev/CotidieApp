import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { spacing, radii, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { BottomSheet } from './BottomSheet';

export interface TimePickerFieldProps {
  time: string; // 'HH:mm'
  onChange: (time: string) => void;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  autoOpen?: boolean;
  onAutoOpenHandled?: () => void;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toDate(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
}

// Android usa el dialog nativo imperativo (DateTimePickerAndroid.open); iOS no
// tiene equivalente imperativo, así que el spinner se monta dentro del
// BottomSheet ya existente en la app.
export function TimePickerField({
  time,
  onChange,
  icon,
  iconColor,
  label,
  autoOpen = false,
  onAutoOpenHandled,
}: TimePickerFieldProps) {
  const colors = useThemeColors();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [draft, setDraft] = useState(() => toDate(time));

  function openPicker() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: toDate(time),
        mode: 'time',
        is24Hour: true,
        onChange: (event, date) => {
          if (event.type === 'set' && date) {
            onChange(`${pad(date.getHours())}:${pad(date.getMinutes())}`);
          }
        },
      });
    } else {
      setDraft(toDate(time));
      setSheetVisible(true);
    }
  }

  useEffect(() => {
    if (autoOpen) {
      openPicker();
      onAutoOpenHandled?.();
    }
    // Solo debe reaccionar al flanco de autoOpen, no a cambios de `time`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  return (
    <>
      <Pressable onPress={openPicker} style={styles.trigger} hitSlop={8}>
        <Ionicons name={icon} size={18} color={iconColor} />
        <Text style={[typography.body, { color: colors.text }]}>{time}</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}> · {label}</Text>
      </Pressable>

      {Platform.OS === 'ios' ? (
        <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)}>
          <View style={styles.sheetContent}>
            <DateTimePicker
              value={draft}
              mode="time"
              display="spinner"
              onChange={(_, date) => date && setDraft(date)}
            />
            <Pressable
              style={[styles.doneButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                onChange(`${pad(draft.getHours())}:${pad(draft.getMinutes())}`);
                setSheetVisible(false);
              }}
            >
              <Text style={[typography.body, { color: '#FFFFFF' }]}>Listo</Text>
            </Pressable>
          </View>
        </BottomSheet>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sheetContent: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  doneButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.full,
    alignItems: 'center',
  },
});
