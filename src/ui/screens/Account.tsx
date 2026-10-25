import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { backendErrorCode } from '../../lib/backend';
import { t, useLang } from '../../lib/i18n';
import { maskEmail, useAuth } from '../../state/auth';
import { Button } from '../components/Button';
import { Page } from '../components/Layout';
import { Sheet } from '../components/Sheet';
import { Glyph } from '../icons/Glyph';

const ERR: Record<string, string> = {
  'bad-phone': 'account.error.bad_phone', 'bad-code': 'account.error.bad_code',
  'too-many': 'account.error.too_many', 'provider-off': 'account.error.google_off', network: 'account.error.network', other: 'account.error.other', 'not-configured': 'account.not_configured',
};

export default function Account() {
  const nav = useNavigate();
  useLang();
  const { configured, loading, user, sendCode, signInWithGoogle, verifyCode, signOut, deleteAccount } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setError(null);
    try { await fn(); } catch (e) {
      const c = (e as { code?: string })?.code === 'bad-phone' ? 'bad-phone' : backendErrorCode(e);
      setError(t(ERR[c] ?? 'account.error.other'));
    } finally { setBusy(false); }
  };

  if (!configured) {
    return <Page actions={<Button variant="ghost" onClick={() => nav('/')}>{t('common.home')}</Button>}><h1>{t('account.title')}</h1><p className="card">{t('account.not_configured')}</p></Page>;
  }
  if (loading) return <Page><h1>{t('account.title')}</h1><p role="status">{t('common.loading')}</p></Page>;

  if (user) {
    return (
      <Page actions={<Button variant="primary" onClick={() => nav('/log')}>{t('log.title')}</Button>}>
        <h1>{t('account.title')}</h1>
        <div className="card">
          <b>{t('account.signed_in')}</b>
          {user.email && <p className="muted">{t('account.google_account', { email: maskEmail(user.email) })}</p>}
          {!user.email && user.phoneLast4 && <p className="muted">{t('account.number_ends', { last4: user.phoneLast4 })}</p>}
        </div>
        {error && <p className="error-box" role="alert">{error}</p>}
        <Button onClick={() => run(async () => { await signOut(); nav('/'); })} loading={busy}>{t('account.sign_out')}</Button>
        <Button variant="ghost" onClick={() => setConfirmDelete(true)}>{t('account.delete')}</Button>
        <p className="muted small">{t('account.privacy')}</p>
        <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title={t('account.delete_title')}>
          <p>{t('account.delete_body')}</p>
          <Button variant="danger" loading={busy} onClick={() => run(async () => { await deleteAccount(); setConfirmDelete(false); nav('/'); })}>{t('account.delete_yes')}</Button>
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>{t('common.cancel')}</Button>
        </Sheet>
      </Page>
    );
  }

  return (
    <Page>
      <h1>{t('account.title')}</h1>
      {error && <p className="error-box" role="alert">{error}</p>}
      {!sent && (
        <>
          <Button variant="answer" loading={busy} onClick={() => run(signInWithGoogle)}><Glyph name="google" size={28} />{t('account.google')}</Button>
          <p className="muted centered">{t('account.or')}</p>
        </>
      )}
      {!sent ? (
        <form className="stack" onSubmit={(e) => { e.preventDefault(); void run(async () => { await sendCode(phone); setSent(true); }); }}>
          <div className="field">
            <label htmlFor="phone">{t('account.phone_label')}</label>
            <input id="phone" type="tel" inputMode="numeric" autoComplete="tel-national" value={phone} aria-invalid={!!error || undefined} aria-describedby="phone-hint" onChange={(e) => setPhone(e.target.value)} />
            <span id="phone-hint" className="muted small">{t('account.phone_hint')}</span>
          </div>
          <button type="submit" className="btn primary" disabled={busy}>{t('account.send_code')}</button>
        </form>
      ) : (
        <form className="stack" onSubmit={(e) => { e.preventDefault(); void run(async () => { await verifyCode(phone, code); nav('/log'); }); }}>
          <p className="card">{t('account.code_sent', { last4: phone.replace(/\D/g, '').slice(-4) })}</p>
          <div className="field">
            <label htmlFor="code">{t('account.code_label')}</label>
            <input id="code" type="text" inputMode="numeric" autoComplete="one-time-code" value={code} aria-invalid={!!error || undefined} onChange={(e) => setCode(e.target.value)} />
          </div>
          <button type="submit" className="btn primary" disabled={busy || code.trim().length < 4}>{t('account.verify')}</button>
          <Button variant="ghost" onClick={() => { setSent(false); setCode(''); setError(null); }}>{t('account.change_number')}</Button>
        </form>
      )}
      <p className="muted small">{t('account.privacy')}</p>
    </Page>
  );
}
