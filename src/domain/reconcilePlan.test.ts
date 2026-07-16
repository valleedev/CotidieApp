import { signatureOf } from './reminders';
import { planReconcile } from './reconcilePlan';
import type { Habit, Reminder } from './types';

const habit: Habit = {
  id: 'habit-1',
  userId: 'user-1',
  name: 'Leer',
  color: '#000',
  icon: 'book',
  daysOfWeek: [1, 3, 5],
  targetPerDay: 1,
  sortOrder: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

const reminder: Reminder = {
  id: 'reminder-1',
  habitId: 'habit-1',
  userId: 'user-1',
  time: '08:00',
  daysOfWeek: null, // hereda [1,3,5]
  enabled: true,
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

const habits = { [habit.id]: habit };
const currentSig = signatureOf(reminder, [1, 3, 5]);

describe('planReconcile', () => {
  it('schedules a reminder with nothing currently in the OS', () => {
    const plan = planReconcile({ [reminder.id]: reminder }, habits, [], true);
    expect(plan).toEqual({ toCancel: [], toSchedule: [reminder.id], toPurgeLocalSchedule: [] });
  });

  it('is idempotent: matching signature + count produces no action', () => {
    const osScheduled = [
      { identifier: 'os-1', reminderId: reminder.id, signature: currentSig },
      { identifier: 'os-2', reminderId: reminder.id, signature: currentSig },
      { identifier: 'os-3', reminderId: reminder.id, signature: currentSig },
    ];
    const plan = planReconcile({ [reminder.id]: reminder }, habits, osScheduled, true);
    expect(plan).toEqual({ toCancel: [], toSchedule: [], toPurgeLocalSchedule: [] });
  });

  it('reschedules when the OS signature is stale (e.g. time changed)', () => {
    const osScheduled = [
      { identifier: 'os-1', reminderId: reminder.id, signature: 'stale-sig' },
      { identifier: 'os-2', reminderId: reminder.id, signature: 'stale-sig' },
      { identifier: 'os-3', reminderId: reminder.id, signature: 'stale-sig' },
    ];
    const plan = planReconcile({ [reminder.id]: reminder }, habits, osScheduled, true);
    expect(plan.toCancel.sort()).toEqual(['os-1', 'os-2', 'os-3']);
    expect(plan.toSchedule).toEqual([reminder.id]);
  });

  it('cancels and purges a disabled reminder', () => {
    const disabled: Reminder = { ...reminder, enabled: false };
    const osScheduled = [{ identifier: 'os-1', reminderId: reminder.id, signature: currentSig }];
    const plan = planReconcile({ [reminder.id]: disabled }, habits, osScheduled, true);
    expect(plan.toCancel).toEqual(['os-1']);
    expect(plan.toSchedule).toEqual([]);
    expect(plan.toPurgeLocalSchedule).toEqual([reminder.id]);
  });

  it('cancels and purges a soft-deleted reminder', () => {
    const deleted: Reminder = { ...reminder, deletedAt: '2026-02-01T00:00:00.000Z' };
    const osScheduled = [{ identifier: 'os-1', reminderId: reminder.id, signature: currentSig }];
    const plan = planReconcile({ [reminder.id]: deleted }, habits, osScheduled, true);
    expect(plan.toCancel).toEqual(['os-1']);
    expect(plan.toPurgeLocalSchedule).toEqual([reminder.id]);
  });

  it('treats an orphaned reminder (habit missing/deleted) as inactive', () => {
    const orphan: Reminder = { ...reminder, habitId: 'missing-habit' };
    const osScheduled = [{ identifier: 'os-1', reminderId: reminder.id, signature: currentSig }];
    const plan = planReconcile({ [reminder.id]: orphan }, habits, osScheduled, true);
    expect(plan.toCancel).toEqual(['os-1']);
    expect(plan.toPurgeLocalSchedule).toEqual([reminder.id]);

    const deletedHabit: Habit = { ...habit, deletedAt: '2026-02-01T00:00:00.000Z' };
    const plan2 = planReconcile(
      { [reminder.id]: reminder },
      { [habit.id]: deletedHabit },
      osScheduled,
      true
    );
    expect(plan2.toCancel).toEqual(['os-1']);
  });

  it('does not schedule anything when permission is not granted, but still purges stale OS entries for missing reminders', () => {
    const osScheduled = [{ identifier: 'os-1', reminderId: reminder.id, signature: currentSig }];
    const plan = planReconcile({ [reminder.id]: reminder }, habits, osScheduled, false);
    expect(plan.toCancel).toEqual(['os-1']);
    expect(plan.toSchedule).toEqual([]);
    expect(plan.toPurgeLocalSchedule).toEqual([reminder.id]);
  });

  it('cleans up OS entries that no longer have a matching reminder at all', () => {
    const osScheduled = [{ identifier: 'os-orphan', reminderId: 'gone-reminder', signature: 'x' }];
    const plan = planReconcile({}, habits, osScheduled, true);
    expect(plan.toCancel).toEqual(['os-orphan']);
    expect(plan.toPurgeLocalSchedule).toEqual(['gone-reminder']);
  });

  it('ignores OS entries scheduled outside this system (reminderId null)', () => {
    const osScheduled = [{ identifier: 'foreign', reminderId: null, signature: null }];
    const plan = planReconcile({}, habits, osScheduled, true);
    expect(plan.toCancel).toEqual([]);
    expect(plan.toPurgeLocalSchedule).toEqual([]);
  });
});
