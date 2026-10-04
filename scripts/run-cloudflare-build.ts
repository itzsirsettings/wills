import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const videoOrigin = new URL(process.env.VITE_VIDEO_ORIGIN || 'https://wills-production-beec.up.railway.app');
if (videoOrigin.protocol !== 'https:') throw new Error('Cloudflare video origin must use HTTPS.');
process.env.VITE_VIDEO_ORIGIN = videoOrigin.origin;
async function run(script: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, script), ...args], { cwd: root, env: process.env, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Build process failed with code ${code}.`)));
  });
}
await run('node_modules/typescript/bin/tsc', ['-b']);
await run('node_modules/vite/bin/vite.js', ['build']);
await import('./build-cloudflare');
