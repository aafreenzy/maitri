import { Link, useNavigate } from 'react-router-dom';
import { data } from '../../engine/loadData';
import { featureFlag } from '../../lib/config';
import { stageLabel, t, useLang } from '../../lib/i18n';
import { useSession } from '../../state/session';
import { Listen } from '../components/Listen';
import { Page } from '../components/Layout';
import { Glyph } from '../icons/Glyph';
import { Pictogram } from '../icons/Pictogram';

export default function Stage() {
  const nav = useNavigate();
  const { state, dispatch } = useSession();
  useLang();
  const title = t(state.mode === 'woman' || !state.mode ? 'stage.title' : 'stage.title_other');
  return (
    <Page>
      <h1>{title}</h1>
      <Listen clipId="stage_title" text={title} />
      {data.stages.map((s) => (
        <button key={s.id} type="button" className="card tap" onClick={() => { dispatch({ type: 'setStage', stage: s.id }); nav('/q/0'); }}>
          <Pictogram id={s.icon} size={64} />
          <span>{stageLabel(s)}</span>
        </button>
      ))}
      <Link className="btn primary" to="/speak"><Glyph name="mic" size={28} />{t('voice.entry')}</Link>
      {state.mode === 'asha' && featureFlag('asha_list') && (
        <Link className="btn" to="/asha">{t('asha.list_title')}</Link>
      )}
    </Page>
  );
}
