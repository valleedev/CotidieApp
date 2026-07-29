import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useToday, type TodayHabitEntry } from '../../src/hooks/useToday';
import { addCompletion, undoOneCompletion } from '../../src/state/completions$';
import { currentUserId } from '../../src/state/session$';
import { isDone } from '../../src/domain/completion';
import { todayLocalDateString } from '../../src/lib/dates';
import { CircularProgress } from '../../src/components/CircularProgress';
import { EmptyState } from '../../src/components/EmptyState';
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

function TimelineRow({ entry }: { entry: TodayHabitEntry }) {
  const mode = useThemeMode();
  const colors = screenColors[mode];
  const completed = isDone(entry.count, entry.target);

  return (
    <View style={{ flexDirection: 'row', minHeight: 70 }}>
      <View style={{ alignItems: 'center', width: 22 }}>
        <Pressable
          accessibilityLabel={`${completed ? 'Desmarcar' : 'Marcar'} ${entry.habit.name}`}
          hitSlop={10}
          onPress={() => toggle(entry)}
          style={{
            alignItems: 'center',
            backgroundColor: completed ? colors.complete : colors.background,
            borderColor: completed ? colors.complete : colors.accent,
            borderRadius: 999,
            borderWidth: 2,
            height: 22,
            justifyContent: 'center',
            width: 22,
          }}
        >
          {completed ? <Ionicons color={colors.background} name="checkmark" size={14} /> : null}
        </Pressable>
        <View style={{ backgroundColor: colors.divider, flex: 1, marginVertical: 3, width: 1 }} />
      </View>

      <Pressable
        onPress={() => router.push(`/habit/${entry.habit.id}`)}
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
    </View>
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
  const featured = pending[0] ?? entries[0];
  const currentStreak = Math.max(0, ...entries.map((entry) => entry.currentStreak));
  const now = new Date();
  const dateLabel = `${WEEKDAYS[now.getDay()]} ${now.getDate()} DE ${MONTHS[now.getMonth()]}`;

  if (totalActive === 0 || scheduledTotal === 0) {
    return (
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }}>
        <EmptyState
          logo
          title="No tienes hábitos para hoy"
          description="Agrega tu primer hábito para empezar a construir tu racha."
          actionLabel="Agregar hábito"
          onAction={() => router.push('/habit/new')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ gap: 22, paddingBottom: 20, paddingHorizontal: 20, paddingTop: 14 }}
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
            <Text style={{ color: colors.text, fontSize: 17, fontVariant: ['tabular-nums'], fontWeight: '700', position: 'absolute' }}>
              {doneCount}/{scheduledTotal}
            </Text>
          </View>
        </View>

        {featured ? (
          <View
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
            <View style={{ backgroundColor: featured.habit.color, borderRadius: 99, height: 14, width: 14 }} />
            <Pressable onPress={() => router.push(`/habit/${featured.habit.id}`)} style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 }}>CUANDO QUIERAS</Text>
              <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 25 }}>{featured.habit.name}</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={`${featured.done ? 'Desmarcar' : 'Marcar'} ${featured.habit.name}`}
              hitSlop={8}
              onPress={() => toggle(featured)}
              style={{
                alignItems: 'center',
                borderColor: featured.done ? colors.complete : colors.accent,
                borderRadius: 999,
                borderWidth: 2,
                height: 54,
                justifyContent: 'center',
                width: 54,
              }}
            >
              <Ionicons color={featured.done ? colors.complete : colors.accent} name="checkmark" size={27} />
            </Pressable>
          </View>
        ) : null}

        <View style={{ gap: 17 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 }}>TU DÍA</Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>
              {doneCount} hechos · {pendingCount} pendientes
            </Text>
          </View>
          <View>{entries.map((entry) => <TimelineRow entry={entry} key={entry.habit.id} />)}</View>
        </View>

        <View style={{ alignItems: 'center', borderTopColor: colors.divider, borderTopWidth: 1, flexDirection: 'row', gap: 8, paddingTop: 16 }}>
          <Ionicons color={colors.accent} name="flame-outline" size={17} />
          <Text style={{ color: colors.muted, flex: 1, fontSize: 13 }}>{currentStreak} días seguidos</Text>
          <Pressable
            accessibilityLabel="Agregar hábito"
            onPress={() => router.push('/habit/new')}
            style={{ alignItems: 'center', backgroundColor: mode === 'dark' ? '#F8F4ED' : '#201E1A', borderRadius: 999, flexDirection: 'row', gap: 7, paddingHorizontal: 17, paddingVertical: 10 }}
          >
            <Ionicons color={mode === 'dark' ? '#201E1A' : '#F8F4ED'} name="add" size={18} />
            <Text style={{ color: mode === 'dark' ? '#201E1A' : '#F8F4ED', fontSize: 14, fontWeight: '800' }}>Hábito</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
