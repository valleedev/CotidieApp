import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useThemeMode } from '../../src/theme/useThemeColors';

const TAB_ITEMS = {
  index: { label: 'Hoy', icon: 'calendar-outline' },
  habits: { label: 'Hábitos', icon: 'list-outline' },
  progress: { label: 'Progreso', icon: 'analytics-outline' },
  settings: { label: 'Tú', icon: 'person-outline' },
} as const;

type TabName = keyof typeof TAB_ITEMS;

const tabColors = {
  light: {
    background: '#FCFBF7',
    border: '#E2DED6',
    active: '#B94A2D',
    inactive: '#7B766E',
  },
  dark: {
    background: '#201F18',
    border: '#39372F',
    active: '#E66B4A',
    inactive: '#A7A297',
  },
} as const;

function TabLabel({ name, focused }: { name: TabName; focused: boolean }) {
  const mode = useThemeMode();
  const palette = tabColors[mode];

  return (
    <View style={{ alignItems: 'center', gap: 5 }}>
      <Text
        style={{
          color: focused ? palette.active : palette.inactive,
          fontSize: 11,
          fontWeight: focused ? '700' : '400',
          lineHeight: 13,
        }}
      >
        {TAB_ITEMS[name].label}
      </Text>
      <View
        style={{
          backgroundColor: focused ? palette.active : 'transparent',
          borderCurve: 'continuous',
          borderRadius: 999,
          height: 2,
          width: 16,
        }}
      />
    </View>
  );
}

function TabIcon({ name, focused }: { name: TabName; focused: boolean }) {
  const mode = useThemeMode();
  const palette = tabColors[mode];

  return <Ionicons color={focused ? palette.active : palette.inactive} name={TAB_ITEMS[name].icon} size={22} />;
}

export default function TabsLayout() {
  const mode = useThemeMode();
  const palette = tabColors[mode];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        tabBarActiveTintColor: palette.active,
        tabBarInactiveTintColor: palette.inactive,
        tabBarItemStyle: { paddingTop: 10 },
        tabBarStyle: {
          backgroundColor: palette.background,
          borderCurve: 'continuous',
          borderTopColor: palette.border,
          borderTopLeftRadius: 34,
          borderTopRightRadius: 34,
          borderTopWidth: 1,
          height: 96,
          overflow: 'hidden',
          paddingBottom: 12,
          paddingTop: 2,
        },
      }}
    >
      {(Object.keys(TAB_ITEMS) as TabName[]).map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: TAB_ITEMS[name].label,
            tabBarAccessibilityLabel: TAB_ITEMS[name].label,
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} name={name} />,
            tabBarLabel: ({ focused }) => <TabLabel focused={focused} name={name} />,
          }}
        />
      ))}
    </Tabs>
  );
}
