import { useEffect, useState } from 'react';
import { Cookie, ShieldCheck } from 'lucide-react';
import {
  COOKIE_SETTINGS_EVENT,
  hasAcceptedCookies,
  rememberCookieConsent,
} from '../lib/cookie-consent';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let noticeTimer: ReturnType<typeof window.setTimeout> | undefined;
    const scheduleNotice = () => {
      if (hasAcceptedCookies()) return;
      noticeTimer = window.setTimeout(() => {
        if (!hasAcceptedCookies()) setIsVisible(true);
      }, 10_000);
    };
    const handleOpenSettings = () => {
      window.removeEventListener('load', scheduleNotice);
      window.clearTimeout(noticeTimer);
      setIsVisible(true);
    };

    if (document.readyState === 'complete') scheduleNotice();
    else window.addEventListener('load', scheduleNotice, { once: true });
    window.addEventListener(COOKIE_SETTINGS_EVENT, handleOpenSettings);

    return () => {
      window.clearTimeout(noticeTimer);
      window.removeEventListener('load', scheduleNotice);
      window.removeEventListener(COOKIE_SETTINGS_EVENT, handleOpenSettings);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4 sm:px-6 sm:pb-6"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <div className="brand-dot-surface mx-auto flex max-w-5xl flex-col gap-4 rounded-lg border border-[var(--brand-line)] bg-[var(--brand-white)] p-4 shadow-[0_24px_80px_rgba(17,24,39,0.18)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-red-tint)] text-[var(--market-orange)]">
            <Cookie size={22} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--market-ink)]">
              Your privacy preferences.
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--market-muted)]">
              This site saves your dismissal preference in your browser.
              No optional analytics or advertising cookies are enabled.
            </p>
            <p className="mt-2 flex items-center gap-2 text-xs font-medium text-[var(--market-muted)]">
              <ShieldCheck size={14} aria-hidden="true" />
              Revisit this notice through Cookie settings.
            </p>
            <p className="mt-2 text-xs"><Link to="/privacy-policy" className="underline underline-offset-4">Privacy Policy</Link><span aria-hidden="true"> · </span><Link to="/cookie-policy" className="underline underline-offset-4">Cookie Policy</Link></p>
          </div>
        </div>

        <Button
          type="button"
          className="h-11 shrink-0 rounded-md bg-[var(--market-orange)] px-5 text-sm font-semibold text-white hover:bg-[var(--market-burgundy)]"
          onClick={() => {
            rememberCookieConsent();
            setIsVisible(false);
          }}
        >
          Got it
        </Button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
