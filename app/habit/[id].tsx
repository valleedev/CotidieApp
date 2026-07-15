import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>Detalle de hábito {id}</Text>
    </View>
  );
}
