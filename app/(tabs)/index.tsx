import { useEffect } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { Easing, FadeIn, FadeInDown, FadeOutUp, LinearTransition, ZoomIn, interpolateColor, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useToday, type TodayHabitEntry } from '../../src/hooks/useToday';
import { addCompletion, undoOneCompletion } from '../../src/state/completions$';
import { currentUserId } from '../../src/state/session$';
import { isDone } from '../../src/domain/completion';
import { todayLocalDateString } from '../../src/lib/dates';
import { CircularProgress } from '../../src/components/CircularProgress';
import { HabitEmptyState } from '../../src/components/HabitEmptyState';
import { useThemeMode } from '../../src/theme/useThemeColors';

const screenColors = {
  light: {
    background: '#FBF8F3',
    card: '#F8E8DD',
    divider: '#E6DDD3',
    text: '#28241F',
    muted: '#7B746C',
    subtle: '#AAA198',
    accent: '#BE4D2B',
    accentSoft: '#F1D5C5',
    complete: '#567957',
    progressTrack: '#E6DED4',
    action: '#211F1B',
    actionText: '#FBF8F3',
    illustrationBorder: '#E7DED2',
    illustrationIcon: '#567957',
  },
  dark: {
    background: '#1D1D16',
    card: '#472617',
    divider: '#49453A',
    text: '#F4EFE7',
    muted: '#AAA398',
    subtle: '#777268',
    accent: '#EE7750',
    accentSoft: '#6B3924',
    complete: '#A8C3A3',
    progressTrack: '#464238',
    action: '#F9F5EE',
    actionText: '#211F1B',
    illustrationBorder: '#3B382E',
    illustrationIcon: '#9DBD94',
  },
} as const;

const WEEKDAYS = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'] as const;
const MONTHS = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'] as const;

function toggle(entry: TodayHabitEntry) {
  const today = todayLocalDateString();
  const firstReminder = entry.reminders[0]?.reminder;

  if (entry.done) {
    undoOneCompletion(entry.habit.id, today, firstReminder?.id);
  } else {
    addCompletion(entry.habit.id, currentUserId()!, today, firstReminder?.id);
  }
}

function entryStatus(entry: TodayHabitEntry) {
  const time = entry.reminders[0]?.reminder.time;
  if (entry.done) return `${entry.count} de ${entry.target} · hecho`;
  return time ? `Pendiente · ${time}` : `Pendiente · ${entry.target} paso${entry.target === 1 ? '' : 's'}`;
}

function CompletionButton({
  completed,
  onPress,
  size,
  iconSize,
  colors,
  accessibilityLabel,
  disabled = false,
  showCheckWhenPending = false,
}: {
  completed: boolean;
  onPress: () => void;
  size: number;
  iconSize: number;
  colors: typeof screenColors.light | typeof screenColors.dark;
  accessibilityLabel: string;
  disabled?: boolean;
  showCheckWhenPending?: boolean;
}) {
  const progress = useSharedValue(completed ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(completed ? 1 : 0, { duration: 220 });
  }, [completed, progress]);

  const controlStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.background, colors.complete]),
    borderColor: interpolateColor(progress.value, [0, 1], [colors.accent, colors.complete]),
    transform: [{ scale: 0.94 + progress.value * 0.06 }],
  }));

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={disabled ? 0 : 10}
      onPress={onPress}
    >
      <Animated.View
        style={[
          {
            alignItems: 'center',
            borderRadius: 999,
            borderWidth: 2,
            height: size,
            justifyContent: 'center',
            width: size,
          },
          controlStyle,
        ]}
      >
        {completed || showCheckWhenPending ? (
          <Animated.View entering={ZoomIn.duration(180)} key={completed ? 'done-check' : 'pending-check'}>
            <Ionicons color={completed ? colors.background : colors.accent} name="checkmark" size={iconSize} />
          </Animated.View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

function PulsingAccentDot({ color }: { color: string }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    const timing = { duration: 1350, easing: Easing.inOut(Easing.quad) };
    scale.value = withRepeat(
      withSequence(withTiming(1.24, timing), withTiming(1, timing)),
      -1,
      false
    );
  }, [scale]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.82 + (scale.value - 1) * 0.75,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ alignItems: 'center', height: 14, justifyContent: 'center', width: 14 }}>
      <Animated.View style={[{ backgroundColor: color, borderRadius: 99, height: 12, width: 12 }, pulseStyle]} />
    </View>
  );
}

function TimelineRow({ entry, isLast }: { entry: TodayHabitEntry; isLast: boolean }) {
  const mode = useThemeMode();
  const colors = screenColors[mode];
  const completed = isDone(entry.count, entry.target);

  return (
    <Animated.View layout={LinearTransition.duration(220)} style={{ flexDirection: 'row', minHeight: 70 }}>
      <View style={{ alignItems: 'center', width: 22 }}>
        <CompletionButton
          accessibilityLabel={`${completed ? 'Desmarcar' : 'Marcar'} ${entry.habit.name}`}
          colors={colors}
          completed={completed}
          iconSize={14}
          onPress={() => toggle(entry)}
          size={22}
        />
        {!isLast ? <View style={{ backgroundColor: colors.divider, flex: 1, marginVertical: 3, width: 1 }} /> : null}
      </View>

      <Pressable
        accessibilityLabel={`${completed ? 'Desmarcar' : 'Marcar'} ${entry.habit.name}`}
        onPress={() => toggle(entry)}
        style={{ flex: 1, flexDirection: 'row', gap: 12, paddingBottom: 15, paddingLeft: 12 }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              color: completed ? colors.muted : colors.text,
              fontSize: 16,
              fontWeight: '700',
              textDecorationLine: completed ? 'line-through' : 'none',
            }}
          >
            {entry.habit.name}
          </Text>
          <Text style={{ color: completed ? colors.muted : colors.subtle, fontSize: 12, fontWeight: '500' }}>
            {entryStatus(entry)}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: entry.habit.color,
            borderRadius: 2,
            height: 8,
            marginTop: 7,
            opacity: completed ? 0.75 : 1,
            width: 8,
          }}
        />
      </Pressable>
    </Animated.View>
  );
}

export default function TodayScreen() {
  const { totalActive, pending, completed, entries } = useToday();
  const mode = useThemeMode();
  const colors = screenColors[mode];
  const scheduledTotal = entries.length;
  const doneCount = completed.length;
  const pendingCount = pending.length;
  const progress = scheduledTotal > 0 ? doneCount / scheduledTotal : 0;
  const allDone = scheduledTotal > 0 && doneCount === scheduledTotal;
  const featured = pending[0] ?? entries[0];
  const now = new Date();
  const dateLabel = `${WEEKDAYS[now.getDay()]} ${now.getDate()} DE ${MONTHS[now.getMonth()]}`;

  if (totalActive === 0 || scheduledTotal === 0) {
    const hasHabits = totalActive > 0;

    return (
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }}>
        <HabitEmptyState
          actionLabel={hasHabits ? 'Crear otro hábito' : 'Crear tu primer hábito'}
          colors={colors}
          description={
            hasHabits
              ? 'Hoy no tienes nada programado.\nDisfruta la pausa o añade un hábito para hoy.'
              : 'Los pequeños pasos de hoy se convierten\nen los cambios duraderos de mañana.'
          }
          heading="Hoy"
          icon={hasHabits ? 'sunny-outline' : 'calendar-outline'}
          onAction={() => router.push('/habit/new')}
          subtitle={dateLabel}
          title={hasHabits ? 'Todo en calma por hoy' : 'Tu día empieza aquí'}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ gap: 22, paddingBottom: 94, paddingHorizontal: 20, paddingTop: 14 }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <Text style={{ color: colors.subtle, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 }}>
              {dateLabel}
            </Text>
            <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 42, lineHeight: 46 }}>Hoy</Text>
            <Text style={{ color: colors.muted, fontSize: 14, fontWeight: '500' }}>
              {pendingCount === 0 ? '¡Todo listo por hoy!' : `Te quedan ${pendingCount} paso${pendingCount === 1 ? '' : 's'}.`}
            </Text>
          </View>
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
            <CircularProgress color={colors.complete} progress={progress} size={56} strokeWidth={4} trackColor={colors.progressTrack} />
            <Animated.Text entering={FadeIn.duration(160)} key={`${doneCount}-${scheduledTotal}`} style={{ color: colors.text, fontSize: 17, fontVariant: ['tabular-nums'], fontWeight: '700', position: 'absolute' }}>
              {doneCount}/{scheduledTotal}
            </Animated.Text>
          </View>
        </View>

        {featured ? (
          <Animated.View
            entering={FadeInDown.duration(220)}
            exiting={FadeOutUp.duration(180)}
            key={featured.habit.id}
            layout={LinearTransition.duration(220)}
            style={{
              alignItems: 'center',
              backgroundColor: colors.card,
              borderCurve: 'continuous',
              borderRadius: 21,
              flexDirection: 'row',
              gap: 12,
              padding: 15,
            }}
          >
            <PulsingAccentDot color={colors.accent} />
            {allDone ? (
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: colors.complete, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 }}>DÍA COMPLETADO</Text>
                <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 25 }}>¡Has cumplido por hoy!</Text>
              </View>
            ) : (
              <Pressable
                accessibilityLabel={`${featured.done ? 'Desmarcar' : 'Marcar'} ${featured.habit.name}`}
                onPress={() => toggle(featured)}
                style={{ flex: 1, gap: 2 }}
              >
                <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 }}>CUANDO QUIERAS</Text>
                <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 25 }}>{featured.habit.name}</Text>
              </Pressable>
            )}
            <CompletionButton
              accessibilityLabel={allDone ? 'Todos los hábitos completados' : `${featured.done ? 'Desmarcar' : 'Marcar'} ${featured.habit.name}`}
              colors={colors}
              completed={allDone || featured.done}
              disabled={allDone}
              iconSize={27}
              onPress={() => toggle(featured)}
              showCheckWhenPending
              size={54}
            />
          </Animated.View>
        ) : null}

        <View style={{ gap: 17 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 }}>TU DÍA</Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>
              {doneCount} hechos · {pendingCount} pendientes
            </Text>
          </View>
          <View>{entries.map((entry, index) => <TimelineRow entry={entry} isLast={index === entries.length - 1} key={entry.habit.id} />)}</View>
        </View>

      </ScrollView>
      <Pressable
        accessibilityLabel="Agregar hábito"
        hitSlop={10}
        onPress={() => router.push('/habit/new')}
        style={{
          alignItems: 'center',
          backgroundColor: mode === 'dark' ? '#F8F4ED' : '#201E1A',
          borderRadius: 999,
          bottom: 18,
          boxShadow: mode === 'dark' ? '0 6px 18px rgba(0, 0, 0, 0.26)' : '0 6px 18px rgba(32, 30, 26, 0.2)',
          height: 58,
          justifyContent: 'center',
          position: 'absolute',
          right: 20,
          width: 58,
        }}
      >
        <Ionicons color={mode === 'dark' ? '#201E1A' : '#F8F4ED'} name="add" size={29} />
      </Pressable>
    </SafeAreaView>
  );
}
