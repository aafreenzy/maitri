import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearChecks, deleteCheck, isSaveEnabled, listChecks, setSaveEnabled } from '../../lib/asha';
import { data } from '../../engine/loadData';
import { stageLabel, t, useLang } from '../../lib/i18n';
import { useSession } from '../../state/session';
import { Button } from '../components/Button';
import { Page } from '../components/Layout';
import { SignalShape } from '../components/SignalShape';

export default function AshaList() {
  const nav = useNavigate();
  const { dispatch } = useSession();
  const lang = useLang();
  const [tick, setTick] = useState(0);
  const [on, setOn] = useState(isSaveEnabled());
  const rows = listChecks();
  void tick;
  return (
    <Page actions={<Button variant="primary" onClick={() => { dispatch({ type: 'reset' }); nav('/stage'); }}>{t('asha.new_check')}</Button>}>
      <h1>{t('asha.list_title')}</h1>
      <p className="hint">{t('asha.list_note')}</p>
      <label className="card tick">
        <input type="checkbox" checked={on} onChange={(e) => { setSaveEnabled(e.target.checked); setOn(e.target.checked); }} />
        <span>{t('asha.save_setting')}<br /><span className="muted small">{t('asha.save_help')}</span></span>
      </label>
      {rows.length === 0 && <p className="card" role="status">{t('asha.list_empty')}</p>}
      {rows.map((c) => {
        const stage = data.stages.find((s) => s.id === c.stage);
        return (
          <div key={c.id} className="card row-card">
            <div className="thumb"><SignalShape tier={c.tier} word={t(`tier.${c.tier}`)} size={72} /></div>
            <div className="grow">
              <b>{stage ? stageLabel(stage) : c.stage}</b>
              <div className="muted small">{new Date(c.ts).toLocaleTimeString(lang === 'hi' ? 'hi-IN' : 'en-IN', { timeStyle: 'short' })} · {t('asha.signs_count', { count: c.yes_count })}</div>
            </div>
            <Button className="small" onClick={() => { deleteCheck(c.id); setTick(tick + 1); }}>{t('asha.delete')}</Button>
          </div>
        );
      })}
      {rows.length > 0 && <Button variant="ghost" onClick={() => { clearChecks(); setTick(tick + 1); }}>{t('asha.clear_all')}</Button>}
    </Page>
  );
}
