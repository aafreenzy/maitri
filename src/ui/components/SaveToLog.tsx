import { useState } from 'react';
import { Link } from 'react-router-dom';
import { phaseFor, saveCheckin } from '../../lib/logRepo';
import { t } from '../../lib/i18n';
import { useAuth } from '../../state/auth';
import { useResult } from '../../state/useResult';
import { useSession } from '../../state/session';
import { Button } from './Button';

/** Shown only when the backend is configured. Never shown, and never contacts the backend, otherwise. */
export function SaveToLog() {
  const { configured, user } = useAuth();
  const { state } = useSession();
  const r = useResult();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  if (!configured || !r || !state.stage) return null;
  if (!user) return <Link className="wall-note link" to="/account">{t('log.signin_prompt')}</Link>;
  const save = async () => {
    setStatus('saving');
    try {
      await saveCheckin(user.id, { phase: phaseFor(state.stage!), answers: state.answers, note: null, tier: r.tier, rules_version: r.result.rules_version });
      setStatus('saved');
    } catch { setStatus('error'); }
  };
  return (
    <div className="stack">
      <Button className="ghosted" loading={status === 'saving'} disabled={status === 'saved'} onClick={save}>
        {status === 'saving' ? t('log.saving') : t('log.save')}
      </Button>
      {status === 'saved' && <p className="wall-note" role="status">{t('log.saved')}</p>}
      {status === 'error' && <p className="wall-note" role="alert">{t('log.save_error')}</p>}
    </div>
  );
}
