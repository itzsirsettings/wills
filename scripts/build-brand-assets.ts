import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const source = path.resolve('public/media/wills/wills-group-logo.png');
const output = path.resolve('public/media/wills/optimized/branding');
await mkdir(output, { recursive: true });

// Preserve the supplied artwork. White backgrounds keep the dark logo visible
// in social previews, dark browser tabs and operating-system icon masks.
async function square(size: number, artworkSize: number) {
  const artwork = await sharp(source).resize(artworkSize, artworkSize, { fit: 'contain' }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: '#ffffff' } })
    .composite([{ input: artwork, gravity: 'centre' }])
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}

for (const size of [32, 48, 192, 512]) {
  await writeFile(path.join(output, `logo-${size}.png`), await square(size, Math.floor(size * .92)));
}
await writeFile(path.join(output, 'apple-touch-icon.png'), await square(180, 162));
await writeFile(path.join(output, 'mstile-150.png'), await square(150, 135));
// The entire artwork fits inside the guaranteed 40%-radius maskable safe zone.
await writeFile(path.join(output, 'logo-maskable-512.png'), await square(512, 288));
const sharingArtwork = await sharp(source).resize(550, 550, { fit: 'contain' }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#ffffff' } })
  .composite([{ input: sharingArtwork, gravity: 'centre' }])
  .jpeg({ quality: 85, progressive: true, mozjpeg: true })
  .toFile(path.join(output, 'company-logo-share.jpg'));

// PNG-backed ICO entries provide the conventional /favicon.ico fallback.
const sizes = [16, 32, 48];
const icons = await Promise.all(sizes.map(size => square(size, Math.floor(size * .92))));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
for (let index = 0; index < sizes.length; index++) {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index];
  directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(icons[index].length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += icons[index].length;
}
await writeFile(path.resolve('public/favicon.ico'), Buffer.concat([directory, ...icons]));
const embedded = (await square(64, 59)).toString('base64');
await writeFile(path.resolve('public/favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,${embedded}"/></svg>\n`);
console.log('Prepared company logo share image, browser icons, Apple icon and app icons.');
