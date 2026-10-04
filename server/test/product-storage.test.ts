// @vitest-environment node
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { sanitizeProductImage } from '../lib/product-storage.js';

describe('product image sanitization', () => {
  it('re-encodes supported images and strips EXIF data', async () => {
    const input = await sharp({ create: { width: 32, height: 32, channels: 3, background: '#123456' } })
      .withExif({ IFD0: { Copyright: 'private test metadata' } }).jpeg().toBuffer();
    expect((await sharp(input).metadata()).exif).toBeDefined();
    const output = await sanitizeProductImage(input);
    const metadata = await sharp(output).metadata();
    expect(metadata.format).toBe('webp');
    expect(metadata.exif).toBeUndefined();
  });
  it('rejects corrupt content and oversized inputs', async () => {
    await expect(sanitizeProductImage(Buffer.from('not an image'))).rejects.toThrow();
    await expect(sanitizeProductImage(Buffer.alloc(2 * 1024 * 1024 + 1))).rejects.toThrow('2MB');
  });
  it('rejects non-allowlisted formats', async () => {
    const tiff = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#ffffff' } }).tiff().toBuffer();
    await expect(sanitizeProductImage(tiff)).rejects.toThrow('Unsupported');
  });
});
