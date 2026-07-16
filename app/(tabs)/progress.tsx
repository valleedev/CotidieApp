import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgress } from '../../src/hooks/useProgress';
import { ProgressRow } from '../../src/components/ProgressRow';
import { EmptyState } from '../../src/components/EmptyState';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing, typography } from '../../src/theme/tokens';

export default function Progress() {
  const entries = useProgress();
  const colors = useThemeColors();

  if (entries.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          title="Aún no tienes hábitos"
          actionLabel="Crear hábito"
          onAction={() => router.push('/habit/new')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[typography.title, { color: colors.text }]}>Progreso</Text>
        {entries.map((entry) => (
          <ProgressRow key={entry.habit.id} entry={entry} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
});
