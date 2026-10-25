import type { Answer, Tier } from '../engine/types';
import { getClient } from './backend';

export type Phase = 'pregnancy' | 'postpartum';

export interface Checkin {
  id: string; entry_date: string; phase: Phase; answers: Record<string, Answer>;
  note: string | null; tier: Tier | null; rules_version: string | null;
}

/** Device-local calendar date as YYYY-MM-DD. */
export const todayLocal = (d = new Date()): string => d.toLocaleDateString('en-CA');

export const phaseFor = (stage: string): Phase => (stage === 'after_birth' ? 'postpartum' : 'pregnancy');

/** One entry per day. Saving again on the same day replaces that day's entry. */
export async function saveCheckin(userId: string, e: Omit<Checkin, 'id' | 'entry_date'> & { entry_date?: string }): Promise<void> {
  const c = await getClient();
  const { error } = await c.from('checkins').upsert(
    { user_id: userId, entry_date: e.entry_date ?? todayLocal(), phase: e.phase, answers: e.answers, note: e.note, tier: e.tier, rules_version: e.rules_version },
    { onConflict: 'user_id,entry_date' },
  );
  if (error) throw error;
}

export async function listCheckins(limit = 90): Promise<Checkin[]> {
  const c = await getClient();
  const { data, error } = await c.from('checkins').select('id, entry_date, phase, answers, note, tier, rules_version').order('entry_date', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as Checkin[];
}

export async function deleteCheckin(id: string): Promise<void> {
  const c = await getClient();
  const { error } = await c.from('checkins').delete().eq('id', id);
  if (error) throw error;
}
