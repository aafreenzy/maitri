import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../routes';
import { setLang } from '../lib/i18n';
import { AuthProvider } from '../state/auth';
import { SessionProvider, initialState, type SessionState } from '../state/session';

const mount = (s: SessionState, path = '/result') => render(<AuthProvider><SessionProvider initial={s}><MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter></SessionProvider></AuthProvider>);
beforeEach(() => setLang('en'));
afterEach(() => { sessionStorage.clear(); setLang('hi'); });

describe('Why this result?', () => {
  it('lists the rule, its level, its source and the version, and says no AI decides', async () => {
    const user = userEvent.setup();
    mount({ ...initialState, mode: 'woman', stage: 'pregnant', answers: { q_fits: 'yes' } });
    await user.click(screen.getByRole('button', { name: 'Why this result?' }));
    const dialog = screen.getByRole('dialog', { name: 'Why this result?' });
    expect(within(dialog).getByText(/No AI decides this/)).toBeInTheDocument();
    expect(within(dialog).getByText('fits or fainting')).toBeInTheDocument();
    expect(within(dialog).getByText('R-FITS-01')).toBeInTheDocument();
    expect(within(dialog).getAllByText(/Mother and Child Protection/).length).toBeGreaterThan(0);
    expect(within(dialog).getByText(/Not yet reviewed by a clinician/)).toBeInTheDocument();
  });
  it('after an early RED it shows only the rule for what she answered, not questions she was never asked', async () => {
    const user = userEvent.setup();
    mount({ ...initialState, mode: 'woman', stage: 'after_birth', answers: { q_bleed_pp: 'yes' } });
    await user.click(screen.getByRole('button', { name: 'Why this result?' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('R-PPH-01')).toBeInTheDocument();
    expect(within(dialog).queryByText(/very bad belly pain/)).toBeNull();
    expect(within(dialog).queryAllByText(/^R-/)).toHaveLength(1);
  });
  it('says when you were not sure', async () => {
    const user = userEvent.setup();
    mount({ ...initialState, mode: 'woman', stage: 'pregnant', answers: { q_fits: 'not_sure' } });
    await user.click(screen.getByRole('button', { name: 'Why this result?' }));
    expect(screen.getByText(/You were not sure about this/)).toBeInTheDocument();
  });
  it('says none applied on a GREEN result', async () => {
    const user = userEvent.setup();
    const all = ['q_fits', 'q_bleed_preg', 'q_headache_vision', 'q_swelling', 'q_fever', 'q_water_leak', 'q_pale_breathless', 'q_hard_breath', 'q_belly_pain', 'q_baby_moves', 'q_confused'];
    mount({ ...initialState, mode: 'woman', stage: 'pregnant', answers: Object.fromEntries(all.map((k) => [k, 'no' as const])) });
    await user.click(screen.getByRole('button', { name: 'Why this result?' }));
    expect(screen.getByText(/None of the rules applied/)).toBeInTheDocument();
  });
  it('works in Hindi without English words except document titles', async () => {
    setLang('hi');
    const user = userEvent.setup();
    mount({ ...initialState, mode: 'woman', stage: 'pregnant', answers: { q_fits: 'yes' } });
    await user.click(screen.getByRole('button', { name: 'यह नतीजा क्यों?' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/कोई AI यह तय नहीं करता/)).toBeInTheDocument();
    expect(within(dialog).getByText('दौरे या बेहोशी')).toBeInTheDocument();
  });
});

describe('emergency call on the first screen', () => {
  it('shows the ambulance number from config before anything else is asked', () => {
    mount(initialState, '/');
    expect(screen.getByRole('link', { name: /Emergency\? Call 108 now/ })).toHaveAttribute('href', 'tel:108');
  });
  it('is in Hindi when the language is Hindi', () => {
    setLang('hi');
    mount(initialState, '/');
    expect(screen.getByRole('link', { name: /आपातकाल\? अभी 108 पर कॉल कीजिए/ })).toHaveAttribute('href', 'tel:108');
  });
});
