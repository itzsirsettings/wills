import { supabaseAdmin } from '../server/lib/supabase-admin.js';

async function checkStorage() {
  console.log('Checking Supabase Storage buckets...');
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
  
  if (error) {
    console.error('Error listing buckets:', error);
    process.exit(1);
  }
  
  console.log('Found buckets:', buckets.map(b => b.name).join(', '));
  
  const requiredBuckets = ['products', 'assets'];
  for (const bucket of requiredBuckets) {
    if (!buckets.find(b => b.name === bucket)) {
      console.log(`Bucket "${bucket}" missing. Creating it...`);
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });
      if (createError) console.error(`Failed to create bucket ${bucket}:`, createError);
      else console.log(`Bucket "${bucket}" created successfully.`);
    } else {
      console.log(`Bucket "${bucket}" already exists.`);
    }
  }
}

checkStorage().catch(console.error);
