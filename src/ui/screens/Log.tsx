import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { deleteCheckin, listCheckins, type Checkin } from '../../lib/logRepo';
import { t, useLang } from '../../lib/i18n';
import { useAuth } from '../../state/auth';
import { useSession } from '../../state/session';
import { Button } from '../components/Button';
import { Page } from '../components/Layout';
import { SignalShape } from '../components/SignalShape';

export default function Log() {
  const nav = useNavigate();
  const lang = useLang();
  const { configured, loading, user } = useAuth();
  const { state, dispatch } = useSession();
  const [rows, setRows] = useState<Checkin[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    setFailed(false); setRows(null);
    listCheckins().then(setRows, () => setFailed(true));
  }, []);
  useEffect(() => { if (user) load(); }, [user, load]);

  if (!configured) return <Navigate to="/account" replace />;
  if (loading) return <Page><p role="status">{t('common.loading')}</p></Page>;
  if (!user) return <Navigate to="/account" replace />;

  const start = () => {
    if (!state.mode) dispatch({ type: 'setMode', mode: 'woman' });
    dispatch({ type: 'reset' });
    nav('/stage');
  };
  const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium' });

  return (
    <Page actions={<Button variant="primary" onClick={start}>{t('log.start')}</Button>}>
      <h1>{t('log.title')}</h1>
      <p className="hint">{t('log.disclaimer')}</p>
      {failed && (
        <div className="error-box" role="alert">
          <p>{t('log.error')}</p>
          <Button onClick={load}>{t('log.retry')}</Button>
        </div>
      )}
      {!failed && rows === null && <p role="status">{t('common.loading')}</p>}
      {rows && rows.length === 0 && <p className="card" role="status">{t('log.empty')}</p>}
      {rows?.map((c) => (
        <div key={c.id} className="card row-card">
          {c.tier && <div className="thumb"><SignalShape tier={c.tier} word={t(`tier.${c.tier}`)} size={64} /></div>}
          <div className="grow">
            <b>{fmt(c.entry_date)}</b>
            <div className="muted small">{t(`log.phase.${c.phase}`)} · {t('log.signs', { count: Object.values(c.answers).filter((a) => a === 'yes').length })}</div>
          </div>
          <Button className="small" onClick={() => deleteCheckin(c.id).then(() => setRows((r) => r?.filter((x) => x.id !== c.id) ?? r), () => setFailed(true))}>{t('log.delete')}</Button>
        </div>
      ))}
    </Page>
  );
}
