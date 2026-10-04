import 'dotenv/config';
import { validateProductionConfig } from '../server/lib/runtime-config.js';
if (process.argv.includes('--production')) process.env.NODE_ENV = 'production';
try {
  validateProductionConfig();
  console.info('Runtime environment configuration passed. Secret values were not printed.');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Environment validation failed.');
  process.exitCode = 1;
}
