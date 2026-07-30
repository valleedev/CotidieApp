import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

type EmptyStateColors = {
  action: string;
  actionText: string;
  illustrationBorder: string;
  illustrationIcon: string;
  muted: string;
  text: string;
};

export interface HabitEmptyStateProps {
  actionLabel: string;
  colors: EmptyStateColors;
  description: string;
  heading: string;
  icon: keyof typeof Ionicons.glyphMap;
  onAction: () => void;
  subtitle: string;
  title: string;
}

export function HabitEmptyState({
  actionLabel,
  colors,
  description,
  heading,
  icon,
  onAction,
  subtitle,
  title,
}: HabitEmptyStateProps) {
  return (
    <>
      <View style={{ gap: 2, paddingHorizontal: 24, paddingTop: 17 }}>
        <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 36, lineHeight: 42 }}>
          {heading}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 13, letterSpacing: 0.1, lineHeight: 18 }}>
          {subtitle}
        </Text>
      </View>

      <Animated.View
        entering={FadeIn.duration(350)}
        style={{
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
          paddingBottom: 40,
          paddingHorizontal: 28,
        }}
      >
        <View
          style={{
            alignItems: 'center',
            borderColor: colors.illustrationBorder,
            borderRadius: 999,
            borderStyle: 'dashed',
            borderWidth: 2,
            height: 72,
            justifyContent: 'center',
            width: 72,
          }}
        >
          <Ionicons color={colors.illustrationIcon} name={icon} size={27} />
        </View>

        <Animated.View entering={FadeInDown.delay(80).duration(350)} style={{ alignItems: 'center', paddingTop: 17 }}>
          <Text
            style={{
              color: colors.text,
              fontFamily: 'serif',
              fontSize: 23,
              lineHeight: 30,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              color: colors.muted,
              fontSize: 13.5,
              lineHeight: 21,
              maxWidth: 285,
              paddingTop: 6,
              textAlign: 'center',
            }}
          >
            {description}
          </Text>
          <Pressable
            accessibilityLabel={actionLabel}
            accessibilityRole="button"
            onPress={onAction}
            style={({ pressed }) => ({
              alignItems: 'center',
              backgroundColor: colors.action,
              borderRadius: 999,
              flexDirection: 'row',
              gap: 7,
              marginTop: 24,
              minHeight: 42,
              opacity: pressed ? 0.82 : 1,
              paddingHorizontal: 22,
            })}
          >
            <Ionicons color={colors.actionText} name="add" size={17} />
            <Text style={{ color: colors.actionText, fontSize: 13.5, fontWeight: '700', letterSpacing: 0.1 }}>
              {actionLabel}
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </>
  );
}
