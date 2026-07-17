import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { useThemeColors } from '../../src/theme/useThemeColors';

const TAB_ICONS = {
  index: { active: 'sunny', inactive: 'sunny-outline' },
  habits: { active: 'checkbox', inactive: 'checkbox-outline' },
  progress: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  settings: { active: 'settings', inactive: 'settings-outline' },
} as const;

function TabIcon({
  name,
  focused,
  color,
}: {
  name: keyof typeof TAB_ICONS;
  focused: boolean;
  color: ColorValue;
}) {
  const icon = focused ? TAB_ICONS[name].active : TAB_ICONS[name].inactive;
  return <Ionicons name={icon as never} size={24} color={color} />;
}

export default function TabsLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoy',
          tabBarIcon: ({ focused, color }) => <TabIcon name="index" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Hábitos',
          tabBarIcon: ({ focused, color }) => <TabIcon name="habits" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progreso',
          tabBarIcon: ({ focused, color }) => <TabIcon name="progress" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ focused, color }) => <TabIcon name="settings" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}
