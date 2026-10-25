import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluate } from '../../engine/evaluate';
import { applicableQuestions, data } from '../../engine/loadData';
import type { StageId } from '../../engine/types';
import { SpeechError, recognitionSupported, startListening, type Listener } from '../../lib/speech';
import { markInteracted } from '../../lib/audio';
import { questionShort, stageLabel, t, useLang } from '../../lib/i18n';
import { extractSigns } from '../../lib/voiceParse';
import { useSession } from '../../state/session';
import { Button } from '../components/Button';
import { Page } from '../components/Layout';
import { Glyph } from '../icons/Glyph';
import { Pictogram } from '../icons/Pictogram';

type Phase = 'idle' | 'listening' | 'review';

export default function Speak() {
  const nav = useNavigate();
  const lang = useLang();
  const { state, dispatch } = useSession();
  const [phase, setPhase] = useState<Phase>('idle');
  const [interim, setInterim] = useState('');
  const [transcript, setTranscript] = useState('');
  const [stage, setStage] = useState<StageId | null>(null);
  const [removed, setRemoved] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const listener = useRef<Listener | null>(null);
  const supported = recognitionSupported();

  const extracted = useMemo(() => extractSigns(transcript, stage), [transcript, stage]);
  const signs = Object.entries(extracted.signs).filter(([id]) => !removed[id]);
  const effectiveStage = stage ?? extracted.stage;

  const begin = () => {
    markInteracted();
    setError(null); setInterim(''); setRemoved({});
    const l = startListening({ lang, continuous: true, onInterim: setInterim });
    listener.current = l;
    setPhase('listening');
    l.result.then(
      (text) => {
        if (!text.trim()) { setError(t('voice.nothing')); setPhase('idle'); return; }
        setTranscript(text); setStage(null); setPhase('review');
      },
      (e: unknown) => {
        const code = e instanceof SpeechError ? e.code : 'other';
        setError(t(code === 'unsupported' ? 'voice.unsupported' : code === 'denied' ? 'voice.denied' : code === 'network' ? 'voice.network' : code === 'no-speech' ? 'voice.nothing' : 'voice.error'));
        setPhase('idle');
      },
    );
  };

  const finish = () => {
    if (!effectiveStage) return;
    if (!state.mode) dispatch({ type: 'setMode', mode: 'woman' });
    dispatch({ type: 'setStage', stage: effectiveStage });
    const answers: Record<string, 'yes' | 'not_sure'> = {};
    for (const [id, v] of signs) { answers[id] = v; dispatch({ type: 'answer', id, value: v }); }
    if (evaluate(effectiveStage, answers).tier === 'RED') { nav('/result', { state: { auto: true } }); return; }
    const qs = applicableQuestions(effectiveStage);
    const next = qs.findIndex((q) => !answers[q.id]);
    nav(next === -1 ? '/result' : `/q/${next}`, { state: { auto: true } });
  };

  const label = (id: string) => {
    const q = data.questions.find((x) => x.id === id);
    return q ? questionShort(q) : id;
  };

  return (
    <Page actions={
      phase === 'review'
        ? <Button variant="primary" disabled={!effectiveStage} onClick={finish}>{t('voice.continue')}</Button>
        : <Button variant="ghost" onClick={() => nav('/mode')}>{t('voice.use_taps')}</Button>
    }>
      <h1>{t('voice.title')}</h1>

      {phase !== 'review' && (
        <>
          <p className="hint">{t('voice.hint')}</p>
          {!supported && <p className="error-box" role="alert">{t('voice.unsupported')}</p>}
          {error && <p className="error-box" role="alert">{error}</p>}
          <button
            type="button" className={`mic-btn ${phase === 'listening' ? 'on' : ''}`} disabled={!supported}
            onClick={() => (phase === 'listening' ? listener.current?.stop() : begin())}
            aria-pressed={phase === 'listening'}
          >
            <Glyph name={phase === 'listening' ? 'stop' : 'mic'} size={64} />
            <span>{phase === 'listening' ? t('voice.stop') : t('voice.start')}</span>
          </button>
          <p role="status" className="card" style={{ minHeight: 64 }}>
            {phase === 'listening' ? (interim || t('voice.listening')) : ''}
          </p>
          <p className="muted small">{t('voice.privacy')}</p>
        </>
      )}

      {phase === 'review' && (
        <>
          <section className="card">
            <b>{t('voice.heard')}</b>
            <p>{transcript}</p>
          </section>
          {!effectiveStage && (
            <>
              <h2>{t('stage.title')}</h2>
              {data.stages.map((s) => (
                <button key={s.id} type="button" className="card tap" onClick={() => setStage(s.id)}>
                  <Pictogram id={s.icon} size={56} /><span>{stageLabel(s)}</span>
                </button>
              ))}
            </>
          )}
          {effectiveStage && (
            <section className="rows" style={{ gap: 12 }}>
              <h2>{signs.length ? t('voice.signs_title') : t('voice.no_signs')}</h2>
              {signs.map(([id, v]) => {
                const q = data.questions.find((x) => x.id === id);
                return (
                  <div key={id} className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Pictogram id={q?.icon ?? 'tier-unknown'} size={48} />
                    <span style={{ flex: 1, fontWeight: 700 }}>{label(id)}</span>
                    <Glyph name={v === 'yes' ? 'tick' : 'question'} size={28} />
                    <Button className="small" onClick={() => setRemoved({ ...removed, [id]: true })}>{t('common.remove')}</Button>
                  </div>
                );
              })}
            </section>
          )}
        </>
      )}
    </Page>
  );
}
