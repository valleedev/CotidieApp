import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { use$ } from '@legendapp/state/react';
import Animated, { FadeInDown, LinearTransition, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useProgress } from '../../src/hooks/useProgress';
import { settings$ } from '../../src/state/settings$';
import { completions$ } from '../../src/state/completions$';
import { EmptyState } from '../../src/components/EmptyState';
import { overallConsistency } from '../../src/domain/streaks';
import { weekOrder } from '../../src/domain/scheduling';
import { weekdayLetter } from '../../src/lib/format';
import { useThemeMode } from '../../src/theme/useThemeColors';

const VISIBLE_HABITS = 3;

const screenColors = {
  light: {
    background: '#FCF9F5',
    text: '#25221E',
    muted: '#7A746C',
    subtle: '#AAA39A',
    border: '#E4DDD4',
    track: '#E5DED5',
    green: '#527652',
    greenSoft: '#A9C3A4',
    accent: '#BC4C29',
  },
  dark: {
    background: '#1D1D16',
    text: '#F4F0E8',
    muted: '#AAA398',
    subtle: '#777267',
    border: '#454136',
    track: '#474336',
    green: '#A9C3A4',
    greenSoft: '#A9C3A4',
    accent: '#E78A5C',
  },
} as const;

export default function ProgressScreen() {
  const entries = useProgress();
  const weekStartsOn = use$(settings$.profile.weekStartsOn);
  const completions = Object.values(use$(completions$));
  const mode = useThemeMode();
  const colors = screenColors[mode];
  const [expanded, setExpanded] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterMounted, setFilterMounted] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const filterProgress = useSharedValue(0);
  const filterAnimatedStyle = useAnimatedStyle(() => ({
    opacity: filterProgress.value,
    transform: [
      { translateY: -8 * (1 - filterProgress.value) },
      { scale: 0.98 + 0.02 * filterProgress.value },
    ],
  }));

  const closeFilter = () => {
    setFilterOpen(false);
    filterProgress.value = withTiming(0, { duration: 170 }, (finished) => {
      if (finished) runOnJS(setFilterMounted)(false);
    });
  };

  const toggleFilter = () => {
    if (filterOpen) {
      closeFilter();
      return;
    }
    setFilterMounted(true);
    setFilterOpen(true);
    filterProgress.value = 0;
    filterProgress.value = withTiming(1, { duration: 220 });
  };

  if (entries.length === 0) {
    return (
      <View style={{ backgroundColor: colors.background, flex: 1 }}>
        <EmptyState logo title="Aún no tienes hábitos" actionLabel="Crear hábito" onAction={() => router.push('/habit/new')} />
      </View>
    );
  }

  const selectedHabit = entries.find((entry) => entry.habit.id === selectedHabitId);
  const filteredEntries = selectedHabit ? [selectedHabit] : entries;
  const filterLabel = selectedHabit?.habit.name ?? 'Todos los hábitos';
  const overall = overallConsistency(filteredEntries) ?? 0;
  const consistencyPercentage = Math.round(overall * 100);
  const currentStreak = Math.max(...filteredEntries.map((entry) => entry.currentStreak));
  const bestStreak = Math.max(...filteredEntries.map((entry) => entry.bestStreak));
  const marks = completions.filter((completion) => completion.deletedAt === null && filteredEntries.some((entry) => entry.habit.id === completion.habitId)).length;
  const byConsistency = [...filteredEntries].sort((a, b) => (b.consistency30d ?? 0) - (a.consistency30d ?? 0));
  const visibleEntries = expanded ? byConsistency : byConsistency.slice(0, VISIBLE_HABITS);
  const order = weekOrder(weekStartsOn);
  const days = filteredEntries[0].history.days.slice(-7);

  const weekly = order.map((weekday) => {
    const sourceDay = days.find((day) => day.weekday === weekday);
    const matching = filteredEntries
      .map((entry) => entry.history.days.slice(-7).find((day) => day.weekday === weekday))
      .filter((day): day is NonNullable<typeof day> => !!day && day.scheduled && day.existed && !day.isFuture);
    const ratio = matching.length === 0 ? 0 : matching.reduce((sum, day) => sum + day.ratio, 0) / matching.length;
    return { isFuture: sourceDay?.isFuture ?? false, isToday: sourceDay?.date === days[days.length - 1]?.date, ratio, weekday };
  });

  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ gap: 24, paddingBottom: 20, paddingHorizontal: 23, paddingTop: 36 }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 2 }}>
          <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 37, lineHeight: 42 }}>Progreso</Text>
          <Text style={{ color: colors.muted, fontSize: 14 }}>Últimos 30 días</Text>
        </View>

        <View style={{ gap: 12 }}>
          <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 8 }}>
            <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 64, lineHeight: 61, fontVariant: ['tabular-nums'] }}>
              {consistencyPercentage}
            </Text>
            <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 28, lineHeight: 35 }}>%</Text>
            <Text style={{ color: colors.muted, flex: 1, fontSize: 13, paddingBottom: 7 }}>
              de tus días programados, cumplidos.
            </Text>
          </View>
          <View style={{ backgroundColor: colors.track, borderRadius: 999, height: 6, overflow: 'hidden' }}>
            <View style={{ backgroundColor: colors.green, borderRadius: 999, height: '100%', width: `${consistencyPercentage}%` }} />
          </View>
          <View style={{ flexDirection: 'row' }}>
            {[
              { label: 'racha actual', value: currentStreak },
              { label: 'mejor racha', value: bestStreak },
              { label: 'marcas totales', value: marks },
            ].map((stat) => (
              <View key={stat.label} style={{ flex: 1, gap: 1 }}>
                <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 24, fontVariant: ['tabular-nums'] }}>{stat.value}</Text>
                <Text style={{ color: colors.muted, fontSize: 11 }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: 14 }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 }}>ESTA SEMANA</Text>
            <Pressable
              accessibilityLabel="Filtrar hábitos"
              accessibilityRole="button"
              accessibilityState={{ expanded: filterOpen }}
              onPress={toggleFilter}
              style={{ alignItems: 'center', flexDirection: 'row', gap: 4, paddingVertical: 4 }}
            >
              <Text numberOfLines={1} style={{ color: colors.text, fontSize: 13, maxWidth: 155 }}>{filterLabel}</Text>
              <Ionicons color={colors.muted} name={filterOpen ? 'chevron-up' : 'chevron-down'} size={14} />
            </Pressable>
          </View>
          {filterMounted ? (
            <Animated.View
              layout={LinearTransition.duration(180)}
            >
              <Animated.View
              pointerEvents={filterOpen ? 'auto' : 'none'}
              style={[filterAnimatedStyle, { backgroundColor: mode === 'dark' ? '#29271F' : '#F5F0E9', borderColor: colors.border, borderRadius: 12, borderWidth: 1, overflow: 'hidden' }]}
              >
              {[{ id: null, name: 'Todos los hábitos' }, ...entries.map((entry) => ({ id: entry.habit.id, name: entry.habit.name }))].map((option, index) => {
                const selected = option.id === selectedHabitId;
                return (
                  <Animated.View key={option.id ?? 'all'} entering={FadeInDown.delay(index * 35).duration(190)}>
                    <Pressable
                      accessibilityRole="menuitem"
                      accessibilityState={{ selected }}
                      onPress={() => {
                        setSelectedHabitId(option.id);
                        setExpanded(false);
                        closeFilter();
                      }}
                      style={{ alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: option.id === entries[entries.length - 1]?.habit.id ? 0 : 1, flexDirection: 'row', gap: 9, paddingHorizontal: 13, paddingVertical: 11 }}
                    >
                      <View style={{ backgroundColor: selected ? colors.accent : 'transparent', borderColor: selected ? colors.accent : colors.muted, borderRadius: 999, borderWidth: 1, height: 15, width: 15 }} />
                      <Text style={{ color: colors.text, flex: 1, fontSize: 14 }}>{option.name}</Text>
                      {option.id ? <View style={{ backgroundColor: entries.find((entry) => entry.habit.id === option.id)?.habit.color, borderRadius: 999, height: 8, width: 8 }} /> : null}
                    </Pressable>
                  </Animated.View>
                );
              })}
              </Animated.View>
            </Animated.View>
          ) : null}
          <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 10, height: 145 }}>
            {weekly.map((day) => {
              const height = day.isFuture ? 21 : Math.max(22, Math.round(day.ratio * 128));
              const color = day.isFuture ? colors.track : day.isToday ? colors.accent : colors.green;
              return (
                <View key={day.weekday} style={{ alignItems: 'center', flex: 1, gap: 7 }}>
                  <View style={{ backgroundColor: color, borderRadius: 8, height, width: '100%' }} />
                  <Text
                    style={{
                      color: day.isToday ? colors.text : colors.muted,
                      fontSize: 11,
                      fontWeight: day.isToday ? '800' : '400',
                      textAlign: 'center',
                      width: '100%',
                    }}
                  >
                    {weekdayLetter(day.weekday)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 }}>HÁBITO POR HÁBITO</Text>
          <View>
            {visibleEntries.map((entry, index) => {
              const percentage = Math.round((entry.consistency30d ?? 0) * 100);
              const days = entry.history.days.slice(-7);
              return (
                <Pressable
                  key={entry.habit.id}
                  onPress={() => router.push(`/habit/${entry.habit.id}`)}
                  style={{ borderBottomColor: colors.border, borderBottomWidth: index === visibleEntries.length - 1 ? 0 : 1, flexDirection: 'row', gap: 12, paddingVertical: 11 }}
                >
                  <View style={{ flex: 1, gap: 7 }}>
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>{entry.habit.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 3 }}>
                      {days.map((day) => (
                        <View
                          key={day.date}
                          style={{
                            backgroundColor: day.ratio > 0 ? entry.habit.color : colors.track,
                            borderRadius: 3,
                            height: 12,
                            opacity: day.ratio > 0 ? Math.max(0.45, day.ratio) : 1,
                            width: 12,
                          }}
                        />
                      ))}
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 22, fontVariant: ['tabular-nums'] }}>{percentage}%</Text>
                    <Text style={{ color: colors.muted, fontSize: 11 }}>{entry.currentStreak} días</Text>
                  </View>
                  <Ionicons color={colors.muted} name="chevron-forward" size={17} style={{ alignSelf: 'center' }} />
                </Pressable>
              );
            })}
          </View>
          {byConsistency.length > VISIBLE_HABITS ? (
            <Pressable accessibilityLabel={expanded ? 'Ver menos hábitos' : 'Ver todos los hábitos'} onPress={() => setExpanded((value) => !value)} style={{ alignSelf: 'flex-start', flexDirection: 'row', gap: 3 }}>
              <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '800' }}>{expanded ? 'Ver menos' : `Ver los ${byConsistency.length}`}</Text>
              <Ionicons color={colors.accent} name="chevron-forward" size={15} />
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
