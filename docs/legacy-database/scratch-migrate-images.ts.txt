import { supabaseAdmin } from '../server/lib/supabase-admin.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_IMAGES_DIR = path.resolve(__dirname, '../public/images');

async function migrate() {
  console.log('Starting Image Migration...');

  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    console.error('Public images directory not found.');
    return;
  }

  const files = fs.readdirSync(PUBLIC_IMAGES_DIR);
  const results: Record<string, string> = {};

  for (const file of files) {
    if (file === '.gitkeep') continue;
    
    const filePath = path.join(PUBLIC_IMAGES_DIR, file);
    if (!fs.statSync(filePath).isFile()) continue;

    // Determine bucket
    const bucket = file.startsWith('product-') || file.startsWith('bed-') ? 'products' : 'assets';
    const fileContent = fs.readFileSync(filePath);
    
    console.log(`Uploading ${file} to bucket "${bucket}"...`);
    
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(file, fileContent, {
        upsert: true,
        contentType: getContentType(file)
      });

    if (error) {
      console.error(`Failed to upload ${file}:`, error.message);
      continue;
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(file);

    results[file] = urlData.publicUrl;
    console.log(`Success! URL: ${urlData.publicUrl}`);
  }

  console.log('\nMigration upload complete. Updating database references...');

  // Update products table
  const { data: products, error: prodError } = await supabaseAdmin.from('products').select('id, image');
  if (prodError) throw prodError;

  for (const product of products) {
    const filename = product.image.split('/').pop();
    if (results[filename]) {
      console.log(`Updating product ${product.id} image reference...`);
      await supabaseAdmin.from('products').update({ image: results[filename] }).eq('id', product.id);
    }
  }

  // Update product_galleries table
  const { data: galleries, error: galError } = await supabaseAdmin.from('product_galleries').select('id, image');
  if (!galError && galleries) {
    for (const gallery of galleries) {
      const filename = gallery.image.split('/').pop();
      if (results[filename]) {
        console.log(`Updating gallery item ${gallery.id} image reference...`);
        await supabaseAdmin.from('product_galleries').update({ image: results[filename] }).eq('id', gallery.id);
      }
    }
  }
  
  // Note: we'll also print out the final map so we can manually update any hardcoded frontend strings if needed
  console.log('\n--- ASSET URL MAPPING ---');
  Object.entries(results).forEach(([file, url]) => {
    if (!file.startsWith('product-') && !file.startsWith('bed-')) {
       console.log(`"${file}": "${url}"`);
    }
  });

  console.log('\nMigration Finished.');
}

function getContentType(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.webp': return 'image/webp';
    default: return 'application/octet-stream';
  }
}

migrate().catch(console.error);
