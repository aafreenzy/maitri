import { useEffect, useRef } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import type { Answer } from '../../engine/types';
import { hasInteracted, play } from '../../lib/audio';
import { questionText, t, useLang } from '../../lib/i18n';
import { useSession } from '../../state/session';
import { Button } from '../components/Button';
import { Listen } from '../components/Listen';
import { Page } from '../components/Layout';
import { ProgressDots } from '../components/ProgressDots';
import { Pictogram } from '../icons/Pictogram';

export default function Question() {
  const { index: raw } = useParams();
  const nav = useNavigate();
  const { state, dispatch, questions } = useSession();
  useLang();
  const idx = Number(raw);
  const q = questions[idx];
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    textRef.current?.focus();
    if (q && hasInteracted()) void play(q.id, { text: questionText(q) });
  }, [q]);

  if (!state.stage) return <Navigate to="/" replace />;
  if (!Number.isInteger(idx) || idx < 0 || !q) return <Navigate to={idx >= questions.length && questions.length ? '/result' : '/q/0'} replace />;

  const go = (value: Answer) => {
    dispatch({ type: 'answer', id: q.id, value });
    nav(idx + 1 >= questions.length ? '/result' : `/q/${idx + 1}`);
  };
  const intro = idx === 0 ? t(`question.intro_${state.mode ?? 'woman'}`) : null;
  const answered: Record<number, boolean> = {};
  questions.forEach((x, i) => { if (state.answers[x.id]) answered[i] = true; });
  const progress = t('question.progress', { current: idx + 1, total: questions.length });

  return (
    <Page actions={
      <>
        <div className="row">
          <Button variant="answer" onClick={() => go('yes')}>{t('common.yes')}</Button>
          <Button variant="answer" onClick={() => go('no')}>{t('common.no')}</Button>
        </div>
        <Button variant="ghost" onClick={() => go('not_sure')}>{t('common.not_sure')}</Button>
        <Button variant="ghost" disabled={idx === 0} onClick={() => nav(`/q/${idx - 1}`)}>{t('common.back')}</Button>
      </>
    }>
      <ProgressDots total={questions.length} current={idx} answered={answered} label={progress} />
      <span className="visually-hidden" aria-live="polite">{progress}</span>
      {intro && <p className="hint">{intro}</p>}
      <div className="card q-card"><Pictogram id={q.icon} size={120} /></div>
      <h1 className="q-text" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--step-2)', fontWeight: 600 }} ref={textRef} tabIndex={-1}>{questionText(q)}</h1>
      <Listen clipId={q.id} text={questionText(q)} />
      {state.answers[q.id] && <p className="muted small">{t(`common.${state.answers[q.id]}`)}</p>}
    </Page>
  );
}
