import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use service role key if available for administrative actions, otherwise try anon key (though it might fail for DDL)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase variables');
  process.exit(1);
}

createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Attempting to enable Supabase Realtime for products and product_galleries...');
  
  // Note: ALTER PUBLICATION cannot be run via standard REST API calls like this via supabase-js unless using RPC.
  // We'll see if the user is using Supabase Studio to manually enable Realtime.
  
  console.log('Realtime hooks have been added to the frontend code in useCatalog.ts.');
  console.log('IMPORTANT: Ensure that "Realtime" is enabled in your Supabase dashboard (Database -> Replication -> supabase_realtime -> Add products and product_galleries).');
  
}

run();
