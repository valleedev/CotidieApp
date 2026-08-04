import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';
import Swipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { Extrapolation, FadeOutRight, interpolate, LinearTransition, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { use$ } from '@legendapp/state/react';
import { useActiveHabits } from '../../src/hooks/useHabits';
import { useProgress } from '../../src/hooks/useProgress';
import { useDataReady } from '../../src/hooks/useDataReady';
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
    deleteButton: '#BF4B27',
    sheet: '#FFFCF8',
    cancelButton: '#F3EDE4',
    grabber: '#DED6CA',
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
    deleteButton: '#ED895E',
    sheet: '#201F18',
    cancelButton: '#302D23',
    grabber: '#514C40',
  },
} as const;

type PendingDelete = {
  habit: Habit;
  streak: number;
};

function DeleteHabitModal({
  colors,
  pending,
  onCancel,
  onConfirm,
}: {
  colors: typeof screenColors.light | typeof screenColors.dark;
  pending: PendingDelete | null;
  onCancel: () => void;
  onConfirm: (habit: Habit) => void;
}) {
  const insets = useSafeAreaInsets();
  const [rendered, setRendered] = useState<PendingDelete | null>(pending);
  const backdropOpacity = useSharedValue(0);
  const translateY = useSharedValue(320);

  useEffect(() => {
    if (pending) {
      setRendered(pending);
      backdropOpacity.value = withTiming(1, { duration: 220 });
      translateY.value = withSpring(0, { damping: 22, mass: 0.8, stiffness: 230 });
      return;
    }

    if (rendered) {
      backdropOpacity.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(320, { duration: 220 }, (finished) => {
        if (finished) runOnJS(setRendered)(null);
      });
    }
  }, [backdropOpacity, pending, rendered, translateY]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  if (!rendered) return null;

  return (
    <Modal
      animationType="none"
      navigationBarTranslucent
      onRequestClose={onCancel}
      statusBarTranslucent
      transparent
      visible
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(20, 18, 14, 0.62)' }, backdropStyle]}>
          <Pressable accessibilityLabel="Cancelar eliminación" onPress={onCancel} style={StyleSheet.absoluteFill} />
        </Animated.View>

        <Animated.View
          style={[
            {
              backgroundColor: colors.sheet,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              bottom: 0,
              gap: 10,
              left: 0,
              paddingBottom: Math.max(insets.bottom, 16) + 6,
              paddingHorizontal: 19,
              paddingTop: 10,
              position: 'absolute',
              right: 0,
            },
            sheetStyle,
          ]}
        >
          <View style={{ alignSelf: 'center', backgroundColor: colors.grabber, borderRadius: 999, height: 4, width: 36 }} />

          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 14, paddingBottom: 4, paddingTop: 10 }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: colors.deleteBackground,
                borderRadius: 999,
                height: 48,
                justifyContent: 'center',
                width: 48,
              }}
            >
              <Ionicons color={colors.deleteText} name="trash-outline" size={22} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 20, lineHeight: 25 }}>
                ¿Eliminar "{rendered.habit.name}"?
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12.5, lineHeight: 17 }}>
                Perderás tu racha de {rendered.streak} día{rendered.streak === 1 ? '' : 's'}. Esta acción no se puede deshacer.
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityLabel={`Eliminar hábito ${rendered.habit.name}`}
            accessibilityRole="button"
            onPress={() => onConfirm(rendered.habit)}
            style={({ pressed }) => ({
              alignItems: 'center',
              backgroundColor: colors.deleteButton,
              borderRadius: 14,
              flexDirection: 'row',
              gap: 7,
              justifyContent: 'center',
              minHeight: 49,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons color={colors.actionText} name="trash-outline" size={16} />
            <Text style={{ color: colors.actionText, fontSize: 14, fontWeight: '800' }}>Eliminar hábito</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            style={({ pressed }) => ({
              alignItems: 'center',
              backgroundColor: colors.cancelButton,
              borderRadius: 14,
              justifyContent: 'center',
              minHeight: 49,
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>Cancelar</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

function DeleteAction({
  colors,
  habit,
  progress,
  onDelete,
}: {
  colors: typeof screenColors.light | typeof screenColors.dark;
  habit: Habit;
  progress: SharedValue<number>;
  onDelete: () => void;
}) {
  const revealStyle = useAnimatedStyle(() => {
    const reveal = interpolate(progress.value, [0, 0.35, 1], [0, 0.5, 1], Extrapolation.CLAMP);

    return {
      opacity: reveal,
      transform: [
        { translateX: interpolate(progress.value, [0, 1], [26, 0], Extrapolation.CLAMP) },
        { scale: interpolate(progress.value, [0, 1], [0.92, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Animated.View style={[{ justifyContent: 'center', paddingLeft: 12, width: 112 }, revealStyle]}>
      <Pressable
        accessibilityLabel={`Eliminar ${habit.name}`}
        accessibilityRole="button"
        onPress={onDelete}
        style={({ pressed }) => ({
          alignItems: 'center',
          alignSelf: 'stretch',
          backgroundColor: colors.deleteBackground,
          borderRadius: 14,
          flexDirection: 'row',
          gap: 6,
          justifyContent: 'center',
          opacity: pressed ? 0.75 : 1,
          paddingHorizontal: 14,
          paddingVertical: 10,
        })}
      >
        <Ionicons color={colors.deleteText} name="trash-outline" size={16} />
        <Text style={{ color: colors.deleteText, fontSize: 14, fontWeight: '800' }}>Eliminar</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HabitsScreen() {
  const isReady = useDataReady();
  const habits = useActiveHabits();
  const progress = useProgress();
  const reminders = Object.values(use$(reminders$));
  const mode = useThemeMode();
  const colors = screenColors[mode];
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const swipeableRefs = useRef(new Map<string, SwipeableMethods>());

  const closeSwipeables = useCallback((exceptId?: string) => {
    swipeableRefs.current.forEach((swipeable, habitId) => {
      if (habitId !== exceptId) swipeable.close();
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => closeSwipeables();
    }, [closeSwipeables])
  );

  if (!isReady) {
    return <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background, flex: 1 }} />;
  }

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

  function confirmDelete(habit: Habit, streak: number) {
    setPendingDelete({ habit, streak });
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
        onSwipeableWillOpen={() => closeSwipeables(item.id)}
        overshootFriction={8}
        ref={(swipeable) => {
          if (swipeable) {
            swipeableRefs.current.set(item.id, swipeable);
          } else {
            swipeableRefs.current.delete(item.id);
          }
        }}
        renderRightActions={(swipeProgress) => (
          <DeleteAction
            colors={colors}
            habit={item}
            onDelete={() => confirmDelete(item, streak)}
            progress={swipeProgress}
          />
        )}
      >
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.background,
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
          <Pressable
            onPress={() => {
              closeSwipeables();
              router.push(`/habit/${item.id}`);
            }}
            style={{ flex: 1, gap: 2 }}
          >
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
          <Pressable
            accessibilityLabel={`Reordenar ${item.name}`}
            hitSlop={10}
            onLongPress={() => {
              closeSwipeables();
              drag();
            }}
            style={{ padding: 4 }}
          >
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
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 94, paddingHorizontal: 20, paddingTop: 36 }}
        data={habits}
        keyExtractor={(item) => item.id}
        onDragBegin={() => closeSwipeables()}
        onDragEnd={({ data }) => reorderHabits(data.map((habit) => habit.id))}
        onScrollBeginDrag={() => closeSwipeables()}
        renderItem={renderItem}
        ListFooterComponent={
          <Pressable
            accessibilityLabel="Cerrar acciones del hábito"
            onPress={() => closeSwipeables()}
            style={{ flex: 1, minHeight: 160 }}
          />
        }
        ListFooterComponentStyle={{ flex: 1 }}
        ListHeaderComponent={
          <View style={{ gap: 22, paddingBottom: 20 }}>
            <View style={{ gap: 3 }}>
              <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 37, lineHeight: 42 }}>Hábitos</Text>
              <Text style={{ color: colors.muted, fontSize: 14 }}>
                {habits.length} activos · arrastra para reordenar
              </Text>
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
      <Pressable
        accessibilityLabel="Agregar hábito"
        accessibilityRole="button"
        hitSlop={10}
        onPress={() => {
          closeSwipeables();
          router.push('/habit/new');
        }}
        style={({ pressed }) => ({
          alignItems: 'center',
          backgroundColor: colors.action,
          borderRadius: 999,
          bottom: 18,
          boxShadow: mode === 'dark' ? '0 6px 18px rgba(0, 0, 0, 0.26)' : '0 6px 18px rgba(32, 30, 26, 0.2)',
          height: 58,
          justifyContent: 'center',
          opacity: pressed ? 0.82 : 1,
          position: 'absolute',
          right: 20,
          width: 58,
        })}
      >
        <Ionicons color={colors.actionText} name="add" size={29} />
      </Pressable>
      <DeleteHabitModal
        colors={colors}
        onCancel={() => {
          setPendingDelete(null);
          closeSwipeables();
        }}
        onConfirm={(habit) => {
          setPendingDelete(null);
          softDeleteHabit(habit.id);
        }}
        pending={pendingDelete}
      />
    </View>
  );
}
