import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applicableQuestions, data } from '../engine/loadData';
import type { StageId } from '../engine/types';
import { setLang } from '../lib/i18n';
import { AppRoutes } from '../routes';
import { AuthProvider } from '../state/auth';
import { SessionProvider } from '../state/session';

const STAGE_BUTTON: Record<StageId, RegExp> = { pregnant: /I am pregnant/, labour: /Labour pains have started/, after_birth: /I had my baby/ };

function BrowserBack() { const nav = useNavigate(); return <button type="button" onClick={() => nav(-1)}>test-browser-back</button>; }
const mount = (path = '/') => render(
  <AuthProvider><SessionProvider><MemoryRouter initialEntries={[path]}><AppRoutes /><BrowserBack /></MemoryRouter></SessionProvider></AuthProvider>,
);
type User = ReturnType<typeof userEvent.setup>;

async function begin(user: User, stage: StageId) {
  await user.click(screen.getByRole('button', { name: 'English' }));
  await user.click(screen.getByRole('button', { name: /pregnant or a new mother/i }));
  await user.click(screen.getByRole('button', { name: STAGE_BUTTON[stage] }));
}
const heading = () => screen.getByRole('heading', { level: 1 }).textContent ?? '';
const click = (user: User, name: string) => user.click(screen.getByRole('button', { name }));
const qText = (id: string) => data.questions.find((q) => q.id === id)!.en;

/** Answers No until the named question, then gives `value`. */
async function answerUntil(user: User, id: string, value: 'Yes' | 'No' | 'Not sure') {
  for (let i = 0; i < 13; i++) {
    if (/hospital now|doctor today|No danger sign/.test(heading())) return;
    if (heading() === qText(id)) { await click(user, value); return; }
    await click(user, 'No');
  }
}

beforeEach(() => setLang('en'));
afterEach(() => { sessionStorage.clear(); setLang('hi'); });

describe('urgent signs stop the check at once and show RED', () => {
  const redAlone = (stage: StageId) => applicableQuestions(stage).filter((q) =>
    data.rules.some((r) => r.type === 'single' && r.question_id === q.id && r.stages.includes(stage) && r.tier_if.yes === 'RED'));
  for (const stage of ['pregnant', 'labour', 'after_birth'] as StageId[]) {
    it(`${stage}: every RED sign`, async () => {
      for (const q of redAlone(stage)) {
        const user = userEvent.setup();
        const { unmount } = mount();
        await begin(user, stage);
        await answerUntil(user, q.id, 'Yes');
        expect(heading(), `${stage} ${q.id}`).toBe('Go to the hospital now');
        expect(screen.getByRole('link', { name: /Call/ })).toHaveAttribute('href', expect.stringMatching(/^tel:/));
        unmount(); sessionStorage.clear();
      }
    });
  }
});

describe('several signs together', () => {
  it('two AMBER-class signs after birth become RED', async () => {
    const user = userEvent.setup();
    mount();
    await begin(user, 'after_birth');
    await answerUntil(user, 'q_discharge', 'Yes');
    expect(heading()).toBe(qText('q_pale_breathless')); // discharge alone is not RED, the check goes on
    await answerUntil(user, 'q_leg_pain', 'Yes');
    expect(heading()).toBe('Go to the hospital now');
  });
  it('one AMBER-class sign alone gives AMBER at the end', async () => {
    const user = userEvent.setup();
    mount();
    await begin(user, 'pregnant');
    await answerUntil(user, 'q_baby_moves', 'Yes');
    await answerUntil(user, 'q_confused', 'No');
    expect(heading()).toBe('See the ANM, ASHA or doctor today');
  });
});

describe('uncertain answers escalate', () => {
  it('not sure on a RED-class question gives AMBER, never GREEN, with the note', async () => {
    const user = userEvent.setup();
    mount();
    await begin(user, 'pregnant');
    await answerUntil(user, 'q_fits', 'Not sure');
    for (let i = 0; i < 10 && !/doctor today|hospital now|No danger/.test(heading()); i++) await click(user, 'No');
    expect(heading()).toBe('See the ANM, ASHA or doctor today');
    expect(screen.getByText(/not sure about some answers/i)).toBeInTheDocument();
  });
  it('not sure to everything is at least AMBER', async () => {
    const user = userEvent.setup();
    mount();
    await begin(user, 'labour');
    for (let i = 0; i < 12 && !/doctor today|hospital now|No danger/.test(heading()); i++) await click(user, 'Not sure');
    expect(heading()).not.toBe('No danger sign told');
  });
});

describe('going back and changing answers', () => {
  it('Back, then Yes on the earlier question, changes the outcome to RED at once', async () => {
    const user = userEvent.setup();
    mount();
    await begin(user, 'pregnant');
    await click(user, 'No'); // fits
    expect(heading()).toBe(qText('q_bleed_preg'));
    await click(user, 'Back');
    expect(heading()).toBe(qText('q_fits'));
    await click(user, 'Yes');
    expect(heading()).toBe('Go to the hospital now');
  });

  it('a contradictory change (Yes, then No after Back) clears the RED and the check continues to GREEN', async () => {
    const user = userEvent.setup();
    mount();
    await begin(user, 'pregnant');
    await click(user, 'Yes'); // fits -> RED
    expect(heading()).toBe('Go to the hospital now');
    await user.click(screen.getByRole('button', { name: 'test-browser-back' }));
    expect(heading()).toBe(qText('q_fits'));
    await click(user, 'No');
    for (let i = 0; i < 12 && !/No danger|doctor today|hospital now/.test(heading()); i++) await click(user, 'No');
    expect(heading()).toBe('No danger sign told');
  });

  it('after an early RED, browser back and answering the rest still ends at RED when the sign stays Yes', async () => {
    const user = userEvent.setup();
    mount();
    await begin(user, 'pregnant');
    await click(user, 'No');
    await click(user, 'Yes'); // bleeding -> RED
    expect(heading()).toBe('Go to the hospital now');
    await user.click(screen.getByRole('button', { name: 'test-browser-back' }));
    expect(heading()).toBe(qText('q_bleed_preg'));
    await click(user, 'Yes');
    expect(heading()).toBe('Go to the hospital now');
  });

  it('the first question has Back disabled', async () => {
    const user = userEvent.setup();
    mount();
    await begin(user, 'pregnant');
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
  });

  it('the slip lists only what she answered, not the questions skipped by the early exit', async () => {
    const user = userEvent.setup();
    mount();
    await begin(user, 'pregnant');
    await click(user, 'Yes');
    await user.click(screen.getByRole('button', { name: 'Show this to the ASHA or doctor' }));
    expect(screen.getByText('fits or fainting')).toBeInTheDocument();
    expect(document.querySelector('.slip')!.textContent).not.toMatch(/very bad belly pain/);
  });
});

describe('changing stage or mode mid-way', () => {
  it('changing the stage starts the answers afresh', async () => {
    const user = userEvent.setup();
    mount();
    await begin(user, 'pregnant');
    await click(user, 'No');
    await user.click(screen.getByRole('button', { name: 'test-browser-back' })); // question 1
    await user.click(screen.getByRole('button', { name: 'test-browser-back' })); // stage screen
    await user.click(screen.getByRole('button', { name: STAGE_BUTTON.after_birth }));
    expect(heading()).toBe(qText('q_fits'));
    expect(screen.queryByText('No', { selector: 'p.muted' })).toBeNull();
  });
});
