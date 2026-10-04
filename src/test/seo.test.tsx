import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SEO from '../components/SEO';

const getMetaContent = (selector: string) =>
  document.querySelector(selector)?.getAttribute('content');

describe('SEO Component', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
  });

  it('updates document title correctly', () => {
    render(
      <MemoryRouter>
        <SEO title="Test Page" />
      </MemoryRouter>
    );
    expect(document.title).toBe('Test Page | Wills Group of Company');
  });

  it('updates meta description correctly', () => {
    render(
      <MemoryRouter>
        <SEO description="Custom description for testing" />
      </MemoryRouter>
    );
    const meta = document.querySelector('meta[name="description"]');
    expect(meta?.getAttribute('content')).toBe('Custom description for testing');
  });

  it('sets canonical URL correctly', () => {
    render(
      <MemoryRouter initialEntries={['/store?reference=abc123']}>
        <SEO />
      </MemoryRouter>
    );
    const link = document.querySelector('link[rel="canonical"]');
    expect(link?.getAttribute('href')).toBe('https://wills-production-beec.up.railway.app/store');
  });

  it('handles keywords correctly', () => {
    render(
      <MemoryRouter>
        <SEO keywords="metalwork, interiors, wills" />
      </MemoryRouter>
    );
    const meta = document.querySelector('meta[name="keywords"]');
    expect(meta?.getAttribute('content')).toBe('metalwork, interiors, wills');
  });

  it('sets indexable social metadata by default', () => {
    render(
      <MemoryRouter>
        <SEO title="Home" description="Wills Group of Company description" />
      </MemoryRouter>
    );

    expect(getMetaContent('meta[name="robots"]')).toBe(
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    );
    expect(getMetaContent('meta[property="og:site_name"]')).toBe('Wills Group of Company');
    expect(getMetaContent('meta[property="og:image"]')).toBe(
      'https://wills-production-beec.up.railway.app/media/wills/IMG-20261003-WA0067.webp',
    );
    expect(getMetaContent('meta[name="twitter:card"]')).toBe('summary_large_image');
  });

  it('marks private routes as noindex when requested', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <SEO title="Admin Dashboard" noIndex />
      </MemoryRouter>
    );

    expect(getMetaContent('meta[name="robots"]')).toBe('noindex, nofollow');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://wills-production-beec.up.railway.app/admin',
    );
  });
});
