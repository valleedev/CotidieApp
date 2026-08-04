import { use$ } from '@legendapp/state/react';
import { isOnline$ } from '../state/network$';

export function useNetworkStatus(): boolean {
  return use$(isOnline$);
}
