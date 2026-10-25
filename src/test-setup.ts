import '@testing-library/jest-dom/vitest';

// jsdom does not implement media playback.
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', { configurable: true, value: () => Promise.reject(new Error('no audio in tests')) });
Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', { configurable: true, value: () => undefined });
