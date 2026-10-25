import { Component, type ReactNode } from 'react';
import { lazy, Suspense } from 'react';
import { Router } from './routes';
import { AuthProvider } from './state/auth';
import { SessionProvider } from './state/session';
import { t } from './lib/i18n';

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="page"><main className="page-body">
        <p className="error-box" role="alert">{t('error.generic')}</p>
        <button className="btn primary" onClick={() => { window.location.hash = '#/'; window.location.reload(); }}>{t('common.home')}</button>
      </main></div>
    );
  }
}

const Kit = lazy(() => import('./ui/dev/Kit'));

export default function App() {
  if (window.location.search.includes('kit')) return <Suspense fallback={null}><Kit /></Suspense>;
  return <Boundary><AuthProvider><SessionProvider><Router /></SessionProvider></AuthProvider></Boundary>;
}
