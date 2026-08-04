import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { use$ } from '@legendapp/state/react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isOnline$ } from '../state/network$';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/tokens';

const RECONNECTED_MESSAGE_MS = 1800;

export function OfflineBanner() {
  const isOnline = use$(isOnline$);
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [showReconnected, setShowReconnected] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      setShowReconnected(false);
      return;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), RECONNECTED_MESSAGE_MS);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (isOnline && !showReconnected) return null;

  const backgroundColor = isOnline ? colors.successBackground : colors.dangerBackground;
  const textColor = isOnline ? colors.success : colors.danger;
  const message = isOnline
    ? 'Conexión restaurada · sincronizando…'
    : 'Sin conexión · los cambios se guardan en este dispositivo';

  return (
    <View
      style={{
        position: 'absolute',
        top: insets.top,
        left: 0,
        right: 0,
        zIndex: 40,
        backgroundColor,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
      }}
    >
      <Text style={{ color: textColor, fontSize: 12, fontWeight: '700', textAlign: 'center' }}>{message}</Text>
    </View>
  );
}
