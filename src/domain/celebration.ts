export const CELEBRATION_MESSAGES = [
  '¡Bien hecho!',
  'Un paso más cerca',
  'Así se hace',
  'Lo lograste',
  'Sumando constancia',
  '¡Eso es!',
  'Un hábito más fuerte',
  'Buen ritmo hoy',
  'Se nota el esfuerzo',
] as const;

export function pickCelebrationMessage(
  previous: string | null = null,
  random: () => number = Math.random
): string {
  const pool = previous ? CELEBRATION_MESSAGES.filter((message) => message !== previous) : CELEBRATION_MESSAGES;
  return pool[Math.floor(random() * pool.length)];
}
