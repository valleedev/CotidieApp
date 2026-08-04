const NETWORK_ERROR_PATTERNS = [
  'Network request failed',
  'UnknownHostException',
  'AuthRetryableFetchError',
  'fetch failed',
];

export function friendlyAuthErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const isNetworkError = NETWORK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
  return isNetworkError ? 'No hay conexión a internet. Revisa tu conexión e inténtalo de nuevo.' : message;
}
