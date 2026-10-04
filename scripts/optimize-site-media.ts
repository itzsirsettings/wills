import path from 'node:path';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import sharp from 'sharp';

const media = path.resolve('public/media/wills');
const output = path.join(media, 'optimized');
const reportPath = path.resolve('work/optimized-media-report.json');
const args = process.argv.slice(2);
const report: Record<string, unknown> = await readFile(reportPath, 'utf8').then(JSON.parse).catch(error => {
  if (error.code === 'ENOENT') return {};
  throw error;
});
await mkdir(output, { recursive: true });
if (!args.includes('--videos')) {
  const source = await readFile('src/lib/welding-media.ts', 'utf8');
  const numbers = [...source.matchAll(/number: '(\d{4})'/g)].map(match => match[1]);
  const previews = [];
  await mkdir(path.join(output, 'gallery'), { recursive: true });
  await mkdir(path.join(output, 'full'), { recursive: true });
  for (const number of numbers) {
    const filename = `IMG-20261003-WA${number}`;
    for (const width of [360, 720, 1080]) {
      const height = width * 5 / 4;
      const image = sharp(path.join(media, `${filename}.webp`)).rotate().resize(width, height, { fit: 'cover', position: 'centre' });
      const avif = await image.clone().avif({ quality: 42, effort: 4 }).toFile(path.join(output, 'gallery', `${filename}-${width}.avif`));
      const webp = await image.clone().webp({ quality: 65, effort: 5 }).toFile(path.join(output, 'gallery', `${filename}-${width}.webp`));
      previews.push({ number, width, height, avifBytes: avif.size, webpBytes: webp.size });
    }
    console.log(`Prepared uniform previews: ${number}`);
  }
  // Full views retain the original composition; only gallery previews are cropped.
  const fullImages = [];
  for (const file of (await readdir(media)).filter(file => /^IMG-20261003-WA\d{4}\.webp$/.test(file))) {
    const input = path.join(media, file);
    const image = sharp(input).rotate().resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true });
    const webp = await image.clone().webp({ quality: 68, effort: 5 }).toFile(path.join(output, 'full', file));
    const avif = await image.clone().avif({ quality: 45, effort: 4 }).toFile(path.join(output, 'full', file.replace('.webp', '.avif')));
    fullImages.push({ file, originalBytes: (await stat(input)).size, webpBytes: webp.size, avifBytes: avif.size });
  }
  await mkdir(path.join(output, 'interiors'), { recursive: true });
  for (const file of (await readdir(path.join(media, 'interiors'))).filter(file => file.endsWith('.webp'))) {
    const image = sharp(path.join(media, 'interiors', file)).resize({ width: 1280, withoutEnlargement: true });
    await image.clone().webp({ quality: 68, effort: 5 }).toFile(path.join(output, 'interiors', file));
    await image.clone().avif({ quality: 45, effort: 4 }).toFile(path.join(output, 'interiors', file.replace('.webp', '.avif')));
  }
  for (const width of [192, 512]) await sharp(path.join(media, 'wills-group-logo.png')).resize(width, width, { fit: 'contain', background: '#ffffff00' }).png({ compressionLevel: 9, palette: true }).toFile(path.join(output, width === 192 ? 'wills-group-logo.png' : 'wills-group-logo-512.png'));
  await mkdir(path.join(output, 'logos'), { recursive: true });
  for (const file of ['wills-interior', 'wills-foreign-doors', 'wills-metal-works']) {
    const logo = sharp(path.join(media, 'logos', `${file}.png`)).resize(512, 512, { fit: 'contain', background: '#ffffff00' });
    await logo.clone().webp({ quality: 60, effort: 5 }).toFile(path.join(output, 'logos', `${file}.webp`));
    await logo.clone().avif({ quality: 40, effort: 4 }).toFile(path.join(output, 'logos', `${file}.avif`));
  }
  report.images = { count: numbers.length, previews, fullImages };
}
function runFfmpeg(executable: string, argumentsList: string[]) {
  return new Promise<void>((resolve, reject) => {
    let diagnostics = '';
    const child = spawn(executable, argumentsList, { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
    child.stderr.on('data', data => { diagnostics = (diagnostics + data.toString()).slice(-20000); });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`FFmpeg failed (${code}): ${diagnostics}`)));
  });
}
if (!args.includes('--images')) {
  const executable = process.env.FFMPEG_PATH;
  if (!executable) throw new Error('Set FFMPEG_PATH to a verified FFmpeg executable, or use --images.');
  const videos = [];
  for (const number of ['0017', '0083', '0084', '0085', '0086', '0087', '0088', '0089', '0090', '0091', '0092', '0093']) {
    const filename = `VID-20261003-WA${number}.mp4`;
    const input = path.join(media, filename);
    const target = path.join(output, filename);
    await runFfmpeg(executable, ['-hide_banner', '-nostdin', '-y', '-i', input, '-map', '0:v:0', '-map', '0:a?', '-vf', "scale='min(720,iw)':'min(720,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,fps=24,format=yuv420p", '-c:v', 'libx264', '-profile:v', 'main', '-level', '3.1', '-preset', 'medium', '-crf', '30', '-maxrate', '400k', '-bufsize', '800k', '-threads', '2', '-c:a', 'aac', '-b:a', '48k', '-ar', '44100', '-ac', '2', '-map_metadata', '-1', '-movflags', '+faststart', target]);
    const poster = path.resolve('work', `poster-${number}.png`);
    await runFfmpeg(executable, ['-hide_banner', '-nostdin', '-y', '-i', target, '-frames:v', '1', '-vf', 'scale=480:480:force_original_aspect_ratio=decrease', poster]);
    await sharp(poster).webp({ quality: 65 }).toFile(target.replace('.mp4', '.webp'));
    videos.push({ number, originalBytes: (await stat(input)).size, optimizedBytes: (await stat(target)).size });
    console.log(`Prepared fast-start video: ${number}`);
  }
  report.videos = videos;
}
await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(`Media measurements saved to ${reportPath}`);
