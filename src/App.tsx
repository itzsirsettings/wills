import { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import BrandLogo from './components/BrandLogo';
import CookieConsentBanner from './components/CookieConsentBanner';
import LandingPage from './components/LandingPage';
import { policyRoutes } from './lib/policies';

const PolicyPage = lazy(() => import('./components/PolicyPage'));

const AppLoadingState = ({ message }: { message: string }) => (
  <div className="flex min-h-screen items-center justify-center bg-[var(--market-sand)] px-6">
    <div className="rounded-[1.5rem] border border-[var(--market-stroke)] bg-[var(--market-ivory)] px-6 py-5 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <BrandLogo className="justify-center" markClassName="h-9 w-16" textTone="brand" />
      <p className="mt-3 text-sm font-medium text-[var(--market-muted)]">{message}</p>
    </div>
  </div>
);

function AppShell() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<LandingPage />}
        />
        {policyRoutes.map(({ kind, path }) => <Route key={path} path={path} element={(
          <Suspense fallback={<AppLoadingState message="Loading website information..." />}>
            <PolicyPage kind={kind} />
          </Suspense>
        )} />)}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CookieConsentBanner />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
