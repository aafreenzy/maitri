import { useSyncExternalStore } from 'react';
import { getLang } from './i18n';

export type PlayResult = 'playing' | 'unavailable';

let interacted = false;
let playingId: string | null = null;
let el: HTMLAudioElement | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());

if (typeof window !== 'undefined') {
  const mark = () => { interacted = true; };
  window.addEventListener('pointerdown', mark, { once: true, capture: true });
  window.addEventListener('keydown', mark, { once: true, capture: true });
}

export const hasInteracted = () => interacted;
export const markInteracted = () => { interacted = true; };
export const getPlaying = () => playingId;
export function usePlaying(): string | null {
  return useSyncExternalStore((fn) => { listeners.add(fn); return () => listeners.delete(fn); }, getPlaying, getPlaying);
}

function haveVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null;
  return speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang)) ?? null;
}

export function stop() {
  if (el) { el.pause(); el.removeAttribute('src'); el = null; }
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  if (playingId !== null) { playingId = null; emit(); }
}

/** Plays /audio/{lang}/{id}.mp3, else browser speech if a real voice exists, else 'unavailable'. */
export async function play(id: string, opts: { rate?: number; text?: string } = {}): Promise<PlayResult> {
  if (!interacted) return 'unavailable';
  stop();
  const lang = getLang();
  const rate = opts.rate ?? 1;
  try {
    const a = new Audio(`./audio/${lang}/${id}.mp3`);
    a.playbackRate = rate;
    a.onended = () => { if (playingId === id) { playingId = null; emit(); } };
    el = a;
    await a.play();
    playingId = id; emit();
    return 'playing';
  } catch {
    el = null;
  }
  const voice = haveVoice(lang);
  if (voice && opts.text && typeof SpeechSynthesisUtterance !== 'undefined') {
    const u = new SpeechSynthesisUtterance(opts.text);
    u.voice = voice; u.lang = voice.lang; u.rate = rate;
    u.onend = () => { if (playingId === id) { playingId = null; emit(); } };
    speechSynthesis.speak(u);
    playingId = id; emit();
    return 'playing';
  }
  return 'unavailable';
}
