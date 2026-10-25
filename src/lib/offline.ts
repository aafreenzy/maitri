import { useSyncExternalStore } from 'react';

let ready = false;
const listeners = new Set<() => void>();
const set = (v: boolean) => { ready = v; listeners.forEach((f) => f()); };

/** Registers the service worker in production builds and records when it is ready to serve offline. */
export function registerOffline() {
  if (!import.meta.env.PROD || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  navigator.serviceWorker.ready.then(() => set(true), () => undefined);
}

export const useOfflineReady = (): boolean =>
  useSyncExternalStore((fn) => { listeners.add(fn); return () => listeners.delete(fn); }, () => ready, () => false);
