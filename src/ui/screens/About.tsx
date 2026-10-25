import { Link, useNavigate } from 'react-router-dom';
import { data } from '../../engine/loadData';
import { t } from '../../lib/i18n';
import { useSession } from '../../state/session';
import { Button } from '../components/Button';
import { Page } from '../components/Layout';

export default function About() {
  const nav = useNavigate();
  const { clearAll } = useSession();
  const anyReviewed = data.rules.some((r) => r.reviewed_by);
  return (
    <Page actions={<Button onClick={() => { clearAll(); nav('/'); }}>{t('common.clear_data')}</Button>}>
      <h1>{t('safety.title')}</h1>
      <div className="card">
        <p>{t('safety.not_diagnosis')}</p>
        <p>{t('safety.tiers_ours')}</p>
        <p>{t('safety.never_fine')}</p>
        <p>{t('safety.no_data')}</p>
        {!anyReviewed && <p style={{ fontWeight: 700 }}>{t('safety.draft')}</p>}
      </div>
      <Link className="btn" to="/trust">{t('trust.link')}</Link>
      <Link className="btn ghost" to="/review">{t('about.review_link')}</Link>
      <Button variant="ghost" onClick={() => nav(-1)}>{t('common.back')}</Button>
    </Page>
  );
}
