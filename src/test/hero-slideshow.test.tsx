import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import Hero from '../sections/Hero';

describe('hero slideshow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

  it('keeps the gallery action and removes the project link from the hero', () => {
    render(<Hero />);
    expect(screen.getByRole('link', { name: 'Explore the designs' }).getAttribute('href')).toBe('#gallery');
    expect(screen.queryByRole('link', { name: 'Plan your project' })).toBeNull();
    expect(screen.getByRole('heading', { level: 1, name: 'Wills Group of Company' })).toBeTruthy();
    expect(screen.getByText('*').getAttribute('aria-hidden')).toBe('true');
    expect(screen.queryByText('Prisma')).toBeNull();
    expect(document.querySelector('#hero video')).toBeNull();
  });

  it('displays each image for ten seconds and wraps after the seventh image', () => {
    render(<Hero />);
    act(() => { vi.advanceTimersByTime(9_999); });
    expect(screen.getByRole('img').getAttribute('alt')).toContain('Black entrance gate');
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.getByRole('img').getAttribute('alt')).toBe('Living room interior design concept');
    for (let index = 0; index < 6; index++) act(() => { vi.advanceTimersByTime(10_000); });
    expect(screen.getByRole('img').getAttribute('alt')).toContain('Black entrance gate');
  });

  it('prioritizes the current image and delays preloading only the next slide', () => {
    render(<Hero />);
    const imagePreloads = () => [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"]')].filter(link => link.as === 'image');
    expect(screen.getByRole('img').getAttribute('fetchpriority')).toBe('high');
    expect(imagePreloads()).toHaveLength(0);
    act(() => { vi.advanceTimersByTime(1_999); });
    expect(imagePreloads()).toHaveLength(0);
    act(() => { vi.advanceTimersByTime(1); });
    const preloads = imagePreloads();
    expect(preloads).toHaveLength(1);
    expect(preloads[0].href).toContain('/optimized/interiors/living-room.avif');
    expect(preloads[0].fetchPriority).toBe('low');
  });

  it('allows pausing and resuming without visible slideshow labels', () => {
    render(<Hero />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause hero slideshow' }));
    act(() => { vi.advanceTimersByTime(30_000); });
    expect(screen.getByRole('img').getAttribute('alt')).toContain('Black entrance gate');
    fireEvent.click(screen.getByRole('button', { name: 'Play hero slideshow' }));
    act(() => { vi.advanceTimersByTime(10_000); });
    expect(screen.getByRole('img').getAttribute('alt')).toBe('Living room interior design concept');
    expect(screen.queryByText('Pause')).toBeNull();
    expect(screen.queryByText('Play')).toBeNull();
  });

  it('stops rotation for keyboard focus and a hidden tab', () => {
    render(<Hero />);
    fireEvent.focus(screen.getByRole('link', { name: 'Explore the designs' }));
    act(() => { vi.advanceTimersByTime(20_000); });
    expect(screen.getByRole('img').getAttribute('alt')).toContain('Black entrance gate');
    fireEvent.blur(screen.getByRole('link', { name: 'Explore the designs' }), { relatedTarget: document.body });
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    act(() => { vi.advanceTimersByTime(20_000); });
    expect(screen.getByRole('img').getAttribute('alt')).toContain('Black entrance gate');
  });

  it('starts paused when reduced motion is requested', () => {
    vi.mocked(matchMedia).mockImplementation((query) => ({ matches: true, media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() }));
    render(<Hero />);
    expect(screen.getByRole('button', { name: 'Play hero slideshow' })).toBeTruthy();
    act(() => { vi.advanceTimersByTime(30_000); });
    expect(screen.getByRole('img').getAttribute('alt')).toContain('Black entrance gate');
  });
});
