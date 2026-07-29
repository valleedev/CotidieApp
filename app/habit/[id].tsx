import { useEffect } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHabitDetail } from '../../src/hooks/useHabitDetail';
import { softDeleteHabit } from '../../src/state/habits$';
import { weekOrder } from '../../src/domain/scheduling';
import { weekdayLetter } from '../../src/lib/format';
import { useThemeMode } from '../../src/theme/useThemeColors';
import { HabitSymbol } from '../../src/components/HabitSymbol';
import type { HistoryDay } from '../../src/domain/history';

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
  },
} as const;

const ROW_LABELS = ['Esta', 'Semana 2', 'Semana 3'];

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

  useEffect(() => {
    if (!detail) router.back();
  }, [detail]);

  if (!detail) return null;

  const { habit, currentStreak, bestStreak, history, weekStartsOn, reminderTimesLabel, daysSummary, targetPerDay } = detail;
  const scheduleParts = [daysSummary, reminderTimesLabel || null, targetLabel(targetPerDay)].filter((part): part is string => !!part);
  const rows = [history.days.slice(14, 21), history.days.slice(7, 14), history.days.slice(0, 7)];
  const weekdays = weekOrder(weekStartsOn);

  function handleArchive() {
    Alert.alert('Archivar hábito', `¿Quieres archivar "${habit.name}"? Podrás conservar su historial, pero dejará de aparecer entre tus hábitos activos.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Archivar',
        style: 'destructive',
        onPress: () => {
          softDeleteHabit(id);
          router.back();
        },
      },
    ]);
  }

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
          <Pressable accessibilityLabel="Editar recordatorio" onPress={() => router.push(`/habit/${id}/edit`)} style={{ alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 14, minHeight: 73 }}>
            <Ionicons color={colors.muted} name="notifications-outline" size={19} />
            <Text style={{ color: colors.text, flex: 1, fontSize: 15 }}>Recordatorio</Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>{reminderTimesLabel || 'Sin recordatorio'}</Text>
            <Ionicons color={colors.muted} name="chevron-forward" size={17} />
          </Pressable>
          <Pressable accessibilityLabel="Editar días del hábito" onPress={() => router.push(`/habit/${id}/edit`)} style={{ alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 14, minHeight: 73 }}>
            <Ionicons color={colors.muted} name="calendar-outline" size={19} />
            <Text style={{ color: colors.text, flex: 1, fontSize: 15 }}>Días</Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>{daysSummary}</Text>
            <Ionicons color={colors.muted} name="chevron-forward" size={17} />
          </Pressable>
          <Pressable accessibilityLabel="Archivar hábito" onPress={handleArchive} style={{ alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 14, minHeight: 73 }}>
            <Ionicons color={colors.accent} name="archive-outline" size={19} />
            <Text style={{ color: colors.accent, fontSize: 15 }}>Archivar hábito</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
