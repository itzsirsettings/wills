import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
const read = (...parts: string[]) => readFileSync(path.join(process.cwd(), ...parts), 'utf8');
const shell = () => new DOMParser().parseFromString(read('index.html'), 'text/html');
describe('rebranded static SEO shell', () => {
  it('ships the confirmed identity without inventing a production domain', () => {
    const document = shell();
    expect(document.title).toContain('Wills Group of Company');
    expect(document.title).toContain('Interiors');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('link[rel="sitemap"]')?.getAttribute('href')).toBe('/sitemap.xml');
    expect(document.querySelector('meta[name="twitter:site"]')).toBeNull();
  });
  it('contains parseable structured data using only supplied business details', () => {
    const data = JSON.parse(shell().querySelector('script[type="application/ld+json"]')?.textContent || '{}');
    const graph = data['@graph'] as Array<Record<string, unknown>>;
    expect(graph.some((node) => node['@type'] === 'Organization')).toBe(true);
    expect(graph.some((node) => node['@type'] === 'WebSite')).toBe(true);
    expect(graph.some((node) => node['@type'] === 'WebPage')).toBe(true);
    expect(JSON.stringify(graph)).toContain('+2347057450799');
    expect(JSON.stringify(graph)).not.toMatch(/Asaba|thewworks|printing|Okelue/i);
    expect(JSON.stringify(graph)).not.toContain('aggregateRating');
    expect(JSON.stringify(graph)).not.toContain('address');
  });
  it('keeps the unconfigured preview out of indexing', () => {
    expect(read('public', 'robots.txt')).toContain('Disallow: /');
    const sitemap = new DOMParser().parseFromString(read('public', 'sitemap.xml'), 'application/xml');
    expect(sitemap.getElementsByTagName('url').length).toBe(0);
    expect(read('public', 'sitemap.xml')).not.toContain('thewworksict.com');
  });
});
