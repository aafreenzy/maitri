import { stop } from './audio';

export const SESSION_KEY = 'maitri:session';

export function wipeStorage() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith('maitri:')) localStorage.removeItem(k);
  } catch { /* ignore */ }
}

/** Stops audio, clears every Maitri key, leaves the app. */
export function exitNow(clearMemory?: () => void) {
  stop();
  clearMemory?.();
  wipeStorage();
  window.location.replace('about:blank');
}
