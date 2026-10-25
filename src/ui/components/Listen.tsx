import { useState } from 'react';
import { play, stop, usePlaying } from '../../lib/audio';
import { t } from '../../lib/i18n';
import { Button } from './Button';

function Speaker() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 9h4l5-4v14l-5-4H3z" fill="#23358A" stroke="#111B38" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 9c2 2 2 4 0 6M19 6c4 4 4 8 0 12" fill="none" stroke="#111B38" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Listen and Slow buttons. `text` feeds the browser-speech fallback only. */
export function Listen({ clipId, text }: { clipId: string; text?: string }) {
  const playing = usePlaying();
  const [missing, setMissing] = useState(false);
  const run = async (rate: number) => {
    if (playing === clipId && rate === 1) { stop(); return; }
    const r = await play(clipId, { rate, text });
    setMissing(r === 'unavailable');
  };
  return (
    <div>
      <div className="listen-row">
        <Button aria-pressed={playing === clipId} onClick={() => run(1)}>
          <Speaker />{playing === clipId ? t('common.listen_playing') : t('common.listen')}
        </Button>
        <Button onClick={() => run(0.8)}>{t('common.slow')}</Button>
      </div>
      {missing && <p className="hint" role="status">{t('common.audio_missing')}</p>}
    </div>
  );
}
