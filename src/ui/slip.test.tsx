import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../routes';
import { setLang } from '../lib/i18n';
import { AuthProvider } from '../state/auth';
import { SessionProvider, initialState, type SessionState } from '../state/session';

const h = vi.hoisted(() => ({ pictureCalls: 0 }));
vi.mock('../lib/slip', async (orig) => {
  const real = await orig<typeof import('../lib/slip')>();
  return { ...real, shareSlip: vi.fn(async () => { h.pictureCalls++; return 'shared' as const; }) };
});

const redState: SessionState = { ...initialState, mode: 'woman', stage: 'after_birth', answers: { q_bleed_pp: 'yes', q_fever: 'not_sure' } };
const mount = (s: SessionState) => render(<AuthProvider><SessionProvider initial={s}><MemoryRouter initialEntries={['/slip']}><AppRoutes /></MemoryRouter></SessionProvider></AuthProvider>);

beforeEach(() => { setLang('en'); h.pictureCalls = 0; });
afterEach(() => { sessionStorage.clear(); setLang('hi'); Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }); });

describe('sharing the summary', () => {
  it('asks for consent first and shares nothing until she chooses', async () => {
    const share = vi.fn(async () => undefined);
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    const user = userEvent.setup();
    mount(redState);
    await user.click(screen.getByRole('button', { name: 'Share with my ASHA, doctor or family' }));
    const sheet = screen.getByRole('dialog', { name: 'Share this summary?' });
    expect(within(sheet).getByText(/no name or phone number/i)).toBeInTheDocument();
    expect(share).not.toHaveBeenCalled();
    expect(h.pictureCalls).toBe(0);
    await user.click(within(sheet).getByRole('button', { name: 'Not now' }));
    expect(share).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shares a picture only after she chooses it', async () => {
    const user = userEvent.setup();
    mount(redState);
    await user.click(screen.getByRole('button', { name: 'Share with my ASHA, doctor or family' }));
    await user.click(screen.getByRole('button', { name: 'Share a picture of this slip' }));
    expect(h.pictureCalls).toBe(1);
  });

  it('shares readable text with the signs, the result and the time, and nothing personal', async () => {
    const share = vi.fn(async () => undefined);
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    const user = userEvent.setup();
    mount(redState);
    await user.click(screen.getByRole('button', { name: 'Share with my ASHA, doctor or family' }));
    await user.click(screen.getByRole('button', { name: 'Share as text' }));
    expect(share).toHaveBeenCalledTimes(1);
    const text = (share.mock.calls[0] as unknown as [{ text: string }])[0].text;
    expect(text).toMatch(/Maitri slip/);
    expect(text).toMatch(/heavy bleeding/);
    expect(text).toMatch(/high fever/); // listed under not sure
    expect(text).toMatch(/Go to the hospital now/);
    expect(text).toMatch(/Time:/);
    expect(text).not.toMatch(/name:|phone:/i);
  });

  it('copies the text when the phone has no share sheet', async () => {
    const user = userEvent.setup(); // user-event installs its own clipboard, so stub ours after it
    const write = vi.fn(async () => undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: write }, configurable: true });
    mount(redState);
    await user.click(screen.getByRole('button', { name: 'Share with my ASHA, doctor or family' }));
    await user.click(screen.getByRole('button', { name: 'Share as text' }));
    expect(write).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/Copied/)).toBeInTheDocument();
  });

  it('says what to do when sharing fails', async () => {
    Object.defineProperty(navigator, 'share', { value: vi.fn(async () => { throw new Error('boom'); }), configurable: true });
    const user = userEvent.setup();
    mount(redState);
    await user.click(screen.getByRole('button', { name: 'Share with my ASHA, doctor or family' }));
    await user.click(screen.getByRole('button', { name: 'Share as text' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Use Print this slip instead/);
  });
});

describe('care contacts on the summary', () => {
  it('shows the ambulance number with its status, from config', () => {
    mount(redState);
    const slip = document.querySelector('.slip') as HTMLElement;
    expect(within(slip).getByText('Care contacts')).toBeInTheDocument();
    expect(within(slip).getByText('108')).toBeInTheDocument();
    expect(slip.textContent).toMatch(/Not yet confirmed/);
  });
  it('adds the confirmed Tele-MANAS number when the wellbeing flag is set', () => {
    mount({ ...redState, answers: { q_wellbeing: 'yes' } });
    const slip = document.querySelector('.slip') as HTMLElement;
    expect(within(slip).getByText('14416')).toBeInTheDocument();
    expect(slip.textContent).toMatch(/Confirmed/);
  });
  it('shows no contacts on a GREEN summary', () => {
    const all = ['q_fits', 'q_bleed_pp', 'q_headache_vision', 'q_fever', 'q_discharge', 'q_pale_breathless', 'q_hard_breath', 'q_belly_pain', 'q_leg_pain', 'q_confused', 'q_wellbeing'];
    mount({ ...redState, answers: Object.fromEntries(all.map((k) => [k, 'no' as const])) });
    expect(screen.queryByText('Care contacts')).toBeNull();
  });
});
