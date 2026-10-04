import path from 'node:path';
import sharp from 'sharp';

const heroFiles = [
  'IMG-20261003-WA0067.webp', 'interiors/living-room.webp',
  'IMG-20261003-WA0039.webp', 'interiors/kitchen.webp',
  'IMG-20261003-WA0044.webp', 'interiors/bedroom.webp',
  'IMG-20261003-WA0018.webp',
];
for (const file of heroFiles) {
  const source = path.resolve('public/media/wills', file);
  const target = source.replace(/\.webp$/, '.avif');
  const { size } = await sharp(source).avif({ quality: 50, effort: 5 }).toFile(target);
  console.log(`${file}: ${size} AVIF bytes`);
}
