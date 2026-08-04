import { observable } from '@legendapp/state';
import { pickCelebrationMessage } from '../domain/celebration';

export interface CelebrationEvent {
  id: string;
  message: string;
}

export const celebration$ = observable<CelebrationEvent | null>(null);

let lastMessage: string | null = null;

export function triggerCelebration(): void {
  const message = pickCelebrationMessage(lastMessage);
  lastMessage = message;
  celebration$.set({ id: `${Date.now()}-${Math.random()}`, message });
}
