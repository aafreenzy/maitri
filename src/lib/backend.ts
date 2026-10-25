import type { SupabaseClient } from '@supabase/supabase-js';

// The project URL and the anon key are meant to be public. The service key must never be here.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** False until the owner sets both variables. When false the app shows no account features. */
export const backendConfigured = (): boolean => Boolean(url && key);

let client: Promise<SupabaseClient> | null = null;

/**
 * The client is loaded on demand, so the emergency check never waits for it and makes no request
 * to the backend. The session is stored under a maitri: key, so Exit now removes it.
 */
export function getClient(): Promise<SupabaseClient> {
  if (!url || !key) return Promise.reject(new Error('not-configured'));
  client ??= import('@supabase/supabase-js').then((m) =>
    m.createClient(url, key, { auth: { storageKey: 'maitri:auth', persistSession: true, autoRefreshToken: true } }),
  );
  return client;
}

/** Accepts 10 digits starting 6 to 9, with or without +91, 91 or a leading 0. Returns +91XXXXXXXXXX. */
export function toIndianE164(input: string): string | null {
  const digits = input.replace(/[\s()-]/g, '');
  const m = /^(?:\+91|91|0)?([6-9]\d{9})$/.exec(digits);
  return m ? `+91${m[1]}` : null;
}

export type BackendErrorCode = 'not-configured' | 'network' | 'too-many' | 'bad-code' | 'bad-phone' | 'other';

export function backendErrorCode(e: unknown): BackendErrorCode {
  const err = e as { message?: string; status?: number; code?: string; name?: string } | null;
  const msg = (err?.message ?? '').toLowerCase();
  if (msg === 'not-configured') return 'not-configured';
  if (err?.status === 429 || msg.includes('rate limit') || msg.includes('too many')) return 'too-many';
  if (msg.includes('token') && (msg.includes('expired') || msg.includes('invalid'))) return 'bad-code';
  if (msg.includes('phone') && msg.includes('invalid')) return 'bad-phone';
  if (msg.includes('fetch') || msg.includes('network') || err?.name === 'AuthRetryableFetchError') return 'network';
  return 'other';
}
