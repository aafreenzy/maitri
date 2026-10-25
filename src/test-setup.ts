   // Tests must not pick up the real Supabase keys from .env.local.
   const testEnv = import.meta.env as Record<string, string>;
   testEnv.VITE_SUPABASE_URL = '';
   testEnv.VITE_SUPABASE_ANON_KEY = '';
   import '@testing-library/jest-dom/vitest';

// jsdom does not implement media playback.
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', { configurable: true, value: () => Promise.reject(new Error('no audio in tests')) });
Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', { configurable: true, value: () => undefined });
