import { useEffect, useRef } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { hasInteracted, play } from '../../lib/audio';
import { saveCheck } from '../../lib/asha';
import { getNumber } from '../../lib/config';
import { t, useLang } from '../../lib/i18n';
import { useResult } from '../../state/useResult';
import { useSession } from '../../state/session';
import { Button } from '../components/Button';
import { CallButton } from '../components/CallButton';
import { Header } from '../components/Layout';
import { Listen } from '../components/Listen';
import { Glyph } from '../icons/Glyph';
import { SaveToLog } from '../components/SaveToLog';
import { SignalShape } from '../components/SignalShape';

export default function Result() {
  const nav = useNavigate();
  const { state, dispatch } = useSession();
  useLang();
  const r = useResult();
  const saved = useRef(false);
  const auto = (useLocation().state as { auto?: boolean } | null)?.auto === true;

  const tier = r?.tier;
  const familyMode = state.mode === 'family' || state.mode === 'asha';
  useEffect(() => {
    if (!r || saved.current) return;
    saved.current = true;
    if (tier === 'RED' && typeof navigator.vibrate === 'function' && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) navigator.vibrate(200);
    if (state.mode === 'asha' && state.stage) saveCheck({ stage: state.stage, tier: r.tier, yes_count: r.result.yes_ids.length, ts: Date.now() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);

  useEffect(() => {
    if (!auto || !r || !hasInteracted()) return;
    const num0 = getNumber('ambulance_primary');
    const title0 = t(`result.${r.tier}.title${familyMode && r.tier !== 'GREEN' ? '_family' : ''}`);
    const body0 = r.tier !== 'GREEN' && !num0 ? '' : t(`result.${r.tier}.body`, { number: num0?.number ?? '' });
    void play(`result_${r.tier}${familyMode && r.tier !== 'GREEN' ? '_family' : ''}`, { text: `${title0}. ${body0}` });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, tier]);

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
        {body && <p className="lead">{body}</p>}
        {r.tier !== 'GREEN' && r.headlineReason && <p>{t('result.because', { signs: r.reasons.join(', ') })}</p>}
        {r.hasNotSure && <p className="wall-note">{t('result.not_sure_note')}</p>}
        {r.hasWellbeingFlag && <Link className="wall-note link" to="/support">{t('wellbeing.title')}. {t('result.wellbeing_card')}</Link>}
        <SaveToLog />
        <Listen clipId={clip} text={`${title}. ${body}`} />
        <p className="small">{t('result.disclaimer_short')}</p>
      </main>
      <footer className="action-bar">
        {r.tier !== 'GREEN' && <CallButton numberKey="ambulance_primary" />}
        {r.isRed && <Button className="ghosted" onClick={() => nav('/plan')}><Glyph name="list" size={28} />{t('result.family_plan')}</Button>}
        <Button className="ghosted" onClick={() => nav('/slip')}><Glyph name="doc" size={28} />{t('result.show_slip')}</Button>
        {r.tier === 'GREEN' && <Button className="white" onClick={() => { dispatch({ type: 'reset' }); nav('/stage'); }}>{t('result.check_again')}</Button>}
      </footer>
    </div>
  );
}
