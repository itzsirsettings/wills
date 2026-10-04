// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { projectImages, projectSrc, suppliedVideos } from '../lib/welding-media';
import { mediaDimensions } from '../lib/media-dimensions';
describe('supplied welding and interiors media', () => {
  it('references actual files for every gallery image and every video', () => {
    expect(projectImages).toHaveLength(33);
    expect(suppliedVideos).toHaveLength(12);
    const urls = [...projectImages.flatMap((project) => [projectSrc(project), projectSrc(project, true)]), ...suppliedVideos, '/media/wills/wills-group-logo.png'];
    for (const url of urls) expect(existsSync(path.join(process.cwd(), 'public', url))).toBe(true);
    expect(new Set(projectImages.map((project) => project.number)).size).toBe(33);
  });
  it('provides dimensions, descriptions and an interiors category', () => {
    for (const project of projectImages) {
      expect(project.alt.length).toBeGreaterThan(15);
      expect(mediaDimensions[project.number].width).toBeGreaterThan(0);
      expect(mediaDimensions[project.number].smallWidth).toBeLessThanOrEqual(mediaDimensions[project.number].width);
    }
    expect(projectImages.some((project) => project.category === 'Interiors')).toBe(true);
  });
  it('uses the new brand manifest and retains the original media', () => {
    const manifest = JSON.parse(readFileSync('public/manifest.json', 'utf8'));
    expect(manifest.name).toBe('Wills Group of Company');
    expect(manifest.icons[0].src).toBe('/media/wills/wills-group-logo.png');
    expect(existsSync('public/images/thewworks-logo.png')).toBe(true);
    expect(existsSync('public/Surreal.mp4')).toBe(true);
  });
});
