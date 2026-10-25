import { useEffect, useRef } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { saveCheck } from '../../lib/asha';
import { getNumber } from '../../lib/config';
import { t, useLang } from '../../lib/i18n';
import { useResult } from '../../state/useResult';
import { useSession } from '../../state/session';
import { Button } from '../components/Button';
import { CallButton } from '../components/CallButton';
import { Header } from '../components/Layout';
import { Listen } from '../components/Listen';
import { SignalShape } from '../components/SignalShape';

export default function Result() {
  const nav = useNavigate();
  const { state, dispatch } = useSession();
  useLang();
  const r = useResult();
  const saved = useRef(false);

  const tier = r?.tier;
  useEffect(() => {
    if (!r || saved.current) return;
    saved.current = true;
    if (tier === 'RED' && typeof navigator.vibrate === 'function' && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) navigator.vibrate(200);
    if (state.mode === 'asha' && state.stage) saveCheck({ stage: state.stage, tier: r.tier, yes_count: r.result.yes_ids.length, ts: Date.now() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);

  if (!r || !state.stage) return <Navigate to="/" replace />;
  if (Object.keys(state.answers).length === 0) return <Navigate to="/q/0" replace />;

  const num = getNumber('ambulance_primary');
  const family = state.mode === 'family' || state.mode === 'asha';
  const title = t(`result.${r.tier}.title${family && r.tier !== 'GREEN' ? '_family' : ''}`);
  const body = r.tier !== 'GREEN' && !num ? '' : t(`result.${r.tier}.body`, { number: num?.number ?? '' });
  const clip = `result_${r.tier}${family && r.tier !== 'GREEN' ? '_family' : ''}`;

  return (
    <div className={`page full wall ${r.tier} ${typeof window !== 'undefined' && window.location.search.includes('grayscale') ? 'grayscale' : ''}`}>
      <Header />
      <main className="page-body">
        <SignalShape className="stamp" tier={r.tier} word={t(`tier.${r.tier}`)} />
        <h1 className="verdict" aria-live="polite">{title}</h1>
        {body && <p style={{ fontSize: 'var(--step-1)', fontWeight: 600 }}>{body}</p>}
        {r.tier !== 'GREEN' && r.headlineReason && <p>{t('result.because', { signs: r.reasons.join(', ') })}</p>}
        {r.hasNotSure && <p className="wall-note">{t('result.not_sure_note')}</p>}
        {r.hasWellbeingFlag && <Link className="wall-note link" to="/support">{t('wellbeing.title')}. {t('result.wellbeing_card')}</Link>}
        <Listen clipId={clip} text={`${title}. ${body}`} />
        <p className="small">{t('result.disclaimer_short')}</p>
      </main>
      <div className="action-bar">
        {r.tier !== 'GREEN' && <CallButton numberKey="ambulance_primary" />}
        {r.isRed && <Button className="ghosted" onClick={() => nav('/plan')}>{t('result.family_plan')}</Button>}
        <Button className="ghosted" onClick={() => nav('/slip')}>{t('result.show_slip')}</Button>
        {r.tier === 'GREEN' && <Button className="white" onClick={() => { dispatch({ type: 'reset' }); nav('/stage'); }}>{t('result.check_again')}</Button>}
      </div>
    </div>
  );
}
