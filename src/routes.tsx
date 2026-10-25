import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { featureFlag } from './lib/config';
import { t } from './lib/i18n';
import { Button } from './ui/components/Button';
import { Page } from './ui/components/Layout';
import About from './ui/screens/About';
import Account from './ui/screens/Account';
import Log from './ui/screens/Log';
import Start from './ui/screens/Start';
import Mode from './ui/screens/Mode';
import Plan from './ui/screens/Plan';
import Question from './ui/screens/Question';
import Result from './ui/screens/Result';
import Slip from './ui/screens/Slip';
import Speak from './ui/screens/Speak';
import Stage from './ui/screens/Stage';
import Support from './ui/screens/Support';

const Trust = lazy(() => import('./ui/screens/Trust'));
const AshaList = lazy(() => import('./ui/screens/AshaList'));
const RuleReview = lazy(() => import('./ui/screens/RuleReview'));

function NotFound() {
  const nav = useNavigate();
  return (
    <Page actions={<Button variant="primary" onClick={() => nav('/')}>{t('common.home')}</Button>}>
      <p className="error-box" role="alert">{t('error.not_found')}</p>
    </Page>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<p className="page-body" role="status">{t('common.loading')}</p>}>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/mode" element={<Mode />} />
        <Route path="/stage" element={<Stage />} />
        <Route path="/speak" element={<Speak />} />
        <Route path="/q/:index" element={<Question />} />
        <Route path="/result" element={<Result />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/slip" element={<Slip />} />
        <Route path="/support" element={<Support />} />
        <Route path="/account" element={<Account />} />
        <Route path="/log" element={<Log />} />
        <Route path="/about" element={<About />} />
        <Route path="/trust" element={<Trust />} />
        <Route path="/asha" element={featureFlag('asha_list') ? <AshaList /> : <Navigate to="/" replace />} />
        <Route path="/review" element={featureFlag('rule_review_page') ? <RuleReview /> : <Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export function Router() {
  return <HashRouter><AppRoutes /></HashRouter>;
}
