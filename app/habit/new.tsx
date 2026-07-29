import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { HabitForm, type HabitFormHandle } from '../../src/components/HabitForm';
import { createHabit } from '../../src/state/habits$';
import { createReminder } from '../../src/state/reminders$';
import { diffReminderDrafts } from '../../src/domain/reminders';
import { useThemeMode } from '../../src/theme/useThemeColors';

export default function NewHabit() {
  const formRef = useRef<HabitFormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const mode = useThemeMode();
  const colors = mode === 'dark'
    ? { overlay: '#100F0B', sheet: '#1D1D16', text: '#F3EFE8', muted: '#ABA498', border: '#413D33', button: '#F3EFE8' }
    : { overlay: '#AAA69E', sheet: '#FCF9F5', text: '#26221E', muted: '#746D64', border: '#E3DCD3', button: '#201E1A' };

  return (
    <View style={{ backgroundColor: colors.overlay, flex: 1, paddingTop: 145 }}>
      <View style={{ backgroundColor: colors.sheet, borderTopLeftRadius: 28, borderTopRightRadius: 28, flex: 1, overflow: 'hidden' }}>
        <View style={{ alignItems: 'center', backgroundColor: mode === 'dark' ? '#4B473C' : '#DED8CE', borderRadius: 999, height: 4, marginTop: 9, width: 36 }} />
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 21, paddingTop: 19 }}>
          <Pressable onPress={() => router.back()}><Text style={{ color: colors.muted, fontSize: 13 }}>Cancelar</Text></Pressable>
          <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 23 }}>Nuevo hábito</Text>
          <Pressable disabled={!canSubmit} onPress={() => formRef.current?.submit()}><Text style={{ color: canSubmit ? colors.text : colors.muted, fontSize: 13, fontWeight: '800' }}>Guardar</Text></Pressable>
        </View>
        <HabitForm
          ref={formRef}
          appearance="sheet"
          submitLabel="Crear hábito"
          onCanSubmitChange={setCanSubmit}
          onSubmit={(values, reminderDrafts) => {
            const habit = createHabit(values);
            const { toCreate } = diffReminderDrafts(habit.id, [], reminderDrafts);
            toCreate.forEach(createReminder);
            router.back();
          }}
        />
      </View>
    </View>
  );
}
