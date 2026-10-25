import { afterEach } from 'vitest';
import { clearChecks, listChecks, saveCheck, setSaveEnabled } from './asha';
import { getNumber, telHref, unconfirmedNumbers, featureFlag } from './config';
import { exitNow, wipeStorage } from './exit';
import { questionShort, setLang, t } from './i18n';
import { data } from '../engine/loadData';

afterEach(() => { setLang('hi'); localStorage.clear(); sessionStorage.clear(); });

describe('i18n', () => {
  it('substitutes params and updates html lang', () => {
    setLang('en');
    expect(t('common.call', { number: 5 })).toBe('Call 5');
    expect(document.documentElement.lang).toBe('en');
  });
  it('returns the key when missing everywhere', () => { expect(t('no.such.key')).toBe('no.such.key'); });
  it('hindi helpers return hindi text', () => {
    setLang('hi');
    expect(questionShort(data.questions.find((q) => q.id === 'q_fits')!)).toBe('दौरे या बेहोशी');
  });
});

describe('config', () => {
  it('reads numbers only from config', () => {
    expect(telHref('ambulance_primary')).toBe(`tel:${data.config.numbers['ambulance_primary']!.number}`);
    expect(getNumber('mental_health')!.confirmed).toBe(true);
  });
  it('unconfirmed excludes mental_health', () => {
    const keys = unconfirmedNumbers().map((n) => n.key);
    expect(keys).not.toContain('mental_health');
    expect(keys).toContain('ambulance_primary');
  });
  it('feature flags', () => { expect(featureFlag('newborn_module')).toBe(false); });
});

describe('exit', () => {
  it('wipes maitri keys and leaves the app', () => {
    localStorage.setItem('maitri:x', '1'); localStorage.setItem('other', '1'); sessionStorage.setItem('maitri:session', '1');
    const replace = vi.fn();
    Object.defineProperty(window, 'location', { value: { ...window.location, replace }, writable: true });
    const clear = vi.fn();
    exitNow(clear);
    expect(clear).toHaveBeenCalled();
    expect(localStorage.getItem('maitri:x')).toBeNull();
    expect(localStorage.getItem('other')).toBe('1');
    expect(sessionStorage.getItem('maitri:session')).toBeNull();
    expect(replace).toHaveBeenCalledWith('about:blank');
    wipeStorage();
  });
});

describe('asha list', () => {
  it('stores nothing when the setting is off', () => {
    expect(saveCheck({ stage: 'pregnant', tier: 'RED', yes_count: 1, ts: 1 })).toBeNull();
    expect(listChecks()).toEqual([]);
  });
  it('stores minimal records sorted RED first then newest, and clears', () => {
    setSaveEnabled(true);
    saveCheck({ stage: 'pregnant', tier: 'GREEN', yes_count: 0, ts: 3 });
    saveCheck({ stage: 'labour', tier: 'RED', yes_count: 2, ts: 1 });
    saveCheck({ stage: 'labour', tier: 'RED', yes_count: 1, ts: 2 });
    const rows = listChecks();
    expect(rows.map((r) => r.ts)).toEqual([2, 1, 3]);
    expect(Object.keys(rows[0]!).sort()).toEqual(['id', 'stage', 'tier', 'ts', 'yes_count']);
    clearChecks();
    expect(listChecks()).toEqual([]);
  });
});
