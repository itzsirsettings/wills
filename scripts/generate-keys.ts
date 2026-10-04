import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDirectory, '..');
const dataDir = path.resolve(projectRoot, 'server', 'data');
const envPath = path.resolve(projectRoot, '.env');

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

function generateSecureKey(length = 32): string {
  return randomBytes(length).toString('base64');
}

function generateKeyPair(): {
  CSRF_SECRET: string;
  ORDER_STORE_ENCRYPTION_KEY: string;
  ORDER_TOKEN_SECRET: string;
} {
  return {
    CSRF_SECRET: generateSecureKey(32),
    ORDER_STORE_ENCRYPTION_KEY: generateSecureKey(32),
    ORDER_TOKEN_SECRET: generateSecureKey(32),
  };
}

const keys = generateKeyPair();

console.log(`
SECURITY: Generated new environment keys
Current .env location: ${envPath}

CSRF_SECRET=${keys.CSRF_SECRET}
ORDER_STORE_ENCRYPTION_KEY=${keys.ORDER_STORE_ENCRYPTION_KEY}
ORDER_TOKEN_SECRET=${keys.ORDER_TOKEN_SECRET}

IMPORTANT: ORDER_STORE_ENCRYPTION_KEY protects stored order data. If production
already has encrypted orders, rotate it only with a migration plan.

To update your .env file:
`);

console.log(`
1. Open: ${envPath}
2. Replace these lines:
   CSRF_SECRET=${keys.CSRF_SECRET}
   ORDER_STORE_ENCRYPTION_KEY=${keys.ORDER_STORE_ENCRYPTION_KEY}
   ORDER_TOKEN_SECRET=${keys.ORDER_TOKEN_SECRET}
3. Save the file

After updating, restart your server with: npm run dev
`);
