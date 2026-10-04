import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Canonical URLs stay on the verified Railway origin while Pages is a mirror.
process.env.PUBLIC_SITE_URL ||= 'https://wills-production-beec.up.railway.app';
const { injectRouteSeo } = await import('../server/lib/seo');
const root = fileURLToPath(new URL('..', import.meta.url));
const output = path.resolve(root, 'work', 'cloudflare-build');
if (path.dirname(output) !== path.resolve(root, 'work') || path.basename(output) !== 'cloudflare-build') throw new Error('Unexpected Cloudflare output path.');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.resolve(root, 'dist'), output, { recursive: true });
const videoOrigin = process.env.VITE_VIDEO_ORIGIN ? new URL(process.env.VITE_VIDEO_ORIGIN).origin : '';
if (videoOrigin) {
  const mediaDirectory = path.join(output, 'media', 'wills');
  for (const file of await readdir(mediaDirectory)) {
    if (/^VID-20261003-WA\d{4}\.mp4$/.test(file)) await rm(path.join(mediaDirectory, file));
  }
}
const shell = await readFile(path.join(root, 'dist', 'index.html'), 'utf8');
const hashes = new Set<string>();
for (const route of ['/', '/privacy-policy', '/terms-of-use', '/cookie-policy', '/security']) {
  const html = injectRouteSeo(shell, route);
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
    if (match[1]) hashes.add(`'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`);
  }
  const directory = path.join(output, route.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), html);
}
await writeFile(path.join(output, '_headers'), `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' ${[...hashes].join(' ')}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.tile.openstreetmap.org; font-src 'self'; connect-src 'self' https://*.tile.openstreetmap.org; media-src 'self' ${videoOrigin}; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/fonts/*
  Cache-Control: public, max-age=86400
/media/*
  Cache-Control: public, max-age=86400
`);
await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${process.env.PUBLIC_SITE_URL}/sitemap.xml\n`);
console.log(`Cloudflare artifact prepared at ${output}; policy metadata and security headers included.`);
