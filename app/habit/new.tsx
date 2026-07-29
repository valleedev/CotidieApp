import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { HabitForm, type HabitFormHandle } from '../../src/components/HabitForm';
import { createHabit } from '../../src/state/habits$';
import { createReminder } from '../../src/state/reminders$';
import { diffReminderDrafts } from '../../src/domain/reminders';
import { useThemeMode } from '../../src/theme/useThemeColors';

export default function NewHabit() {
  const formRef = useRef<HabitFormHandle>(null);
  const isClosing = useRef(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const sheetOffset = useSharedValue(72);
  const mode = useThemeMode();
  const colors = mode === 'dark'
    ? { overlay: '#100F0B', sheet: '#1D1D16', text: '#F3EFE8', muted: '#ABA498', border: '#413D33', button: '#F3EFE8' }
    : { overlay: '#AAA69E', sheet: '#FCF9F5', text: '#26221E', muted: '#746D64', border: '#E3DCD3', button: '#201E1A' };

  useEffect(() => {
    sheetOffset.value = withSpring(0, { damping: 22, stiffness: 240 });
  }, [sheetOffset]);

  function finishClose() {
    if (isClosing.current) return;
    isClosing.current = true;
    router.back();
  }

  function closeSheet() {
    if (isClosing.current) return;
    isClosing.current = true;
    sheetOffset.value = withTiming(760, { duration: 230 }, (finished) => {
      if (finished) runOnJS(router.back)();
    });
  }

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetOffset.value }] }));
  const dismissGesture = Gesture.Pan()
    .activeOffsetY(8)
    .onUpdate((event) => {
      sheetOffset.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > 118 || event.velocityY > 900) {
        sheetOffset.value = withTiming(760, { duration: 230 }, (finished) => {
          if (finished) runOnJS(finishClose)();
        });
      } else {
        sheetOffset.value = withSpring(0, { damping: 22, stiffness: 240 });
      }
    });

  return (
    <View style={{ backgroundColor: colors.overlay, flex: 1 }}>
      <Pressable accessibilityLabel="Cerrar nuevo hábito" onPress={closeSheet} style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }} />
      <Animated.View style={[{ backgroundColor: colors.sheet, borderTopLeftRadius: 28, borderTopRightRadius: 28, bottom: 0, left: 0, overflow: 'hidden', position: 'absolute', right: 0, top: 145 }, sheetStyle]}>
        <GestureDetector gesture={dismissGesture}>
          <View style={{ paddingBottom: 2 }}>
            <View style={{ alignSelf: 'center', backgroundColor: mode === 'dark' ? '#4B473C' : '#DED8CE', borderRadius: 999, height: 4, marginTop: 9, width: 36 }} />
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 21, paddingTop: 19 }}>
              <Pressable onPress={closeSheet}><Text style={{ color: colors.muted, fontSize: 13 }}>Cancelar</Text></Pressable>
              <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 23 }}>Nuevo hábito</Text>
              <Pressable disabled={!canSubmit} onPress={() => formRef.current?.submit()}><Text style={{ color: canSubmit ? colors.text : colors.muted, fontSize: 13, fontWeight: '800' }}>Guardar</Text></Pressable>
            </View>
          </View>
        </GestureDetector>
        <HabitForm
          ref={formRef}
          appearance="sheet"
          submitLabel="Crear hábito"
          onCanSubmitChange={setCanSubmit}
          onSubmit={(values, reminderDrafts) => {
            const habit = createHabit(values);
            const { toCreate } = diffReminderDrafts(habit.id, [], reminderDrafts);
            toCreate.forEach(createReminder);
            closeSheet();
          }}
        />
      </Animated.View>
    </View>
  );
}
