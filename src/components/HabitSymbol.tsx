import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function HabitSymbol({ icon, size, color }: { icon: string; size: number; color: string }) {
  if (!(icon in Ionicons.glyphMap)) {
    return <Text style={{ fontSize: size, lineHeight: size + 4 }}>{icon}</Text>;
  }
  return <Ionicons name={icon as never} size={size} color={color} />;
}
