import { t } from '../../lib/i18n';
import { CallButton } from '../components/CallButton';
import { Page } from '../components/Layout';
import { Listen } from '../components/Listen';
import { getNumber } from '../../lib/config';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export default function Support() {
  const nav = useNavigate();
  const mh = getNumber('mental_health');
  const em = getNumber('emergency_general');
  return (
    <Page actions={<Button variant="ghost" onClick={() => nav(-1)}>{t('common.back')}</Button>}>
      <h1>{t('wellbeing.title')}</h1>
      <div className="card">
        <p style={{ fontSize: 'var(--step-1)' }}>{t('wellbeing.body')}</p>
        <Listen clipId="wellbeing_body" text={t('wellbeing.body')} />
      </div>
      {mh && <CallButton numberKey="mental_health" white={false} text={t('wellbeing.call', { number: mh.number })} />}
      {em && <p className="card" style={{ fontWeight: 700 }}>{t('wellbeing.danger', { number: em.number })}</p>}
      {em && <CallButton numberKey="emergency_general" white={false} />}
    </Page>
  );
}
