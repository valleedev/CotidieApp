import { Alert, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeOutRight, LinearTransition } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { use$ } from '@legendapp/state/react';
import { useActiveHabits } from '../../src/hooks/useHabits';
import { useProgress } from '../../src/hooks/useProgress';
import { HabitEmptyState } from '../../src/components/HabitEmptyState';
import { reorderHabits, softDeleteHabit } from '../../src/state/habits$';
import { reminders$ } from '../../src/state/reminders$';
import { formatDaysOfWeek } from '../../src/lib/format';
import { useThemeMode } from '../../src/theme/useThemeColors';
import type { Habit } from '../../src/domain/types';

const screenColors = {
  light: {
    background: '#FCF9F5',
    border: '#E4DDD4',
    text: '#25221E',
    muted: '#7A746C',
    subtle: '#AAA39A',
    action: '#211F1B',
    actionText: '#FBF8F3',
    illustrationIcon: '#567957',
    illustrationBorder: '#E7DED2',
    deleteBackground: '#F8E7DD',
    deleteText: '#B74B2B',
  },
  dark: {
    background: '#1D1D16',
    border: '#454136',
    text: '#F4F0E8',
    muted: '#AAA398',
    subtle: '#777267',
    action: '#F9F5EE',
    actionText: '#211F1B',
    illustrationIcon: '#9DBD94',
    illustrationBorder: '#3B382E',
    deleteBackground: '#4D2918',
    deleteText: '#EE8661',
  },
} as const;

export default function HabitsScreen() {
  const habits = useActiveHabits();
  const progress = useProgress();
  const reminders = Object.values(use$(reminders$));
  const mode = useThemeMode();
  const colors = screenColors[mode];

  if (habits.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }}>
        <HabitEmptyState
          actionLabel="Crear tu primer hábito"
          colors={colors}
          description={'Los cambios duraderos empiezan\npequeños. Crea tu primer hábito y hazle\nseguimiento día a día.'}
          heading="Hábitos"
          icon="leaf-outline"
          onAction={() => router.push('/habit/new')}
          subtitle="Aún no has creado ninguno"
          title="Empieza con uno solo"
        />
      </SafeAreaView>
    );
  }

  const bestEntry = progress.reduce((best, entry) => (entry.currentStreak > best.currentStreak ? entry : best), progress[0]);

  function confirmDelete(habit: Habit) {
    Alert.alert('Eliminar hábito', `¿Seguro que quieres eliminar "${habit.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => softDeleteHabit(habit.id) },
    ]);
  }

  function reminderSummaryFor(habit: Habit): string {
    return reminders
      .filter((reminder) => reminder.habitId === habit.id && reminder.deletedAt === null && reminder.enabled)
      .map((reminder) => reminder.time)
      .join(', ');
  }

  function renderItem({ item, drag, isActive }: RenderItemParams<Habit>) {
    const streak = progress.find((entry) => entry.habit.id === item.id)?.currentStreak ?? 0;
    const reminderSummary = reminderSummaryFor(item);
    const subtitle = `${item.category || 'Sin categoría'} · ${formatDaysOfWeek(item.daysOfWeek)}${reminderSummary ? ` · ${reminderSummary}` : ''}`;

    return (
      <Animated.View
        exiting={FadeOutRight.duration(260)}
        layout={LinearTransition.duration(200)}
      >
      <Swipeable
        friction={2}
        renderRightActions={() => (
          <Pressable
            accessibilityLabel={`Eliminar ${item.name}`}
            onPress={() => confirmDelete(item)}
            style={{ alignItems: 'center', justifyContent: 'center', paddingLeft: 12, width: 112 }}
          >
            <View style={{ alignItems: 'center', backgroundColor: colors.deleteBackground, borderRadius: 14, flexDirection: 'row', gap: 6, paddingHorizontal: 14, paddingVertical: 10 }}>
              <Ionicons color={colors.deleteText} name="trash-outline" size={16} />
              <Text style={{ color: colors.deleteText, fontSize: 14, fontWeight: '800' }}>Eliminar</Text>
            </View>
          </Pressable>
        )}
      >
        <View
          style={{
            alignItems: 'center',
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
            flexDirection: 'row',
            gap: 14,
            minHeight: 73,
            opacity: isActive ? 0.65 : 1,
            paddingVertical: 13,
          }}
        >
          <View style={{ backgroundColor: item.color, borderRadius: 999, height: 36, width: 4 }} />
          <Pressable onPress={() => router.push(`/habit/${item.id}`)} style={{ flex: 1, gap: 2 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500' }} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
              {subtitle}
            </Text>
          </Pressable>
          <View style={{ alignItems: 'flex-end', gap: 1 }}>
            <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 19, fontVariant: ['tabular-nums'] }}>
              {streak}
              <Text style={{ color: colors.muted, fontFamily: undefined, fontSize: 12 }}> d</Text>
            </Text>
          </View>
          <Pressable accessibilityLabel={`Reordenar ${item.name}`} hitSlop={10} onLongPress={drag} style={{ padding: 4 }}>
            <Ionicons color={colors.border} name="reorder-three-outline" size={21} />
          </Pressable>
        </View>
      </Swipeable>
      </Animated.View>
    );
  }

  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
      <DraggableFlatList
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 18, paddingHorizontal: 20, paddingTop: 36 }}
        data={habits}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => reorderHabits(data.map((habit) => habit.id))}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={{ gap: 22, paddingBottom: 20 }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ gap: 3 }}>
                <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 37, lineHeight: 42 }}>Hábitos</Text>
                <Text style={{ color: colors.muted, fontSize: 14 }}>
                  {habits.length} activos · arrastra para reordenar
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Crear hábito"
                onPress={() => router.push('/habit/new')}
                style={{ alignItems: 'center', backgroundColor: colors.action, borderRadius: 999, flexDirection: 'row', gap: 7, paddingHorizontal: 16, paddingVertical: 11 }}
              >
                <Ionicons color={colors.actionText} name="add" size={18} />
                <Text style={{ color: colors.actionText, fontSize: 14, fontWeight: '800' }}>Nuevo</Text>
              </Pressable>
            </View>
            <View style={{ borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', gap: 12, paddingVertical: 12 }}>
              <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 38, lineHeight: 42, fontVariant: ['tabular-nums'] }}>
                {bestEntry?.currentStreak ?? 0}
              </Text>
              <View style={{ justifyContent: 'center' }}>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>días seguidos en tu mejor hábito</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {bestEntry ? `${bestEntry.habit.name}, desde el inicio de tu racha.` : 'Sigue construyendo tu racha.'}
                </Text>
              </View>
            </View>
          </View>
        }
      />
    </View>
  );
}
