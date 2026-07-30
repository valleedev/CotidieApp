import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeOutUp, LinearTransition, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { spacing, radii, typography, HABIT_COLORS } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeColors';
import { WeekdayPicker } from './WeekdayPicker';
import { IconPicker } from './IconPicker';
import { ReminderRow } from './ReminderRow';
import { HabitSymbol } from './HabitSymbol';
import type { Habit, Reminder, Weekday } from '../domain/types';
import type { ReminderDraft } from '../domain/reminders';
import { refreshPermissionStatusAsync, requestPermissionAsync } from '../notifications/permissions';

const NEW_HABIT_ICONS = [
  'book-outline',
  'barbell-outline',
  'leaf-outline',
  'water-outline',
  'walk-outline',
  'restaurant-outline',
  'pencil-outline',
  'moon-outline',
  'locate-outline',
  'musical-notes-outline',
  'bicycle-outline',
  'heart-outline',
  'sunny-outline',
  'fitness-outline',
  'cafe-outline',
  'medkit-outline',
  'alarm-outline',
  'laptop-outline',
  'brush-outline',
  'school-outline',
  'language-outline',
  'people-outline',
  'pulse-outline',
  'bed-outline',
] as const;

export interface HabitFormValues {
  name: string;
  color: string;
  icon: string;
  category: string;
  daysOfWeek: Weekday[];
  targetPerDay: number;
}

export interface HabitFormHandle {
  submit: () => void;
}

export interface HabitFormProps {
  initial?: Habit;
  initialReminders?: Reminder[];
  submitLabel: string;
  onSubmit: (values: HabitFormValues, reminderDrafts: ReminderDraft[]) => void;
  onCanSubmitChange?: (canSubmit: boolean) => void;
  appearance?: 'default' | 'sheet';
}

function reminderToDraft(reminder: Reminder): ReminderDraft {
  return { id: reminder.id, time: reminder.time, daysOfWeek: reminder.daysOfWeek, enabled: reminder.enabled };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function currentTimeRounded(): string {
  const now = new Date();
  const minutes = Math.round(now.getMinutes() / 5) * 5;
  const hours = (now.getHours() + Math.floor(minutes / 60)) % 24;
  return `${pad(hours)}:${pad(minutes % 60)}`;
}

function softColor(hex: string, alpha = 0.16): string {
  const value = hex.replace('#', '');
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export const HabitForm = forwardRef<HabitFormHandle, HabitFormProps>(function HabitForm(
  { initial, initialReminders = [], submitLabel, onSubmit, onCanSubmitChange, appearance = 'default' },
  ref
) {
  const colors = useThemeColors();
  const isSheet = appearance === 'sheet';
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? HABIT_COLORS[0]);
  const [icon, setIcon] = useState(initial?.icon ?? 'book-outline');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [daysOfWeek, setDaysOfWeek] = useState<Weekday[]>(initial?.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6]);
  const [targetPerDay, setTargetPerDay] = useState(initial?.targetPerDay ?? 1);
  const [tipo, setTipo] = useState<'boolean' | 'count'>(
    initial && initial.targetPerDay > 1 ? 'count' : 'boolean'
  );
  const [reminderDrafts, setReminderDrafts] = useState<ReminderDraft[]>(
    initialReminders.map(reminderToDraft)
  );
  const [autoOpenIndex, setAutoOpenIndex] = useState<number | null>(null);
  const [segmentWidth, setSegmentWidth] = useState(0);
  const badgeBackground = useSharedValue(isSheet ? softColor(initial?.color ?? HABIT_COLORS[0]) : initial?.color ?? HABIT_COLORS[0]);
  const badgeScale = useSharedValue(1);
  const segmentPosition = useSharedValue(tipo === 'count' ? 1 : 0);

  const nameError = name.trim().length === 0;
  const daysError = daysOfWeek.length === 0;
  const canSubmit = !nameError && !daysError;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(
      { name: name.trim(), color, icon, category: category.trim(), daysOfWeek, targetPerDay },
      reminderDrafts
    );
  }

  useImperativeHandle(ref, () => ({ submit: handleSubmit }), [handleSubmit]);

  useEffect(() => {
    onCanSubmitChange?.(canSubmit);
  }, [canSubmit, onCanSubmitChange]);

  useEffect(() => {
    segmentPosition.value = withSpring(tipo === 'count' ? 1 : 0, {
      damping: 18,
      mass: 0.65,
      stiffness: 210,
    });
  }, [segmentPosition, tipo]);

  async function handleAddReminder() {
    const status = await refreshPermissionStatusAsync();
    if (status === 'undetermined') {
      await requestPermissionAsync();
    }
    setReminderDrafts((drafts) => {
      setAutoOpenIndex(drafts.length);
      return [...drafts, { time: currentTimeRounded(), daysOfWeek: null, enabled: true }];
    });
  }

  function updateReminderDraft(index: number, next: ReminderDraft) {
    setReminderDrafts((drafts) => drafts.map((d, i) => (i === index ? next : d)));
  }

  function removeReminderDraft(index: number) {
    setReminderDrafts((drafts) => drafts.filter((_, i) => i !== index));
  }

  const badgeStyle = useAnimatedStyle(() => ({
    backgroundColor: badgeBackground.value,
    transform: [{ scale: badgeScale.value }],
  }));
  const segmentIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: segmentPosition.value * (segmentWidth + 4) }],
  }));

  function measureSegmented(event: LayoutChangeEvent) {
    setSegmentWidth((event.nativeEvent.layout.width - 12) / 2);
  }

  function animateBadge() {
    badgeScale.value = withSequence(withTiming(0.88, { duration: 90 }), withSpring(1, { damping: 13, stiffness: 240 }));
  }

  function selectColor(nextColor: string) {
    badgeBackground.value = withTiming(isSheet ? softColor(nextColor) : nextColor, { duration: 220 });
    animateBadge();
    setColor(nextColor);
  }

  function selectIcon(nextIcon: string) {
    if (nextIcon === icon) return;
    animateBadge();
    setIcon(nextIcon);
  }

  const sheetColors = isSheet
    ? { background: colors.background, surface: colors.surface, border: colors.border, primary: colors.primary, muted: colors.textMuted }
    : null;

  return (
    <ScrollView style={{ backgroundColor: isSheet ? sheetColors?.background : colors.background }} contentContainerStyle={[styles.container, isSheet ? { gap: 16, paddingHorizontal: 21, paddingTop: 23 } : null]}>
      <View style={styles.field}>
        {isSheet ? null : <Text style={[typography.caption, { color: colors.textMuted }]}>Nombre</Text>}
        <View
          style={[
            styles.nameCard,
            isSheet
              ? { backgroundColor: 'transparent', borderBottomColor: nameError ? colors.danger : colors.border, borderBottomWidth: 1, borderColor: 'transparent', borderRadius: 0, paddingHorizontal: 0 }
              : { backgroundColor: colors.surface, borderColor: nameError ? colors.danger : colors.border },
          ]}
        >
          <Animated.View style={[styles.iconBadge, badgeStyle, isSheet ? { borderRadius: 14, height: 48, width: 48 } : null]}>
            <Animated.View key={icon} entering={FadeIn.duration(160)}>
              <HabitSymbol icon={icon} size={isSheet ? 23 : 18} color={isSheet ? color : '#FFFFFF'} />
            </Animated.View>
          </Animated.View>
          <View style={styles.nameTextBlock}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej. Leer"
              placeholderTextColor={colors.textMuted}
              style={[typography.body, { color: colors.text }]}
            />
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="Añadir categoría (opcional)"
              placeholderTextColor={colors.textMuted}
              style={[typography.caption, { color: colors.textMuted }]}
            />
          </View>
          {name.length > 0 ? (
            <Pressable
              onPress={() => setName('')}
              hitSlop={8}
              style={[styles.clearButton, { backgroundColor: colors.surfaceElevated }]}
            >
              <Ionicons name="close" size={14} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {isSheet ? (
        <View style={styles.field}>
          <Text style={[typography.caption, { color: colors.textMuted, fontWeight: '700', letterSpacing: 1.1 }]}>ICONO</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {NEW_HABIT_ICONS.map((iconName) => {
              const selected = icon === iconName;
              return <Pressable accessibilityLabel={`Seleccionar icono ${iconName}`} accessibilityRole="button" accessibilityState={{ selected }} key={iconName} onPress={() => selectIcon(iconName)} style={{ alignItems: 'center', backgroundColor: selected ? softColor(color) : colors.surface, borderColor: selected ? color : colors.border, borderRadius: 10, borderWidth: 1, height: 36, justifyContent: 'center', width: 36 }}><Ionicons color={selected ? color : colors.textMuted} name={iconName} size={19} /></Pressable>;
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.field}>
        <Text style={[typography.caption, { color: colors.textMuted, fontWeight: isSheet ? '700' : '400', letterSpacing: isSheet ? 1.1 : 0 }]}>COLOR</Text>
        <View style={[styles.iconColorCard, isSheet ? { backgroundColor: 'transparent', borderColor: 'transparent', padding: 0 } : { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {isSheet ? null : <IconPicker value={icon} onChange={setIcon} />}
          <View style={styles.colorRow}>
            {HABIT_COLORS.map((c) => {
              const selected = c === color;
              return (
                <Pressable
                  key={c}
                  onPress={() => selectColor(c)}
                  style={[styles.colorSwatch, { backgroundColor: c }, isSheet ? { borderRadius: 10, height: 34, width: 34 } : null]}
                >
                  {selected ? <Ionicons name="checkmark" size={18} color="#FFFFFF" /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.field}>
        {isSheet ? (
          <View style={styles.sheetFieldHeading}>
            <Text style={[typography.caption, { color: colors.textMuted, fontWeight: '700', letterSpacing: 1.1 }]}>DÍAS</Text>
            <Pressable onPress={() => setDaysOfWeek([0, 1, 2, 3, 4, 5, 6])} hitSlop={8}>
              <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>Todos los días</Text>
            </Pressable>
          </View>
        ) : <Text style={[typography.caption, { color: colors.textMuted }]}>DÍAS</Text>}
        <WeekdayPicker appearance={isSheet ? 'sheet' : 'default'} hideShortcut={isSheet} value={daysOfWeek} onChange={setDaysOfWeek} showSummary={!isSheet} />
        {daysError ? (
          <Text style={[typography.caption, { color: colors.danger }]}>Elige al menos un día.</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={[typography.caption, { color: colors.textMuted, fontWeight: isSheet ? '700' : '400', letterSpacing: isSheet ? 1.1 : 0 }]}>{isSheet ? 'CÓMO SE MARCA' : 'Tipo'}</Text>
        <View
          onLayout={measureSegmented}
          style={[styles.segmented, isSheet ? styles.sheetSegmented : null, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          {segmentWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.segmentIndicator,
                isSheet ? styles.sheetSegmentIndicator : null,
                {
                  backgroundColor: isSheet ? colors.background : colors.primary,
                  width: segmentWidth,
                },
                segmentIndicatorStyle,
              ]}
            />
          ) : null}
          {(
            [
              { key: 'boolean', label: isSheet ? 'Una vez' : 'Sí/No' },
              { key: 'count', label: isSheet ? 'Varias veces' : 'Cantidad' },
            ] as const
          ).map((option) => {
            const selected = tipo === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => {
                  setTipo(option.key);
                  if (option.key === 'boolean') setTargetPerDay(1);
                }}
                style={[
                  styles.segment,
                  isSheet ? styles.sheetSegment : null,
                ]}
              >
                <Text
                  style={[
                    typography.body,
                    { color: selected ? (isSheet ? colors.text : colors.background) : colors.textMuted, fontWeight: '600' },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {tipo === 'count' ? (
        <Animated.View
          entering={FadeInDown.duration(220)}
          exiting={FadeOutUp.duration(170)}
          layout={LinearTransition.duration(220)}
          style={styles.field}
        >
          <Text style={[typography.caption, { color: colors.textMuted }]}>Veces al día</Text>
          <View style={[styles.targetCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Pressable
              onPress={() => setTargetPerDay((t) => Math.max(1, t - 1))}
              style={[styles.targetButton, { backgroundColor: colors.background }]}
            >
              <Ionicons name="remove" size={18} color={colors.text} />
            </Pressable>
            <View style={styles.targetCenter}>
              <Text style={[typography.title, { color: colors.text }]}>{targetPerDay}</Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>veces al día</Text>
            </View>
            <Pressable
              onPress={() => setTargetPerDay((t) => Math.min(10, t + 1))}
              style={[styles.targetButton, { backgroundColor: colors.successBackground }]}
            >
              <Ionicons name="add" size={18} color={colors.success} />
            </Pressable>
          </View>
        </Animated.View>
      ) : null}

      <View style={styles.field}>
        <Text style={[typography.caption, { color: colors.textMuted, fontWeight: isSheet ? '700' : '400', letterSpacing: isSheet ? 1.1 : 0 }]}>RECORDATORIOS</Text>
        {reminderDrafts.map((draft, index) => (
          <ReminderRow
            key={draft.id ?? `new-${index}`}
            value={draft}
            habitDaysOfWeek={daysOfWeek}
            onChange={(next) => updateReminderDraft(index, next)}
            onRemove={() => removeReminderDraft(index)}
            autoOpenTimePicker={autoOpenIndex === index}
            onAutoOpenHandled={() => setAutoOpenIndex(null)}
            appearance={isSheet ? 'sheet' : 'default'}
          />
        ))}
        <Pressable onPress={handleAddReminder} style={[styles.addReminderButton, isSheet ? styles.sheetAddReminderButton : null, { borderColor: isSheet ? colors.border : colors.success }]}>
          <Ionicons name={isSheet ? 'add' : 'add-circle-outline'} size={18} color={isSheet ? colors.textMuted : colors.success} />
          <Text style={[typography.body, { color: isSheet ? colors.textMuted : colors.success, fontSize: isSheet ? 13 : 16, fontWeight: isSheet ? '600' : '400' }]}>{isSheet ? 'Otro recordatorio' : 'Añadir recordatorio'}</Text>
        </Pressable>
      </View>
      {isSheet ? (
        <Pressable onPress={handleSubmit} disabled={!canSubmit} style={{ alignItems: 'center', backgroundColor: canSubmit ? colors.text : colors.surface, borderRadius: 14, justifyContent: 'center', minHeight: 49, marginTop: 6 }}>
          <Text style={{ color: canSubmit ? colors.background : colors.textMuted, fontSize: 14, fontWeight: '800' }}>{submitLabel}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  sheetFieldHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  nameTextBlock: {
    flex: 1,
    gap: 2,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconColorCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmented: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 4,
    gap: 4,
  },
  sheetSegmented: {
    borderRadius: 14,
    borderWidth: 0,
    minHeight: 48,
    padding: 4,
  },
  segment: {
    zIndex: 1,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  sheetSegment: {
    borderRadius: 10,
    minHeight: 40,
    paddingVertical: 0,
  },
  segmentIndicator: {
    bottom: 4,
    left: 4,
    position: 'absolute',
    top: 4,
    borderRadius: radii.sm,
  },
  sheetSegmentIndicator: {
    borderRadius: 10,
  },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  targetButton: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetCenter: {
    alignItems: 'center',
  },
  addReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
  },
  sheetAddReminderButton: {
    borderRadius: 14,
    minHeight: 73,
    paddingVertical: 0,
  },
});
