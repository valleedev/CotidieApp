import { useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { HabitForm, type HabitFormHandle } from '../../../src/components/HabitForm';
import { updateHabit } from '../../../src/state/habits$';
import { reminders$, createReminder, updateReminder, softDeleteReminder } from '../../../src/state/reminders$';
import { diffReminderDrafts } from '../../../src/domain/reminders';
import { useHabitDetail } from '../../../src/hooks/useHabitDetail';
import { useThemeMode } from '../../../src/theme/useThemeColors';

export default function EditHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useHabitDetail(id);
  const formRef = useRef<HabitFormHandle>(null);
  const isClosing = useRef(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const { height: screenHeight } = useWindowDimensions();
  const sheetOffset = useSharedValue(screenHeight);
  const overlayOpacity = useSharedValue(0);
  const mode = useThemeMode();
  const colors = mode === 'dark'
    ? { overlay: 'rgba(16, 15, 11, 0.58)', sheet: '#1D1D16', text: '#F3EFE8', muted: '#ABA498' }
    : { overlay: 'rgba(38, 34, 30, 0.36)', sheet: '#FCF9F5', text: '#26221E', muted: '#746D64' };
  const sheetAnimation = { duration: 320, easing: Easing.out(Easing.cubic) };

  useEffect(() => {
    sheetOffset.value = withTiming(0, sheetAnimation);
    overlayOpacity.value = withTiming(1, { duration: 180 });
  }, [overlayOpacity, sheetOffset]);

  function finishClose() {
    if (isClosing.current) return;
    isClosing.current = true;
    router.back();
  }

  function closeSheet() {
    if (isClosing.current) return;
    isClosing.current = true;
    overlayOpacity.value = withTiming(0, { duration: 180 });
    sheetOffset.value = withTiming(screenHeight, { duration: 230 }, (finished) => {
      if (finished) runOnJS(router.back)();
    });
  }

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetOffset.value }] }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const dismissGesture = Gesture.Pan()
    .activeOffsetY(8)
    .onUpdate((event) => {
      sheetOffset.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > 118 || event.velocityY > 900) {
        overlayOpacity.value = withTiming(0, { duration: 180 });
        sheetOffset.value = withTiming(screenHeight, { duration: 230 }, (finished) => {
          if (finished) runOnJS(finishClose)();
        });
      } else {
        sheetOffset.value = withTiming(0, sheetAnimation);
      }
    });

  if (!detail) return null;

  const { habit } = detail;
  const existingReminders = Object.values(reminders$.get()).filter(
    (reminder) => reminder.habitId === id && reminder.deletedAt === null
  );

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        pointerEvents="none"
        style={[
          { backgroundColor: colors.overlay, bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
          overlayStyle,
        ]}
      />
      <Pressable
        accessibilityLabel="Cerrar edición del hábito"
        onPress={closeSheet}
        style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
      />
      <Animated.View
        style={[
          {
            backgroundColor: colors.sheet,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            bottom: 0,
            left: 0,
            overflow: 'hidden',
            position: 'absolute',
            right: 0,
            top: 145,
          },
          sheetStyle,
        ]}
      >
        <GestureDetector gesture={dismissGesture}>
          <View style={{ paddingBottom: 2 }}>
            <View
              style={{
                alignSelf: 'center',
                backgroundColor: mode === 'dark' ? '#4B473C' : '#DED8CE',
                borderRadius: 999,
                height: 4,
                marginTop: 9,
                width: 36,
              }}
            />
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 21,
                paddingTop: 19,
              }}
            >
              <Pressable onPress={closeSheet}>
                <Text style={{ color: colors.muted, fontSize: 13 }}>Cancelar</Text>
              </Pressable>
              <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 23 }}>Editar hábito</Text>
              <Pressable disabled={!canSubmit} onPress={() => formRef.current?.submit()}>
                <Text style={{ color: canSubmit ? colors.text : colors.muted, fontSize: 13, fontWeight: '800' }}>
                  Guardar
                </Text>
              </Pressable>
            </View>
          </View>
        </GestureDetector>
        <HabitForm
          ref={formRef}
          appearance="sheet"
          initial={habit}
          initialReminders={existingReminders}
          submitLabel="Guardar cambios"
          onCanSubmitChange={setCanSubmit}
          onSubmit={(values, reminderDrafts) => {
            updateHabit(id, values);
            const { toCreate, toDeleteIds, toUpdate } = diffReminderDrafts(id, existingReminders, reminderDrafts);
            toCreate.forEach(createReminder);
            toUpdate.forEach(({ id: reminderId, patch }) => updateReminder(reminderId, patch));
            toDeleteIds.forEach(softDeleteReminder);
            closeSheet();
          }}
        />
      </Animated.View>
    </View>
  );
}
