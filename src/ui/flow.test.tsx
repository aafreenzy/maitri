import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach } from 'vitest';
import { AppRoutes } from '../routes';
import { setLang } from '../lib/i18n';
import { SessionProvider } from '../state/session';
import { buildExport } from './screens/RuleReview';
import { slipToBlob } from '../lib/slip';

const app = (path: string) => render(<SessionProvider><MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter></SessionProvider>);
afterEach(() => { setLang('hi'); sessionStorage.clear(); });

async function startCheck(user: ReturnType<typeof userEvent.setup>, lang: 'English' | 'हिन्दी', mode: RegExp, stage: RegExp) {
  await user.click(screen.getByRole('button', { name: lang }));
  await user.click(screen.getByRole('button', { name: mode }));
  await user.click(screen.getByRole('button', { name: stage }));
}

describe('guards', () => {
  it('redirects /q, /result and /plan to the language screen without a stage', () => {
    for (const p of ['/q/0', '/result', '/plan']) {
      const { unmount } = app(p);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/भाषा|language/i);
      unmount();
    }
  });
});

describe('RED flow in English, family mode', () => {
  it('answers heavy bleeding yes and reaches RED, plan and slip', async () => {
    const user = userEvent.setup();
    app('/');
    await startCheck(user, 'English', /family/i, /I had my baby/i);
    // Answer yes to heavy bleeding, no to everything else.
    // One RED sign ends the check at once, so the loop stops after the bleeding question.
    for (let i = 0; i < 11; i++) {
      const h = screen.getByRole('heading', { level: 1 });
      if (/hospital now/.test(h.textContent ?? '')) break;
      const isBleed = /Heavy bleeding/.test(h.textContent ?? '');
      await user.click(screen.getByRole('button', { name: isBleed ? 'Yes' : 'No' }));
    }
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('She needs to go to the hospital now');
    expect(screen.getByRole('link', { name: /Call 108/ })).toHaveAttribute('href', 'tel:108');
    await user.click(screen.getByRole('button', { name: 'Open the go-now plan' }));
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: 'Show this to the ASHA or doctor' }));
    expect(screen.getByText('Maitri slip')).toBeInTheDocument();
    expect(document.querySelectorAll('.slip input')).toHaveLength(0);
    const slip = document.querySelector('.slip') as HTMLElement;
    expect(within(slip).getByText('heavy bleeding')).toBeInTheDocument();
    expect(within(slip).getByText('None')).toBeInTheDocument(); // nothing was left as not sure when the check ended early
  });
});

describe('GREEN and not sure', () => {
  it('all no gives the calm result and never says fine', async () => {
    const user = userEvent.setup();
    app('/');
    await startCheck(user, 'English', /pregnant or a new mother/i, /I am pregnant/i);
    for (let i = 0; i < 11; i++) await user.click(screen.getByRole('button', { name: 'No' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('No danger sign told');
    expect(document.body.textContent).not.toMatch(/\bfine\b|\bsafe\b/i);
    expect(screen.queryByRole('link', { name: /Call/ })).toBeNull();
  });
  it('not sure raises the result to AMBER with a note', async () => {
    const user = userEvent.setup();
    app('/');
    await startCheck(user, 'English', /pregnant or a new mother/i, /I am pregnant/i);
    await user.click(screen.getByRole('button', { name: 'Not sure' }));
    for (let i = 0; i < 10; i++) await user.click(screen.getByRole('button', { name: 'No' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('See the ANM, ASHA or doctor today');
    expect(screen.getByText(/not sure about some answers/i)).toBeInTheDocument();
  });
});

describe('Back keeps answers', () => {
  it('returns to the previous question', async () => {
    const user = userEvent.setup();
    app('/');
    await startCheck(user, 'English', /pregnant or a new mother/i, /I am pregnant/i);
    await user.click(screen.getByRole('button', { name: 'No' }));
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('No', { selector: 'p.muted' })).toBeInTheDocument();
  });
});

describe('Trust page', () => {
  it('lists every number with status and shows 108 as unconfirmed', async () => {
    setLang('en');
    app('/trust');
    expect(await screen.findByText('How Maitri decides')).toBeInTheDocument();
    expect(screen.getByText('108')).toBeInTheDocument();
    expect(screen.getByText('14416')).toBeInTheDocument();
    expect(screen.getAllByText(/Not yet confirmed|पुष्टि/).length).toBeGreaterThanOrEqual(4);
  });
});

describe('Rule review export', () => {
  it('writes reviewer names for ticked rules only, nothing else changes', () => {
    const out = buildExport({ 'R-FITS-01': true }, { 'R-FITS-01': 'Dr A' });
    const r = out.rules.find((x) => x.id === 'R-FITS-01')!;
    expect(r.reviewed_by).toBe('Dr A');
    expect(out.rules.filter((x) => x.reviewed_by)).toHaveLength(1);
  });
});

describe('slip share helper', () => {
  it('renders after fonts are ready using the supplied renderer', async () => {
    const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const render = vi.fn().mockResolvedValue(png);
    const node = document.createElement('div');
    const blob = await slipToBlob(node, render);
    expect(render).toHaveBeenCalled();
    expect(blob.type).toContain('image');
  });
});
