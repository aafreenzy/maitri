import { useState } from 'react';
import { appInfo, getNumber } from '../../lib/config';
import { t } from '../../lib/i18n';
import { CallButton } from '../components/CallButton';
import { backendErrorCode } from '../../lib/backend';
import { useAuth } from '../../state/auth';
import { BorderBand } from '../components/BorderBand';
import { Button } from '../components/Button';
import { Header } from '../components/Layout';
import { MaitriMark, Wordmark } from '../components/MaitriMark';
import { Glyph } from '../icons/Glyph';
import Language from './Language';

// Remembered only until the page is reloaded. Nothing is written to storage.
let skipped = false;

function Welcome({ onSkip }: { onSkip: () => void }) {
  const { loading, signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const google = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle('/');
    } catch (e) {
      setBusy(false);
      setError(
        backendErrorCode(e) === 'provider-off'
          ? 'Google साइन इन अभी चालू नहीं है। बिना साइन इन के जारी रखें। / Google sign-in is not turned on. Please continue without signing in.'
          : 'साइन इन शुरू नहीं हो सका। बिना साइन इन के जारी रखें। / Could not start sign-in. Please continue without signing in.',
      );
    }
  };

  return (
    <div className="page">
      <BorderBand />
      <Header hideMark />
      <main className="page-body">
        <h1 className="visually-hidden">Maitri</h1>
        <div className="lang-hero">
          <MaitriMark size={56} />
          <Wordmark />
          <p className="tag" lang="hi">{appInfo().tagline_hi}</p>
          <p className="tag">{appInfo().tagline_en}</p>
        </div>

        <CallButton numberKey="ambulance_primary" white={false} text={`${t('home.emergency', { number: getNumber('ambulance_primary')?.number ?? '' })}`} />

        <Button variant="primary" onClick={onSkip}>
          <span style={{ display: 'block' }} lang="hi">बिना साइन इन किए जारी रखें</span>
          <span style={{ display: 'block' }}>Continue without signing in</span>
        </Button>

        <Button variant="answer" loading={busy || loading} onClick={google}>
          <Glyph name="google" size={28} />
          <span style={{ display: 'block' }} lang="hi">Google से जारी रखें</span>
          <span style={{ display: 'block' }}>Continue with Google</span>
        </Button>

        {error && <p className="error-box" role="alert">{error}</p>}

        <p className="hint" role="note" lang="hi">
          साइन इन करना ज़रूरी नहीं है। जाँच के लिए खाता नहीं चाहिए। साइन इन तभी करें जब आप रोज़ का लॉग रखना चाहें।
        </p>
        <p className="hint" role="note">
          Signing in is optional. The check never needs an account. Sign in only if you want to keep a daily log.
        </p>
      </main>
    </div>
  );
}

export default function Start() {
  const { configured, user } = useAuth();
  const [, refresh] = useState(0);

  if (!configured || user || skipped) return <Language />;
  return <Welcome onSkip={() => { skipped = true; refresh((n) => n + 1); }} />;
}