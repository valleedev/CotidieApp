export type ReminderTimeIcon = 'sunny' | 'moon';

export interface ReminderTimeLabel {
  icon: ReminderTimeIcon;
  label: 'Mañana' | 'Tarde' | 'Noche';
}

export function describeReminderTime(time: string): ReminderTimeLabel {
  const hour = Number(time.split(':')[0]);
  if (hour < 12) return { icon: 'sunny', label: 'Mañana' };
  if (hour < 20) return { icon: 'sunny', label: 'Tarde' };
  return { icon: 'moon', label: 'Noche' };
}
