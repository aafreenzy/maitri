import type { StageId, Tier } from '../engine/types';

const SETTING = 'maitri:asha:save';
const PREFIX = 'maitri:check:';

export interface SavedCheck { id: string; stage: StageId; tier: Tier; yes_count: number; ts: number }

export function isSaveEnabled(): boolean {
  try { return localStorage.getItem(SETTING) === '1'; } catch { return false; }
}
export function setSaveEnabled(on: boolean) {
  try { if (on) localStorage.setItem(SETTING, '1'); else localStorage.removeItem(SETTING); } catch { /* ignore */ }
}

/** Stores only stage, tier, number of yes answers and time. No names, no answer detail. */
export function saveCheck(c: Omit<SavedCheck, 'id'>): SavedCheck | null {
  if (!isSaveEnabled()) return null;
  const rec: SavedCheck = { id: Math.random().toString(36).slice(2, 10), ...c };
  try { localStorage.setItem(PREFIX + rec.id, JSON.stringify(rec)); } catch { return null; }
  return rec;
}

const RANK: Record<Tier, number> = { RED: 0, AMBER: 1, GREEN: 2 };

export function listChecks(): SavedCheck[] {
  const out: SavedCheck[] = [];
  try {
    for (const k of Object.keys(localStorage)) {
      if (!k.startsWith(PREFIX)) continue;
      try { out.push(JSON.parse(localStorage.getItem(k) ?? '') as SavedCheck); } catch { /* skip bad record */ }
    }
  } catch { /* ignore */ }
  return out.sort((a, b) => RANK[a.tier] - RANK[b.tier] || b.ts - a.ts);
}

export function deleteCheck(id: string) {
  try { localStorage.removeItem(PREFIX + id); } catch { /* ignore */ }
}
export function clearChecks() {
  try { for (const k of Object.keys(localStorage)) if (k.startsWith(PREFIX)) localStorage.removeItem(k); } catch { /* ignore */ }
}
