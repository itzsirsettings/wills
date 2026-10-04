const CONSENT_COOKIE_NAME = 'wills_group_cookie_consent';
const CONSENT_STORAGE_KEY = 'wills-group:cookie-consent';
export const COOKIE_SETTINGS_EVENT = 'wills-group:open-cookie-settings';

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export const hasAcceptedCookies = () => {
  if (typeof document === 'undefined') {
    return true;
  }

  const cookieAccepted = document.cookie
    .split('; ')
    .some((cookie) => cookie === `${CONSENT_COOKIE_NAME}=accepted`);

  if (cookieAccepted) {
    return true;
  }

  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) === 'accepted';
  } catch {
    return false;
  }
};

export const rememberCookieConsent = () => {
  document.cookie = [
    `${CONSENT_COOKIE_NAME}=accepted`,
    'path=/',
    `max-age=${COOKIE_MAX_AGE_SECONDS}`,
    'SameSite=Lax',
  ].join('; ');

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');
  } catch {
    // Consent is still persisted in the browser cookie.
  }
};

export const openCookieSettings = () => {
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
};
