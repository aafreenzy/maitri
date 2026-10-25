import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import type { Answer, Mode, StageId } from '../engine/types';
import { setLang } from '../lib/i18n';
import { AppRoutes } from '../routes';
import { AuthProvider } from '../state/auth';
import { SessionProvider, initialState, type SessionState } from '../state/session';

const BRAND = new Set(['maitri', 'anm', 'asha', 'mcp', 'jssk', 'chrome', 'mohfw', 'who', 'python', 'pdf']);
const state = (stage: StageId, answers: Record<string, Answer>, mode: Mode = 'woman'): SessionState => ({ ...initialState, mode, stage, answers });

/** Every visible word and every accessibility label on the page, ignoring passages marked as another language. */
function pageText(): string[] {
  const out: string[] = [];
  const skip = (el: Element | null): boolean => {
    for (let e = el; e; e = e.parentElement) {
      if (['SCRIPT', 'STYLE'].includes(e.tagName) || e.classList.contains('ids') || e.getAttribute('translate') === 'no') return true;
      const l = e.getAttribute('lang');
      if (l && l !== document.documentElement.lang) return true;
    }
    return false;
  };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) if (n.textContent?.trim() && !skip(n.parentElement)) out.push(n.textContent.trim());
  document.body.querySelectorAll('[aria-label], [title], img[alt]').forEach((el) => {
    if (skip(el)) return;
    for (const a of ['aria-label', 'title', 'alt']) { const v = el.getAttribute(a); if (v) out.push(v); }
  });
  return out;
}
const latin = (xs: string[]) => xs.flatMap((x) => x.match(/[A-Za-z]{3,}/g) ?? []).filter((w) => !BRAND.has(w.toLowerCase()));
const devanagari = (xs: string[]) => xs.filter((x) => /[ऀ-ॿ]/.test(x));

const SCREENS: [string, string, SessionState][] = [
  ['language', '/', initialState],
  ['mode', '/mode', initialState],
  ['stage', '/stage', { ...initialState, mode: 'family' }],
  ['speak', '/speak', initialState],
  ['question', '/q/0', state('after_birth', {})],
  ['question 2', '/q/1', state('pregnant', { q_fits: 'no' })],
  ['result RED', '/result', state('after_birth', { q_bleed_pp: 'yes' })],
  ['result RED family', '/result', state('pregnant', { q_fits: 'yes' }, 'family')],
  ['result AMBER with not sure', '/result', state('pregnant', { q_fits: 'not_sure', q_baby_moves: 'yes' })],
  ['result GREEN', '/result', state('pregnant', Object.fromEntries(['q_fits', 'q_bleed_preg', 'q_headache_vision', 'q_swelling', 'q_fever', 'q_water_leak', 'q_pale_breathless', 'q_hard_breath', 'q_belly_pain', 'q_baby_moves', 'q_confused'].map((k) => [k, 'no' as Answer])))],
  ['result wellbeing', '/result', state('after_birth', { q_wellbeing: 'yes' })],
  ['plan', '/plan', state('after_birth', { q_bleed_pp: 'yes' })],
  ['slip', '/slip', state('after_birth', { q_bleed_pp: 'yes', q_fever: 'not_sure' })],
  ['support', '/support', initialState],
  ['about', '/about', initialState],
  ['trust', '/trust', initialState],
  ['review', '/review', initialState],
  ['asha', '/asha', initialState],
  ['account', '/account', initialState],
  ['not found', '/nope', initialState],
];

afterEach(() => { sessionStorage.clear(); setLang('hi'); });

async function open(path: string, s: SessionState) {
  render(<AuthProvider><SessionProvider initial={s}><MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter></SessionProvider></AuthProvider>);
  // Trust, Review and the ASHA list load lazily: wait for the real page, not the loading placeholder.
  await waitFor(() => expect(document.querySelector('[role="status"]')?.textContent ?? '').not.toMatch(/Loading|लोड हो रहा/));
  await waitFor(() => expect(document.querySelector('h1, [role="alert"]')).not.toBeNull());
  await new Promise((r) => setTimeout(r, 30));
}

describe('Hindi: no English words on any screen', () => {
  for (const [name, path, s] of SCREENS) {
    it(name, async () => {
      setLang('hi');
      await open(path, s);
      expect(latin(pageText()), `${name}: English text in Hindi`).toEqual([]);
    });
  }
});

describe('English: no Hindi text on any screen except the language names and the wordmark', () => {
  for (const [name, path, s] of SCREENS) {
    it(name, async () => {
      setLang('en');
      await open(path, s);
      const bad = devanagari(pageText()).filter((x) => !['हिन्दी', 'मैत्री'].includes(x));
      expect(bad, `${name}: Hindi text in English`).toEqual([]);
    });
  }
});

describe('the page language attribute follows the choice', () => {
  it('lang is hi, then en', async () => {
    setLang('hi'); expect(document.documentElement.lang).toBe('hi');
    setLang('en'); expect(document.documentElement.lang).toBe('en');
  });
  it('choosing English on the first screen switches every later screen', async () => {
    const user = userEvent.setup();
    setLang('hi');
    await open('/', initialState);
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Who is using Maitri?');
  });
});
