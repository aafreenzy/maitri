import { useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { data } from '../../engine/loadData';
import { getNumber } from '../../lib/config';
import { buildSlipText, shareSlip, shareText } from '../../lib/slip';
import { stageLabel, t, useLang } from '../../lib/i18n';
import { useResult } from '../../state/useResult';
import { BorderBand } from '../components/BorderBand';
import { Button } from '../components/Button';
import { Page } from '../components/Layout';
import { MaitriMark, Wordmark } from '../components/MaitriMark';
import { Sheet } from '../components/Sheet';
import { SignalShape } from '../components/SignalShape';

export default function Slip() {
  const lang = useLang();
  const r = useResult();
  const node = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  if (!r) return <Navigate to="/" replace />;
  const stage = data.stages.find((s) => s.id === r.result.stage)!;
  const when = new Date(r.result.evaluated_at).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  // Contacts come from config only, each with its confirmation status. Only Tele-MANAS is confirmed today.
  const contactKeys = [...(r.tier !== 'GREEN' ? ['ambulance_primary'] : []), ...(r.hasWellbeingFlag ? ['mental_health'] : [])];
  const contacts = contactKeys.map((k) => getNumber(k)).filter((c): c is NonNullable<ReturnType<typeof getNumber>> => c !== null);
  const status = (confirmed: boolean) => t(confirmed ? 'trust.status_confirmed' : 'trust.status_unverified');

  const joinOrNone = (xs: string[]) => (xs.length ? xs.join(', ') : t('slip.none'));
  const plainText = () => buildSlipText({
    title: t('slip.title'),
    lines: [
      { label: t('slip.stage'), value: stageLabel(stage) },
      { label: t('slip.tier'), value: `${t(`tier.${r.tier}`)}. ${t(`result.${r.tier}.title`)}` },
      { label: t('slip.signs_yes'), value: joinOrNone(r.yesLabels) },
      { label: t('slip.signs_unsure'), value: joinOrNone(r.unsureLabels) },
      ...contacts.map((c) => ({ label: c.label, value: `${c.number} (${status(c.confirmed)})` })),
      { label: t('slip.time'), value: when },
    ],
    footer: t('slip.footer'),
  });

  // Nothing leaves the phone until she has read the consent text and chosen how to share.
  const share = async (send: () => Promise<void>, errorKey: string) => {
    setAsking(false); setBusy(true); setMsg(null);
    try { await send(); } catch (e) {
      if ((e as Error).name !== 'AbortError') setMsg({ kind: 'error', text: t(errorKey) });
    } finally { setBusy(false); }
  };
  const sharePicture = () => share(async () => { await shareSlip(node.current!); }, 'slip.share_error');
  const shareAsText = () => share(async () => {
    if ((await shareText(plainText())) === 'copied') setMsg({ kind: 'ok', text: t('slip.copied') });
  }, 'slip.text_error');

  return (
    <Page scrollable actions={
      <>
        <Button variant="primary" onClick={() => window.print()}>{t('slip.print')}</Button>
        <Button loading={busy} onClick={() => setAsking(true)}>{busy ? t('slip.share_wait') : t('slip.share_open')}</Button>
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
          {contacts.length > 0 && (
            <>
              <dt>{t('slip.contacts')}</dt>
              <dd>
                <ul>{contacts.map((c) => <li key={c.key}>{c.label}: <b>{c.number}</b>. {status(c.confirmed)}</li>)}</ul>
              </dd>
            </>
          )}
          <dt>{t('slip.time')}</dt><dd>{when}</dd>
        </dl>
        <p className="ids" translate="no">{r.result.fired.map((f) => f.rule_id).join(' ')} · v{r.result.rules_version}</p>
        <p className="foot">{t('slip.footer')}</p>
      </div>
      {msg && <p className={msg.kind === 'error' ? 'error-box' : 'hint'} role={msg.kind === 'error' ? 'alert' : 'status'}>{msg.text}</p>}
      <Sheet open={asking} onClose={() => setAsking(false)} title={t('slip.consent_title')}>
        <p>{t('slip.consent_body')}</p>
        <Button variant="primary" onClick={sharePicture}>{t('slip.share')}</Button>
        <Button onClick={shareAsText}>{t('slip.share_text')}</Button>
        <Button variant="ghost" onClick={() => setAsking(false)}>{t('slip.consent_no')}</Button>
      </Sheet>
    </Page>
  );
}
