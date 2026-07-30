import { useEffect, useState, type ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useThemeMode } from '../../src/theme/useThemeColors';

const TAB_ITEMS = {
  index: { label: 'Hoy', icon: 'calendar-outline' },
  habits: { label: 'Hábitos', icon: 'list-outline' },
  progress: { label: 'Progreso', icon: 'analytics-outline' },
  settings: { label: 'Tú', icon: 'person-outline' },
} as const;

type TabName = keyof typeof TAB_ITEMS;
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const tabColors = {
  light: {
    background: '#FCFBF7',
    border: '#E2DED6',
    active: '#201E1A',
    indicator: '#B94A2D',
    inactive: '#7B766E',
  },
  dark: {
    background: '#201F18',
    border: '#39372F',
    active: '#F8F4ED',
    indicator: '#E66B4A',
    inactive: '#A7A297',
  },
} as const;

function AnimatedTabBar({ state, descriptors, navigation }: TabBarProps) {
  const mode = useThemeMode();
  const palette = tabColors[mode];
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const indicatorPosition = useSharedValue(state.index);
  const itemWidth = barWidth / state.routes.length;

  useEffect(() => {
    indicatorPosition.value = withSpring(state.index, {
      damping: 18,
      mass: 0.65,
      stiffness: 210,
    });
  }, [indicatorPosition, state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value * itemWidth }],
  }));

  function measureBar(event: LayoutChangeEvent) {
    setBarWidth(event.nativeEvent.layout.width);
  }

  return (
    <View
      onLayout={measureBar}
      style={{
        backgroundColor: palette.background,
        borderCurve: 'continuous',
        borderTopColor: palette.border,
        borderTopLeftRadius: 34,
        borderTopRightRadius: 34,
        borderTopWidth: 1,
        flexDirection: 'row',
        minHeight: 84,
        overflow: 'hidden',
        paddingBottom: Math.max(insets.bottom, 12),
        paddingTop: 8,
      }}
    >
      {barWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              alignItems: 'center',
              bottom: Math.max(insets.bottom, 12) - 2,
              left: 0,
              position: 'absolute',
              width: itemWidth,
            },
            indicatorStyle,
          ]}
        >
          <View
            style={{
              backgroundColor: palette.indicator,
              borderCurve: 'continuous',
              borderRadius: 999,
              height: 2,
              width: 16,
            }}
          />
        </Animated.View>
      ) : null}

      {state.routes.map((route, index) => {
        const name = route.name as TabName;
        const item = TAB_ITEMS[name];
        if (!item) return null;

        const focused = state.index === index;
        const options = descriptors[route.key].options;

        return (
          <Pressable
            accessibilityLabel={options.tabBarAccessibilityLabel ?? item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            key={route.key}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            onPress={() => {
              const event = navigation.emit({
                canPreventDefault: true,
                target: route.key,
                type: 'tabPress',
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
            style={({ pressed }) => ({
              alignItems: 'center',
              flex: 1,
              gap: 5,
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
              paddingBottom: 7,
            })}
          >
            <Ionicons color={focused ? palette.active : palette.inactive} name={item.icon} size={22} />
            <Text
              style={{
                color: focused ? palette.active : palette.inactive,
                fontSize: 11,
                fontWeight: focused ? '700' : '400',
                lineHeight: 13,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {(Object.keys(TAB_ITEMS) as TabName[]).map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: TAB_ITEMS[name].label,
            tabBarAccessibilityLabel: TAB_ITEMS[name].label,
          }}
        />
      ))}
    </Tabs>
  );
}
