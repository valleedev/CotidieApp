import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="today" options={{ title: 'Hoy' }} />
      <Tabs.Screen name="habits" options={{ title: 'Hábitos' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progreso' }} />
      <Tabs.Screen name="settings" options={{ title: 'Ajustes' }} />
    </Tabs>
  );
}
