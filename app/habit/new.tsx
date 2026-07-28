import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HabitForm, type HabitFormHandle } from '../../src/components/HabitForm';
import { createHabit } from '../../src/state/habits$';
import { createReminder } from '../../src/state/reminders$';
import { diffReminderDrafts } from '../../src/domain/reminders';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, radii, typography } from '../../src/theme/tokens';

export default function NewHabit() {
  const formRef = useRef<HabitFormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const colors = useThemeColors();

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.sheet, { backgroundColor: colors.surfaceElevated }]}
    >
      <View style={[styles.grabber, { backgroundColor: colors.border }]} />
      <Text style={[typography.title, styles.title, { color: colors.text }]}>Nuevo hábito</Text>
      <HabitForm
        ref={formRef}
        submitLabel="Crear"
        onCanSubmitChange={setCanSubmit}
        onSubmit={(values, reminderDrafts) => {
          const habit = createHabit(values);
          const { toCreate } = diffReminderDrafts(habit.id, [], reminderDrafts);
          toCreate.forEach(createReminder);
          router.back();
        }}
      />
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.button, styles.cancelButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
        >
          <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>Cancelar</Text>
        </Pressable>
        <Pressable
          onPress={() => formRef.current?.submit()}
          disabled={!canSubmit}
          style={[
            styles.button,
            { backgroundColor: canSubmit ? colors.primary : colors.surface },
          ]}
        >
          <Text
            style={[
              typography.body,
              { color: canSubmit ? colors.background : colors.textMuted, fontWeight: '600' },
            ]}
          >
            Guardar
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    marginTop: spacing.xl,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    overflow: 'hidden',
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radii.full,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  cancelButton: {
    borderWidth: 1,
  },
});
