import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CookieConsentBanner from '../components/CookieConsentBanner';
import { openCookieSettings } from '../lib/cookie-consent';

const renderNotice = () => render(<MemoryRouter><CookieConsentBanner /></MemoryRouter>);
describe('cookie notice timing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
    localStorage.clear();
    document.cookie = 'wills_group_cookie_consent=; max-age=0; path=/';
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

  it('waits ten seconds after load before showing the notice', () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    renderNotice();
    act(() => { vi.advanceTimersByTime(20_000); });
    expect(screen.queryByRole('dialog')).toBeNull();
    act(() => { window.dispatchEvent(new Event('load')); vi.advanceTimersByTime(9_999); });
    expect(screen.queryByRole('dialog')).toBeNull();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.getByRole('dialog', { name: 'Cookie consent' })).toBeTruthy();
  });

  it('opens settings immediately and keeps a dismissal hidden after the original timer', () => {
    renderNotice();
    act(() => { openCookieSettings(); });
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    act(() => { vi.advanceTimersByTime(15_000); });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('does not automatically show for a returning visitor', () => {
    localStorage.setItem('wills-group:cookie-consent', 'accepted');
    renderNotice();
    act(() => { vi.advanceTimersByTime(15_000); });
    expect(screen.queryByRole('dialog')).toBeNull();
    act(() => { openCookieSettings(); });
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('cancels its pending timer when unmounted', () => {
    const scheduled = vi.spyOn(window, 'setTimeout');
    const cancelled = vi.spyOn(window, 'clearTimeout');
    const notice = renderNotice();
    const timerIndex = scheduled.mock.calls.findIndex(([, delay]) => delay === 10_000);
    expect(timerIndex).toBeGreaterThanOrEqual(0);
    const timer = scheduled.mock.results[timerIndex].value;
    notice.unmount();
    expect(cancelled).toHaveBeenCalledWith(timer);
  });
});
