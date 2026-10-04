import 'dotenv/config';
import { migrateDatabaseSchema } from '../server/lib/postgres-store.js';

await migrateDatabaseSchema();
console.info('Database schema migration completed.');
