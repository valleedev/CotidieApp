import * as Notifications from 'expo-notifications';

// Config de foreground: necesaria en iOS (por defecto no muestra nada sin esto);
// inofensiva en Android (se muestra igual). Importar por su side-effect.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
