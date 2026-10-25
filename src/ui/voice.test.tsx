import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../routes';
import { setLang } from '../lib/i18n';
import { AuthProvider } from '../state/auth';
import { SessionProvider } from '../state/session';

type Handlers = { onresult?: (e: unknown) => void; onerror?: (e: { error: string }) => void; onend?: () => void };
let handlers: Handlers = {};

class FakeRec {
  lang = ''; continuous = false; interimResults = false;
  set onresult(f: (e: unknown) => void) { handlers.onresult = f; }
  set onerror(f: (e: { error: string }) => void) { handlers.onerror = f; }
  set onend(f: () => void) { handlers.onend = f; }
  start() {}
  stop() { handlers.onend?.(); }
  abort() {}
}
const say = (text: string) => handlers.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: text }], { isFinal: true })] });

const app = (path: string) => render(<AuthProvider><SessionProvider><MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter></SessionProvider></AuthProvider>);

beforeEach(() => { handlers = {}; setLang('en'); (window as unknown as Record<string, unknown>).SpeechRecognition = FakeRec; });
afterEach(() => { delete (window as unknown as Record<string, unknown>).SpeechRecognition; sessionStorage.clear(); setLang('hi'); });

describe('speak screen: edited and uncertain input', () => {
  it('removing the only RED sign does not give RED, and the check carries on with questions', async () => {
    const user = userEvent.setup();
    app('/speak');
    await user.click(screen.getByRole('button', { name: /Start speaking/ }));
    say('pregnant and having fits');
    await user.click(screen.getByRole('button', { name: /Stop/ }));
    await user.click(await screen.findByRole('button', { name: 'Remove' }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Fits|bleeding|headache/i);
    expect(screen.queryByText(/Go to the hospital now/)).toBeNull();
  });
  it('changing the detected stage re-reads the same words for that stage', async () => {
    const user = userEvent.setup();
    app('/speak');
    await user.click(screen.getByRole('button', { name: /Start speaking/ }));
    say('there is blood');
    await user.click(screen.getByRole('button', { name: /Stop/ }));
    await user.click(await screen.findByRole('button', { name: /I had my baby/ }));
    // after birth, plain bleeding without "heavy" is only not sure (AMBER), not RED
    expect(await screen.findByText(/heavy bleeding/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Change' }));
    await user.click(screen.getByRole('button', { name: /I am pregnant/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByRole('heading', { level: 1, name: /hospital now/ })).toBeInTheDocument();
  });
  it('contradictory speech is not guessed', async () => {
    const user = userEvent.setup();
    const { parseAnswer } = await import('../lib/voiceParse');
    expect(parseAnswer('yes no')).toBeNull();
    expect(parseAnswer('नहीं हाँ')).toBeNull();
    void user;
  });
});

describe('speak screen', () => {
  it('goes straight to RED with a call link when a spoken sign is RED', async () => {
    const user = userEvent.setup();
    app('/speak');
    await user.click(screen.getByRole('button', { name: /Start speaking/ }));
    say('I am pregnant and I am having fits');
    await user.click(screen.getByRole('button', { name: /Stop/ }));
    expect(await screen.findByText(/We heard/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Go to the hospital now');
    expect(screen.getByRole('link', { name: /Call 108/ })).toHaveAttribute('href', 'tel:108');
  });

  it('lets her remove a wrong sign and asks for the stage when unclear', async () => {
    const user = userEvent.setup();
    app('/speak');
    await user.click(screen.getByRole('button', { name: /Start speaking/ }));
    say('bahut sir dard hai');
    await user.click(screen.getByRole('button', { name: /Stop/ }));
    expect(await screen.findByText(/Where are you now/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /I am pregnant/ }));
    expect(screen.getByText(/bad headache or blurred vision/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.queryByText(/bad headache or blurred vision/)).toBeNull();
    expect(screen.getByText(/did not find a danger sign/)).toBeInTheDocument();
  });

  it('shows a helpful message when the microphone is blocked', async () => {
    const user = userEvent.setup();
    app('/speak');
    await user.click(screen.getByRole('button', { name: /Start speaking/ }));
    handlers.onerror?.({ error: 'not-allowed' });
    handlers.onend?.();
    expect(await screen.findByRole('alert')).toHaveTextContent(/microphone is blocked/i);
  });

  it('says voice is unavailable when the browser has no speech recognition', () => {
    delete (window as unknown as Record<string, unknown>).SpeechRecognition;
    app('/speak');
    expect(screen.getByRole('alert')).toHaveTextContent(/not available in this browser/i);
    expect(screen.getByRole('button', { name: /Start speaking/ })).toBeDisabled();
  });
});

describe('voice answer on a question', () => {
  const toFirstQuestion = async (user: ReturnType<typeof userEvent.setup>) => {
    app('/');
    await user.click(screen.getByRole('button', { name: 'English' }));
    await user.click(screen.getByRole('button', { name: /pregnant or a new mother/i }));
    await user.click(screen.getByRole('button', { name: /I am pregnant/ }));
  };
  it('a spoken No is confirmed before it counts, and Say it again listens again', async () => {
    const user = userEvent.setup();
    await toFirstQuestion(user);
    const first = screen.getByRole('heading', { level: 1 }).textContent;
    await user.click(screen.getByRole('button', { name: /Answer by voice/ }));
    say('nahi'); handlers.onend?.();
    expect(await screen.findByText(/That means No/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(first); // not applied yet
    await user.click(screen.getByRole('button', { name: 'Say it again' }));
    say('haan'); handlers.onend?.();
    expect(await screen.findByRole('heading', { level: 1, name: /hospital now/ })).toBeInTheDocument();
  });
  it('confirming a spoken No moves on to the next question', async () => {
    const user = userEvent.setup();
    await toFirstQuestion(user);
    const first = screen.getByRole('heading', { level: 1 }).textContent;
    await user.click(screen.getByRole('button', { name: /Answer by voice/ }));
    say('No'); handlers.onend?.();
    await user.click(await screen.findByRole('button', { name: 'Yes, that is right' }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).not.toBe(first);
  });
  it('records a spoken yes and ends at once on a RED sign', async () => {
    const user = userEvent.setup();
    app('/');
    await user.click(screen.getByRole('button', { name: 'English' }));
    await user.click(screen.getByRole('button', { name: /pregnant or a new mother/i }));
    await user.click(screen.getByRole('button', { name: /I am pregnant/ }));
    await user.click(screen.getByRole('button', { name: /Answer by voice/ }));
    say('haan');
    handlers.onend?.();
    expect(await screen.findByRole('heading', { level: 1, name: /hospital now/ })).toBeInTheDocument();
  });
  it('asks again when the answer is not understood', async () => {
    const user = userEvent.setup();
    app('/');
    await user.click(screen.getByRole('button', { name: 'English' }));
    await user.click(screen.getByRole('button', { name: /pregnant or a new mother/i }));
    await user.click(screen.getByRole('button', { name: /I am pregnant/ }));
    await user.click(screen.getByRole('button', { name: /Answer by voice/ }));
    say('maybe tomorrow');
    handlers.onend?.();
    expect(await screen.findByRole('alert')).toHaveTextContent(/did not understand/i);
  });
});
