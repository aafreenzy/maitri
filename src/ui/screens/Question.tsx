import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { evaluate } from '../../engine/evaluate';
import type { Answer } from '../../engine/types';
import { hasInteracted, markInteracted, play } from '../../lib/audio';
import { SpeechError, recognitionSupported, startListening } from '../../lib/speech';
import { parseAnswer } from '../../lib/voiceParse';
import { questionText, t, useLang } from '../../lib/i18n';
import { useSession } from '../../state/session';
import { Button } from '../components/Button';
import { Listen } from '../components/Listen';
import { Page } from '../components/Layout';
import { ProgressDots } from '../components/ProgressDots';
import { Glyph } from '../icons/Glyph';
import { Pictogram } from '../icons/Pictogram';

export default function Question() {
  const { index: raw } = useParams();
  const nav = useNavigate();
  const { state, dispatch, questions } = useSession();
  useLang();
  const idx = Number(raw);
  const q = questions[idx];
  const textRef = useRef<HTMLHeadingElement>(null);
  const [voiceMsg, setVoiceMsg] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    textRef.current?.focus();
    if (q && hasInteracted()) void play(q.id, { text: questionText(q) });
  }, [q]);

  if (!state.stage) return <Navigate to="/" replace />;
  if (!Number.isInteger(idx) || idx < 0 || !q) return <Navigate to={idx >= questions.length && questions.length ? '/result' : '/q/0'} replace />;

  const go = (value: Answer, viaVoice = false) => {
    dispatch({ type: 'answer', id: q.id, value });
    setVoiceMsg(null);
    // One RED sign decides the result, so stop asking and show it at once.
    const red = value === 'yes' && evaluate(state.stage!, { ...state.answers, [q.id]: value }).tier === 'RED';
    const opts = viaVoice || red ? { state: { auto: viaVoice } } : undefined;
    nav(red || idx + 1 >= questions.length ? '/result' : `/q/${idx + 1}`, opts);
  };
  const speak = async () => {
    markInteracted();
    setVoiceMsg(null); setListening(true);
    try {
      const text = await startListening({ lang: state.lang, continuous: false }).result;
      const a = parseAnswer(text);
      if (a) go(a, true); else setVoiceMsg(t('voice.not_understood'));
    } catch (e) {
      const code = e instanceof SpeechError ? e.code : 'other';
      setVoiceMsg(t(code === 'unsupported' ? 'voice.unsupported' : code === 'denied' ? 'voice.denied' : code === 'network' ? 'voice.network' : code === 'no-speech' ? 'voice.not_understood' : 'voice.error'));
    } finally { setListening(false); }
  };
  const intro = idx === 0 ? t(`question.intro_${state.mode ?? 'woman'}`) : null;
  const answered: Record<number, boolean> = {};
  questions.forEach((x, i) => { if (state.answers[x.id]) answered[i] = true; });
  const progress = t('question.progress', { current: idx + 1, total: questions.length });

  return (
    <Page actions={
      <>
        <div className="row">
          <Button variant="answer" onClick={() => go('yes')}><Glyph name="tick" size={36} />{t('common.yes')}</Button>
          <Button variant="answer" onClick={() => go('no')}><Glyph name="cross" size={36} />{t('common.no')}</Button>
        </div>
        <div className="answer-split">
          <Button variant="ghost" disabled={idx === 0} onClick={() => nav(`/q/${idx - 1}`)}>{t('common.back')}</Button>
          <Button variant="ghost" onClick={() => go('not_sure')}><Glyph name="question" size={28} />{t('common.not_sure')}</Button>
        </div>
      </>
    }>
      <ProgressDots total={questions.length} current={idx} answered={answered} label={progress} />
      <span className="visually-hidden" aria-live="polite">{progress}</span>
      {intro && <p className="hint">{intro}</p>}
      <div className="card q-card"><Pictogram id={q.icon} size={100} /></div>
      <h1 className="q-text" ref={textRef} tabIndex={-1}>{questionText(q)}</h1>
      <Listen clipId={q.id} text={questionText(q)} />
      {recognitionSupported() && (
        <Button onClick={speak} loading={listening} aria-label={t('voice.answer')}><Glyph name="mic" size={28} />{listening ? t('voice.listening') : t('voice.answer')}</Button>
      )}
      {voiceMsg && <p className="error-box" role="alert">{voiceMsg}</p>}
      {state.answers[q.id] && <p className="muted small">{t(`common.${state.answers[q.id]}`)}</p>}
    </Page>
  );
}
