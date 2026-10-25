import { useNavigate } from 'react-router-dom';
import { setLang, t, useLang } from '../../lib/i18n';
import { appInfo, getNumber } from '../../lib/config';
import { useSession } from '../../state/session';
import { useAuth } from '../../state/auth';
import { useOfflineReady } from '../../lib/offline';
import { BorderBand } from '../components/BorderBand';
import { Button } from '../components/Button';
import { Listen } from '../components/Listen';
import { MaitriMark, Wordmark } from '../components/MaitriMark';
import { CallButton } from '../components/CallButton';
import { Header } from '../components/Layout';
import { Glyph } from '../icons/Glyph';

export default function Language() {
  const nav = useNavigate();
  const { dispatch } = useSession();
  const lang = useLang();
  const { configured } = useAuth();
  const offlineReady = useOfflineReady();
  const choose = (l: 'hi' | 'en') => { setLang(l); dispatch({ type: 'setLang', lang: l }); nav('/mode'); };
  return (
    <div className="page">
      <BorderBand />
      <Header hideMark />
      <main className="page-body">
        <div className="lang-hero">
          <MaitriMark size={56} />
          <Wordmark />
          <p className="tag">{lang === 'hi' ? appInfo().tagline_hi : appInfo().tagline_en}</p>
        </div>
        <CallButton numberKey="ambulance_primary" white={false} text={t('home.emergency', { number: getNumber('ambulance_primary')?.number ?? '' })} />
        <h1>{t('lang.title')}</h1>
        <Listen clipId="lang_title" text={t('lang.title')} />
        <Button variant="primary" onClick={() => nav('/speak')}><Glyph name="mic" size={32} />{t('voice.entry')}</Button>
        <Button variant="answer" className="lang-btn" lang="hi" onClick={() => choose('hi')}>{t('lang.hi')}</Button>
        <Button variant="answer" className="lang-btn" lang="en" onClick={() => choose('en')}>{t('lang.en')}</Button>
        {configured && <Button variant="ghost" onClick={() => nav('/log')}>{t('log.entry_link')}</Button>}
        {offlineReady && <p className="hint" role="status"><Glyph name="tick" size={20} /> {t('offline.ready')}</p>}
        <p className="hint" role="note">{t('proto.banner')}</p>
      </main>
    </div>
  );
}
