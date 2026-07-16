import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useProgress } from '../../src/hooks/useProgress';
import { ProgressRow } from '../../src/components/ProgressRow';
import { EmptyState } from '../../src/components/EmptyState';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { spacing } from '../../src/theme/tokens';

export default function Progress() {
  const entries = useProgress();
  const colors = useThemeColors();

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Aún no tienes hábitos"
        actionLabel="Crear hábito"
        onAction={() => router.push('/habit/new')}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        {entries.map((entry) => (
          <ProgressRow key={entry.habit.id} entry={entry} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
});
