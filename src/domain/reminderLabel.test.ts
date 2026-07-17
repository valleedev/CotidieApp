import { describeReminderTime } from './reminderLabel';

describe('describeReminderTime', () => {
  it('returns Mañana + sunny before noon', () => {
    expect(describeReminderTime('08:00')).toEqual({ icon: 'sunny', label: 'Mañana' });
    expect(describeReminderTime('11:59')).toEqual({ icon: 'sunny', label: 'Mañana' });
  });

  it('returns Tarde + sunny from noon to before 20:00', () => {
    expect(describeReminderTime('12:00')).toEqual({ icon: 'sunny', label: 'Tarde' });
    expect(describeReminderTime('19:59')).toEqual({ icon: 'sunny', label: 'Tarde' });
  });

  it('returns Noche + moon from 20:00 onward', () => {
    expect(describeReminderTime('20:00')).toEqual({ icon: 'moon', label: 'Noche' });
    expect(describeReminderTime('23:30')).toEqual({ icon: 'moon', label: 'Noche' });
  });
});
