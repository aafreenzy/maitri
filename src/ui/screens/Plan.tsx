import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { entitlement, getNumber } from '../../lib/config';
import { t, useLang } from '../../lib/i18n';
import { useResult } from '../../state/useResult';
import { Button } from '../components/Button';
import { CallButton } from '../components/CallButton';
import { Page } from '../components/Layout';
import { Listen } from '../components/Listen';

export default function Plan() {
  const nav = useNavigate();
  const lang = useLang();
  const r = useResult();
  const [done, setDone] = useState<Record<number, boolean>>({});
  if (!r || !r.isRed) return <Navigate to={r ? '/result' : '/'} replace />;
  const amb = getNumber('ambulance_primary');
  const transport = getNumber('transport_pregnant');
  const steps = [1, 2, 3, 4].map((n) => t(`plan.step${n}`, { number: amb?.number ?? '' }));
  return (
    <Page actions={<Button variant="primary" onClick={() => nav('/slip')}>{t('result.show_slip')}</Button>}>
      <h1>{t('plan.title')}</h1>
      {steps.map((text, i) => (
        <section key={i} className={`card step ${done[i] ? 'done' : ''}`} aria-labelledby={`step-${i}`}>
          <span className="num" aria-hidden="true">{i + 1}</span>
          <div className="body">
            <p id={`step-${i}`} className="step-text lead">{text}</p>
            {i === 0 && <CallButton numberKey="ambulance_primary" white={false} />}
            {i === 0 && transport && <CallButton numberKey="transport_pregnant" outline text={t('plan.transport_line', { number: transport.number })} />}
            {i === 3 && <p className="muted">{entitlement(lang)}</p>}
            <Listen clipId={`plan_step${i + 1}`} text={text} />
            <label className="tick">
              <input type="checkbox" checked={!!done[i]} onChange={(e) => setDone({ ...done, [i]: e.target.checked })} />
              {t('plan.done')}
            </label>
          </div>
        </section>
      ))}
    </Page>
  );
}
