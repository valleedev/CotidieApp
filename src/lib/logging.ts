import { LogBox } from 'react-native';

// Estos son errores internos de @supabase/auth-js (console.error sin rethrow
// dentro de _recoverAndRefresh()/_emitInitialSession() en GoTrueClient) que
// disparan sin conexión aunque la sesión cacheada siga funcionando bien
// (session$.ts ya maneja el fallo con gracia). Sin esto, LogBox los muestra
// como un redbox confuso en cada intento de refresh fallido estando offline.
LogBox.ignoreLogs(['AuthRetryableFetchError', 'UnknownHostException', 'Network request failed']);
