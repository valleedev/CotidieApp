import { CELEBRATION_MESSAGES, pickCelebrationMessage } from './celebration';

describe('pickCelebrationMessage', () => {
  it('always returns a message from the pool', () => {
    for (let i = 0; i < CELEBRATION_MESSAGES.length; i += 1) {
      const random = () => i / CELEBRATION_MESSAGES.length;
      expect(CELEBRATION_MESSAGES).toContain(pickCelebrationMessage(null, random));
    }
  });

  it('never repeats the previous message', () => {
    for (const previous of CELEBRATION_MESSAGES) {
      for (let i = 0; i < CELEBRATION_MESSAGES.length - 1; i += 1) {
        const random = () => i / (CELEBRATION_MESSAGES.length - 1);
        expect(pickCelebrationMessage(previous, random)).not.toBe(previous);
      }
    }
  });

  it('is deterministic given an injected random function', () => {
    const random = () => 0;
    expect(pickCelebrationMessage(null, random)).toBe(CELEBRATION_MESSAGES[0]);
  });
});
