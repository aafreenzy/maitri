import { useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { data } from '../../engine/loadData';
import { shareSlip } from '../../lib/slip';
import { stageLabel, t, useLang } from '../../lib/i18n';
import { useResult } from '../../state/useResult';
import { BorderBand } from '../components/BorderBand';
import { Button } from '../components/Button';
import { Page } from '../components/Layout';
import { MaitriMark, Wordmark } from '../components/MaitriMark';
import { SignalShape } from '../components/SignalShape';

export default function Slip() {
  const lang = useLang();
  const r = useResult();
  const node = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  if (!r) return <Navigate to="/" replace />;
  const stage = data.stages.find((s) => s.id === r.result.stage)!;
  const when = new Date(r.result.evaluated_at).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const share = async () => {
    if (!node.current) return;
    setBusy(true); setMsg(null);
    try { await shareSlip(node.current); } catch (e) {
      if ((e as Error).name !== 'AbortError') setMsg({ kind: 'error', text: t('slip.share_error') });
    } finally { setBusy(false); }
  };
  return (
    <Page scrollable actions={
      <>
        <Button variant="primary" onClick={() => window.print()}>{t('slip.print')}</Button>
        <Button loading={busy} onClick={share}>{busy ? t('slip.share_wait') : t('slip.share')}</Button>
      </>
    }>
      <div className="slip" ref={node}>
        <BorderBand />
        <div className="row-brand"><MaitriMark size={40} /><Wordmark compact /></div>
        <h1>{t('slip.title')}</h1>
        <dl>
          <dt>{t('slip.stage')}</dt><dd>{stageLabel(stage)}</dd>
          <dt>{t('slip.tier')}</dt>
          <dd className="tier-line">
            <SignalShape tier={r.tier} word={t(`tier.${r.tier}`)} size={96} />
            <span className="tier-word">{t(`result.${r.tier}.title`)}</span>
          </dd>
          <dt>{t('slip.signs_yes')}</dt>
          <dd>{r.yesLabels.length ? <ul>{r.yesLabels.map((l) => <li key={l}>{l}</li>)}</ul> : t('slip.none')}</dd>
          <dt>{t('slip.signs_unsure')}</dt>
          <dd>{r.unsureLabels.length ? <ul>{r.unsureLabels.map((l) => <li key={l}>{l}</li>)}</ul> : t('slip.none')}</dd>
          <dt>{t('slip.time')}</dt><dd>{when}</dd>
        </dl>
        <p className="ids">{r.result.fired.map((f) => f.rule_id).join(' ')} · v{r.result.rules_version}</p>
        <p className="foot">{t('slip.footer')}</p>
      </div>
      {msg && <p className="error-box" role="alert">{msg.text}</p>}
    </Page>
  );
}
