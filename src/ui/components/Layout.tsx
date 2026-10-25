import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { stop } from '../../lib/audio';
import { exitNow } from '../../lib/exit';
import { t, useLang } from '../../lib/i18n';
import { useSession } from '../../state/session';
import { Pictogram } from '../icons/Pictogram';
import { Button } from './Button';
import { MaitriMark, Wordmark } from './MaitriMark';
import { Sheet } from './Sheet';
import type { Mode } from '../../engine/types';

const MODES: Mode[] = ['woman', 'asha', 'family'];

function ModeBadge() {
  const { state, dispatch } = useSession();
  const [open, setOpen] = useState(false);
  if (!state.mode) return null;
  return (
    <>
      <button type="button" className="chip icon" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={t(`mode.short_${state.mode}`)}>
        <Pictogram id={`mode-${state.mode}`} size={28} />
        <span className="chip-text">{t(`mode.short_${state.mode}`)}</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t('mode.change_title')}>
        <p className="muted">{t('mode.change_body')}</p>
        {MODES.map((m) => (
          <Button key={m} variant={m === state.mode ? 'primary' : 'answer'} onClick={() => { dispatch({ type: 'setMode', mode: m }); setOpen(false); }}>
            {t(`mode.${m}`)}
          </Button>
        ))}
        <Button variant="ghost" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
      </Sheet>
    </>
  );
}

export function Header({ hideMark }: { hideMark?: boolean }) {
  const nav = useNavigate();
  const { clearAll } = useSession();
  useLang();
  return (
    <header className="header">
      <div className="brand">{!hideMark && <><MaitriMark size={32} /><span className="chip-text"><Wordmark compact /></span></>}</div>
      <div className="header-actions">
        <ModeBadge />
        <Button className="small square" aria-label={t('common.info')} onClick={() => { stop(); nav('/about'); }}>i</Button>
        <Button className="small" onClick={() => exitNow(clearAll)}>{t('common.quick_exit')}</Button>
      </div>
    </header>
  );
}

export function Page({ children, actions, full, className = '' }: { children: ReactNode; actions?: ReactNode; full?: boolean; className?: string }) {
  return (
    <div className={`page ${full ? 'full' : ''} ${className}`}>
      <Header />
      <main className="page-body">{children}</main>
      {actions && <div className="action-bar">{actions}</div>}
    </div>
  );
}
