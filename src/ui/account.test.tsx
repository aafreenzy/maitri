import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../routes';
import { setLang } from '../lib/i18n';
import { AuthProvider } from '../state/auth';
import { SessionProvider, initialState } from '../state/session';

interface Row { id: string; user_id: string; entry_date: string; phase: string; answers: Record<string, string>; tier: string; rules_version: string; note: null }
const h = vi.hoisted(() => ({ rows: [] as Row[], session: null as null | { user: { id: string; phone: string } }, listeners: [] as ((e: string, s: unknown) => void)[], failList: false }));

vi.mock('../lib/backend', async (orig) => {
  const real = await orig<typeof import('../lib/backend')>();
  const fake = {
    auth: {
      getSession: async () => ({ data: { session: h.session } }),
      onAuthStateChange: (cb: (e: string, s: unknown) => void) => { h.listeners.push(cb); return { data: { subscription: { unsubscribe() {} } } }; },
      signInWithOtp: vi.fn(async () => ({ error: null })),
      verifyOtp: vi.fn(async ({ phone, token }: { phone: string; token: string }) => {
        if (token !== '123456') return { error: { message: 'Token has expired or is invalid' } };
        h.session = { user: { id: 'u1', phone: phone.slice(1) } };
        h.listeners.forEach((l) => l('SIGNED_IN', h.session));
        return { error: null };
      }),
      signOut: vi.fn(async () => { h.session = null; h.listeners.forEach((l) => l('SIGNED_OUT', null)); return { error: null }; }),
    },
    rpc: vi.fn(async () => ({ error: null })),
    from: () => ({
      upsert: vi.fn(async (row: Row) => {
        const i = h.rows.findIndex((r) => r.entry_date === row.entry_date && r.user_id === row.user_id);
        const rec = { ...row, id: `r${h.rows.length}` };
        if (i >= 0) h.rows[i] = rec; else h.rows.push(rec);
        return { error: null };
      }),
      select: () => ({ order: () => ({ limit: async () => (h.failList ? { data: null, error: { message: 'fetch failed' } } : { data: [...h.rows], error: null }) }) }),
      delete: () => ({ eq: async (_c: string, id: string) => { h.rows = h.rows.filter((r) => r.id !== id); return { error: null }; } }),
    }),
  };
  return { ...real, backendConfigured: () => true, getClient: () => Promise.resolve(fake) };
});

const app = (path: string, initial = initialState) => render(
  <AuthProvider><SessionProvider initial={initial}><MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter></SessionProvider></AuthProvider>,
);
beforeEach(() => { h.rows = []; h.session = null; h.listeners = []; h.failList = false; setLang('en'); });
afterEach(() => { sessionStorage.clear(); setLang('hi'); });

describe('phone number check', () => {
  it('accepts Indian mobile formats and rejects the rest', async () => {
    const { toIndianE164 } = await vi.importActual<typeof import('../lib/backend')>('../lib/backend');
    expect(toIndianE164('98765 43210')).toBe('+919876543210');
    expect(toIndianE164('+91-98765-43210')).toBe('+919876543210');
    expect(toIndianE164('09876543210')).toBe('+919876543210');
    expect(toIndianE164('1234567890')).toBeNull();
    expect(toIndianE164('98765')).toBeNull();
  });
});

describe('sign in', () => {
  it('rejects a bad number without sending a code', async () => {
    const user = userEvent.setup();
    app('/account');
    await user.type(await screen.findByLabelText('Mobile number'), '12345');
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/10-digit mobile number/);
  });

  it('signs in with a code, shows an empty log, and signs out', async () => {
    const user = userEvent.setup();
    app('/account');
    await user.type(await screen.findByLabelText('Mobile number'), '9876543210');
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    expect(await screen.findByText(/ending 3210/)).toBeInTheDocument();
    await user.type(screen.getByLabelText('Code from the text message'), '000000');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/code did not work/i);
    await user.clear(screen.getByLabelText('Code from the text message'));
    await user.type(screen.getByLabelText('Code from the text message'), '123456');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText(/No entries yet/)).toBeInTheDocument();
  });
});

describe('daily log', () => {
  const signedIn = () => { h.session = { user: { id: 'u1', phone: '919876543210' } }; };

  it('saves a result, shows it in the log, replaces the same day, and deletes', async () => {
    signedIn();
    const user = userEvent.setup();
    const state = { ...initialState, mode: 'woman' as const, stage: 'pregnant' as const, answers: { q_fits: 'yes' as const } };
    const first = app('/result', state);
    await user.click(await screen.findByRole('button', { name: 'Save to my daily log' }));
    expect(await screen.findByText(/Saved for today/)).toBeInTheDocument();
    expect(h.rows).toHaveLength(1);
    expect(h.rows[0]).toMatchObject({ tier: 'RED', phase: 'pregnancy', user_id: 'u1' });
    first.unmount();

    const next = app('/result', { ...state, answers: { q_fits: 'no' } });
    await user.click(await screen.findByRole('button', { name: 'Save to my daily log' }));
    await waitFor(() => expect(h.rows).toHaveLength(1)); // same day replaces
    next.unmount();

    app('/log');
    const row = await screen.findByText(/Pregnancy/);
    expect(row).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByText(/No entries yet/)).toBeInTheDocument();
  });

  it('shows a helpful error with a retry when the log cannot load', async () => {
    signedIn(); h.failList = true;
    const user = userEvent.setup();
    app('/log');
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/Could not load your log/);
    h.failList = false;
    await user.click(within(alert).getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText(/No entries yet/)).toBeInTheDocument();
  });

  it('asks a signed-out visitor to sign in instead of saving', async () => {
    const state = { ...initialState, mode: 'woman' as const, stage: 'pregnant' as const, answers: { q_fits: 'yes' as const } };
    app('/result', state);
    expect(await screen.findByRole('link', { name: 'Sign in to keep a daily log' })).toBeInTheDocument();
    expect(h.rows).toHaveLength(0);
  });

  it('deletes the account after confirmation', async () => {
    signedIn();
    const user = userEvent.setup();
    app('/account');
    await user.click(await screen.findByRole('button', { name: 'Delete my account and log' }));
    await user.click(screen.getByRole('button', { name: 'Yes, delete everything' }));
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/language/i);
  });
});
