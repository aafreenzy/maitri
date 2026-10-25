import { useNavigate } from 'react-router-dom';
import type { Mode as ModeT } from '../../engine/types';
import { t } from '../../lib/i18n';
import { useSession } from '../../state/session';
import { Listen } from '../components/Listen';
import { Page } from '../components/Layout';
import { Pictogram } from '../icons/Pictogram';

const MODES: ModeT[] = ['woman', 'asha', 'family'];

export default function Mode() {
  const nav = useNavigate();
  const { dispatch } = useSession();
  return (
    <Page>
      <h1>{t('mode.title')}</h1>
      <Listen clipId="mode_title" text={t('mode.title')} />
      {MODES.map((m) => (
        <button key={m} type="button" className="card tap" onClick={() => { dispatch({ type: 'setMode', mode: m }); nav('/stage'); }}>
          <Pictogram id={`mode-${m}`} size={64} />
          <span>{t(`mode.${m}`)}</span>
        </button>
      ))}
    </Page>
  );
}
