import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabitDetail } from '../../src/hooks/useHabitDetail';
import { softDeleteHabit, updateHabit } from '../../src/state/habits$';
import { createReminder, softDeleteReminder, updateReminder } from '../../src/state/reminders$';
import { diffReminderDrafts, type ReminderDraft } from '../../src/domain/reminders';
import { weekOrder } from '../../src/domain/scheduling';
import { weekdayLetter } from '../../src/lib/format';
import { useThemeMode } from '../../src/theme/useThemeColors';
import { HabitSymbol } from '../../src/components/HabitSymbol';
import { ReminderRow } from '../../src/components/ReminderRow';
import { refreshPermissionStatusAsync, requestPermissionAsync } from '../../src/notifications/permissions';
import type { HistoryDay } from '../../src/domain/history';
import type { Reminder, Weekday } from '../../src/domain/types';

const screenColors = {
  light: {
    background: '#FCF9F5',
    text: '#26221E',
    muted: '#746D64',
    border: '#E4DDD4',
    done: '#527652',
    partial: '#E4ECE0',
    empty: '#F0ECE4',
    future: '#DDD5C9',
    accent: '#B84D2A',
    iconBackground: '#F7EDD8',
    sheet: '#FFFCF8',
    sheetSurface: '#F3EDE4',
    grabber: '#DED6CA',
    sheetAction: '#211F1B',
    sheetActionText: '#FBF8F3',
  },
  dark: {
    background: '#1D1D16',
    text: '#F3EFE8',
    muted: '#AEA79B',
    border: '#454136',
    done: '#A8C3A2',
    partial: '#203720',
    empty: '#302D23',
    future: '#554F40',
    accent: '#E8875C',
    iconBackground: '#3A2D0D',
    sheet: '#201F18',
    sheetSurface: '#302D23',
    grabber: '#514C40',
    sheetAction: '#F8F4ED',
    sheetActionText: '#211F1B',
  },
} as const;

const ROW_LABELS = ['Esta', 'Semana 2', 'Semana 3'];
const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'] as const;

type DetailSheet = 'reminders' | 'days' | 'delete';

function currentTimeRounded(): string {
  const now = new Date();
  const minutes = Math.round(now.getMinutes() / 5) * 5;
  const hours = (now.getHours() + Math.floor(minutes / 60)) % 24;
  return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
}

function HabitDetailSheet({
  colors,
  daysOfWeek,
  displayReminders,
  habitName,
  onClose,
  onDelete,
  onSaveDays,
  onSaveReminders,
  currentStreak,
  type,
}: {
  colors: typeof screenColors.light | typeof screenColors.dark;
  currentStreak: number;
  daysOfWeek: Weekday[];
  displayReminders: Reminder[];
  habitName: string;
  onClose: () => void;
  onDelete: () => void;
  onSaveDays: (days: Weekday[]) => void;
  onSaveReminders: (drafts: ReminderDraft[]) => void;
  type: DetailSheet | null;
}) {
  const insets = useSafeAreaInsets();
  const [reminderDrafts, setReminderDrafts] = useState<ReminderDraft[]>([]);
  const [daysDraft, setDaysDraft] = useState<Weekday[]>(daysOfWeek);
  const [autoOpenIndex, setAutoOpenIndex] = useState<number | null>(null);
  const translateY = useSharedValue(420);

  useEffect(() => {
    if (type) {
      translateY.value = 420;
      translateY.value = withTiming(0, { duration: 240 });
    }
    if (type === 'reminders') {
      setReminderDrafts(displayReminders.map((reminder) => ({
        id: reminder.id,
        time: reminder.time,
        daysOfWeek: reminder.daysOfWeek,
        enabled: reminder.enabled,
      })));
      setAutoOpenIndex(null);
    }
    if (type === 'days') setDaysDraft(daysOfWeek);
    // Se reinicia únicamente al abrir la hoja; los cambios locales no deben sobrescribirse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const isReminder = type === 'reminders';
  const isDelete = type === 'delete';

  async function addReminder() {
    const status = await refreshPermissionStatusAsync();
    if (status === 'undetermined') await requestPermissionAsync();
    setReminderDrafts((drafts) => {
      setAutoOpenIndex(drafts.length);
      return [...drafts, { time: currentTimeRounded(), daysOfWeek: null, enabled: true }];
    });
  }

  function closeWithAnimation() {
    translateY.value = withTiming(420, { duration: 210 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  }

  const dismissGesture = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetX([-24, 24])
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 850) {
        translateY.value = withTiming(420, { duration: 210 }, (finished) => {
          if (finished) runOnJS(onClose)();
        });
      } else {
        translateY.value = withTiming(0, { duration: 180 });
      }
    });
  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!type) return null;

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={closeWithAnimation}
      statusBarTranslucent
      transparent
      visible
    >
      <View style={StyleSheet.absoluteFill}>
        <Pressable
          accessibilityLabel="Cerrar modal"
          onPress={closeWithAnimation}
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(20, 18, 14, 0.62)' }]}
        />
        <GestureDetector gesture={dismissGesture}>
          <Animated.View
          style={[{
            backgroundColor: colors.sheet,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            bottom: 0,
            gap: 12,
            left: 0,
            paddingBottom: Math.max(insets.bottom, 16) + 6,
            paddingHorizontal: 19,
            paddingTop: 10,
            position: 'absolute',
            right: 0,
          }, sheetAnimatedStyle]}
        >
          <View style={{ alignSelf: 'center', backgroundColor: colors.grabber, borderRadius: 999, height: 4, width: 36 }} />
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 14, paddingBottom: 3, paddingTop: 10 }}>
            <View style={{ alignItems: 'center', backgroundColor: colors.iconBackground, borderRadius: 999, height: 48, justifyContent: 'center', width: 48 }}>
              <Ionicons color={colors.accent} name={isDelete ? 'trash-outline' : isReminder ? 'notifications-outline' : 'calendar-outline'} size={22} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 21 }}>
                {isDelete ? `¿Eliminar "${habitName}"?` : isReminder ? 'Recordatorios' : 'Días del hábito'}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12.5, lineHeight: 17 }}>
                {isDelete
                  ? `Perderás tu racha de ${currentStreak} día${currentStreak === 1 ? '' : 's'}. Esta acción no se puede deshacer.`
                  : isReminder
                    ? 'Horarios en los que te ayudaremos a recordarlo.'
                    : 'Días en los que este hábito aparece en tu agenda.'}
              </Text>
            </View>
          </View>

          {isDelete ? null : isReminder ? (
            <View style={{ gap: 8 }}>
              {reminderDrafts.length > 0 ? reminderDrafts.map((draft, index) => (
                <ReminderRow
                  appearance="sheet"
                  autoOpenTimePicker={autoOpenIndex === index}
                  habitDaysOfWeek={daysOfWeek}
                  key={draft.id ?? `new-${index}`}
                  onAutoOpenHandled={() => setAutoOpenIndex(null)}
                  onChange={(next) => setReminderDrafts((drafts) => drafts.map((item, itemIndex) => itemIndex === index ? next : item))}
                  onRemove={() => setReminderDrafts((drafts) => drafts.filter((_, itemIndex) => itemIndex !== index))}
                  showRemoveInSheet
                  value={draft}
                />
              )) : (
                <View style={{ backgroundColor: colors.sheetSurface, borderRadius: 14, padding: 14 }}>
                <Text style={{ color: colors.muted, fontSize: 13 }}>Este hábito todavía no tiene recordatorios.</Text>
                </View>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={addReminder}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  borderColor: colors.border,
                  borderRadius: 14,
                  borderWidth: 1,
                  flexDirection: 'row',
                  gap: 7,
                  justifyContent: 'center',
                  minHeight: 47,
                  opacity: pressed ? 0.68 : 1,
                })}
              >
                <Ionicons color={colors.muted} name="add" size={18} />
                <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '700' }}>Añadir recordatorio</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 5 }}>
              {weekOrder(1).map((day) => {
                const selected = daysDraft.includes(day);
                return (
                  <Pressable
                    accessibilityLabel={`${selected ? 'Quitar' : 'Añadir'} ${DAY_LABELS[day]}`}
                    accessibilityRole="button"
                    key={day}
                    onPress={() => setDaysDraft((current) => current.includes(day)
                      ? current.filter((selectedDay) => selectedDay !== day)
                      : [...current, day])}
                    style={{
                      alignItems: 'center',
                      backgroundColor: selected ? colors.text : colors.sheetSurface,
                      borderRadius: 11,
                      flex: 1,
                      height: 42,
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: selected ? colors.background : colors.muted, fontSize: 12, fontWeight: selected ? '800' : '500' }}>
                      {DAY_LABELS[day]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={!isDelete && !isReminder && daysDraft.length === 0}
            onPress={isDelete ? onDelete : isReminder ? () => onSaveReminders(reminderDrafts) : () => onSaveDays(daysDraft)}
            style={({ pressed }) => ({
              alignItems: 'center',
              backgroundColor: !isDelete && !isReminder && daysDraft.length === 0 ? colors.sheetSurface : isDelete ? colors.accent : colors.sheetAction,
              borderRadius: 14,
              justifyContent: 'center',
              minHeight: 49,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: colors.sheetActionText, fontSize: 14, fontWeight: '800' }}>
              {isDelete ? 'Eliminar hábito' : isReminder ? 'Guardar recordatorios' : 'Guardar días'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={closeWithAnimation}
            style={({ pressed }) => ({
              alignItems: 'center',
              backgroundColor: colors.sheetSurface,
              borderRadius: 14,
              justifyContent: 'center',
              minHeight: 49,
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>Cancelar</Text>
          </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

function targetLabel(target: number): string {
  return target === 1 ? 'una vez al día' : `${target} veces al día`;
}

function HistorySquare({ day, colors }: { day: HistoryDay; colors: (typeof screenColors)['light'] | (typeof screenColors)['dark'] }) {
  const isDone = day.ratio >= 1;
  const isPartial = day.ratio > 0 && day.ratio < 1;
  return (
    <View
      style={{
        backgroundColor: day.isFuture ? 'transparent' : isDone ? colors.done : isPartial ? colors.partial : colors.empty,
        borderColor: day.isFuture ? colors.future : 'transparent',
        borderRadius: 6,
        borderStyle: day.isFuture ? 'dashed' : 'solid',
        borderWidth: day.isFuture ? 1 : 0,
        height: 33,
        opacity: day.isFuture ? 0.72 : 1,
        width: 33,
      }}
    />
  );
}

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useHabitDetail(id);
  const mode = useThemeMode();
  const colors = screenColors[mode];
  const [activeSheet, setActiveSheet] = useState<DetailSheet | null>(null);

  useEffect(() => {
    if (!detail) router.back();
  }, [detail]);

  if (!detail) return null;

  const { habit, currentStreak, bestStreak, displayReminders, history, weekStartsOn, reminderTimesLabel, daysSummary, targetPerDay } = detail;
  const scheduleParts = [daysSummary, reminderTimesLabel || null, targetLabel(targetPerDay)].filter((part): part is string => !!part);
  const rows = [history.days.slice(14, 21), history.days.slice(7, 14), history.days.slice(0, 7)];
  const weekdays = weekOrder(weekStartsOn);

  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{ gap: 24, paddingBottom: 42, paddingHorizontal: 21, paddingTop: 43 }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Pressable accessibilityLabel="Volver" hitSlop={10} onPress={() => router.back()} style={{ alignItems: 'center', backgroundColor: mode === 'dark' ? '#302E24' : '#F2EEE6', borderRadius: 999, height: 40, justifyContent: 'center', width: 40 }}>
            <Ionicons color={colors.text} name="chevron-back" size={21} />
          </Pressable>
          <Pressable accessibilityLabel="Editar hábito" hitSlop={10} onPress={() => router.push(`/habit/${id}/edit`)}>
            <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '800' }}>Editar</Text>
          </Pressable>
        </View>

        <View style={{ alignItems: 'flex-start', flexDirection: 'row', gap: 14, marginTop: -7 }}>
          <View style={{ alignItems: 'center', backgroundColor: colors.iconBackground, borderRadius: 14, height: 54, justifyContent: 'center', width: 54 }}>
            <HabitSymbol color={habit.color} icon={habit.icon} size={25} />
          </View>
          <View style={{ flex: 1, gap: 2, paddingTop: 1 }}>
            <Text numberOfLines={1} style={{ color: colors.text, fontFamily: 'serif', fontSize: 29, lineHeight: 33 }}>{habit.name}</Text>
            <Text numberOfLines={1} style={{ color: colors.muted, fontSize: 12 }}>{scheduleParts.join(' · ')}</Text>
          </View>
        </View>

        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 44, fontVariant: ['tabular-nums'], lineHeight: 46 }}>{currentStreak}</Text>
            <Text style={{ color: colors.muted, fontSize: 11 }}>días seguidos</Text>
          </View>
          <View style={{ backgroundColor: colors.border, height: 58, width: 1 }} />
          <View style={{ flex: 1, gap: 1, paddingLeft: 29 }}>
            <Text style={{ color: colors.muted, fontFamily: 'serif', fontSize: 44, fontVariant: ['tabular-nums'], lineHeight: 46 }}>{bestStreak}</Text>
            <Text style={{ color: colors.muted, fontSize: 11 }}>tu récord</Text>
          </View>
        </View>

        <View style={{ gap: 14 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }}>ÚLTIMAS 3 SEMANAS</Text>
          <View style={{ gap: 7 }}>
            {rows.map((week, index) => (
              <View key={ROW_LABELS[index]} style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
                <Text style={{ color: colors.muted, fontSize: 11, width: 68 }}>{ROW_LABELS[index]}</Text>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                  {week.map((day) => <HistorySquare day={day} colors={colors} key={day.date} />)}
                </View>
              </View>
            ))}
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
              <View style={{ width: 68 }} />
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                {weekdays.map((weekday) => <Text key={weekday} style={{ color: colors.muted, fontSize: 10, textAlign: 'center', width: 33 }}>{weekdayLetter(weekday)}</Text>)}
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {[
              { color: colors.done, label: 'Hecho' },
              { color: colors.partial, label: 'A medias' },
              { color: colors.empty, label: 'Sin hacer' },
              { color: 'transparent', label: 'Por venir', outlined: true },
            ].map((item) => (
              <View key={item.label} style={{ alignItems: 'center', flexDirection: 'row', gap: 4 }}>
                <View style={{ backgroundColor: item.color, borderColor: item.outlined ? colors.future : 'transparent', borderRadius: 3, borderStyle: item.outlined ? 'dashed' : 'solid', borderWidth: item.outlined ? 1 : 0, height: 9, width: 9 }} />
                <Text style={{ color: colors.muted, fontSize: 10 }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ borderTopColor: colors.border, borderTopWidth: 1 }}>
          <Pressable accessibilityLabel="Ver recordatorios" onPress={() => setActiveSheet('reminders')} style={{ alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 14, minHeight: 73 }}>
            <Ionicons color={colors.muted} name="notifications-outline" size={19} />
            <Text style={{ color: colors.text, flex: 1, fontSize: 15 }}>Recordatorio</Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>{reminderTimesLabel || 'Sin recordatorio'}</Text>
            <Ionicons color={colors.muted} name="chevron-forward" size={17} />
          </Pressable>
          <Pressable accessibilityLabel="Ver días del hábito" onPress={() => setActiveSheet('days')} style={{ alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 14, minHeight: 73 }}>
            <Ionicons color={colors.muted} name="calendar-outline" size={19} />
            <Text style={{ color: colors.text, flex: 1, fontSize: 15 }}>Días</Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>{daysSummary}</Text>
            <Ionicons color={colors.muted} name="chevron-forward" size={17} />
          </Pressable>
          <Pressable accessibilityLabel="Eliminar hábito" onPress={() => setActiveSheet('delete')} style={{ alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 14, minHeight: 73 }}>
            <Ionicons color={colors.accent} name="trash-outline" size={19} />
            <Text style={{ color: colors.accent, fontSize: 15 }}>Eliminar hábito</Text>
          </Pressable>
        </View>
      </ScrollView>
      <HabitDetailSheet
        colors={colors}
        currentStreak={currentStreak}
        daysOfWeek={habit.daysOfWeek}
        displayReminders={displayReminders}
        habitName={habit.name}
        onClose={() => setActiveSheet(null)}
        onDelete={() => {
          setActiveSheet(null);
          softDeleteHabit(id);
          router.back();
        }}
        onSaveDays={(days) => {
          updateHabit(id, { daysOfWeek: days });
          setActiveSheet(null);
        }}
        onSaveReminders={(drafts) => {
          const { toCreate, toDeleteIds, toUpdate } = diffReminderDrafts(id, displayReminders, drafts);
          toCreate.forEach(createReminder);
          toUpdate.forEach(({ id: reminderId, patch }) => updateReminder(reminderId, patch));
          toDeleteIds.forEach(softDeleteReminder);
          setActiveSheet(null);
        }}
        type={activeSheet}
      />
    </View>
  );
}
