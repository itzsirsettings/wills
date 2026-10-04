// @vitest-environment node
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

describe('company logo delivery assets', () => {
  it('provides real app icon dimensions, opaque backgrounds and a maskable variant', async () => {
    const manifest = JSON.parse(readFileSync('public/manifest.json', 'utf8'));
    expect(manifest.icons.some((icon: { purpose: string }) => icon.purpose === 'maskable')).toBe(true);
    for (const icon of manifest.icons) {
      const metadata = await sharp(`public${icon.src}`).metadata();
      expect(`${metadata.width}x${metadata.height}`).toBe(icon.sizes);
      expect(metadata.format).toBe('png');
      expect((await sharp(`public${icon.src}`).stats()).isOpaque).toBe(true);
    }
  });
  it('keeps the sharing logo lightweight and supplies actual Apple and Windows icon sizes', async () => {
    const root = 'public/media/wills/optimized/branding/';
    const preview = readFileSync(`${root}company-logo-share.jpg`);
    const metadata = await sharp(preview).metadata();
    expect(metadata.width).toBe(1200);
    expect(metadata.height).toBe(630);
    expect(metadata.format).toBe('jpeg');
    expect(preview.length).toBeLessThan(100 * 1024);
    for (const [file, size] of [['apple-touch-icon.png', 180], ['mstile-150.png', 150], ['logo-32.png', 32], ['logo-48.png', 48]] as const) {
      const image = await sharp(`${root}${file}`).metadata();
      expect([image.width, image.height]).toEqual([size, size]);
    }
    expect(readFileSync('public/browserconfig.xml', 'utf8')).toContain(`${root.slice('public'.length)}mstile-150.png`);
  });
  it('supplies a conventional multi-size ICO and a self-contained SVG fallback', () => {
    const ico = readFileSync('public/favicon.ico');
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(3);
    for (let index = 0; index < 3; index++) {
      const entry = 6 + 16 * index;
      const size = [16, 32, 48][index];
      expect(ico[entry]).toBe(size);
      expect(ico[entry + 1]).toBe(size);
      expect(ico.readUInt32LE(entry + 12) + ico.readUInt32LE(entry + 8)).toBeLessThanOrEqual(ico.length);
    }
    const svg = readFileSync('public/favicon.svg', 'utf8');
    expect(svg).toContain('href="data:image/png;base64,');
    expect(svg).not.toContain('href="/media/');
  });
});
