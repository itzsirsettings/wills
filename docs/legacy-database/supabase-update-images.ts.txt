import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Updating images to local paths using SERVICE ROLE KEY...');
  
  const products = [
    { id: 1, image: '/images/product-1.jpg' },
    { id: 2, image: '/images/product-2.jpg' },
    { id: 3, image: '/images/product-3.jpg' },
    { id: 4, image: '/images/product-4.jpg' },
    { id: 5, image: '/images/product-5.jpg' },
    { id: 6, image: '/images/product-6.jpg' },
    { id: 7, image: '/images/product-7.jpg' },
    { id: 8, image: '/images/product-8.jpg' },
  ];

  for (const p of products) {
    const { error } = await supabase
      .from('products')
      .update({ image: p.image })
      .eq('id', p.id);
      
    if (error) {
      console.error(`Failed to update product ${p.id}:`, error);
    } else {
      console.log(`Updated product ${p.id} successfully.`);
    }
  }

  console.log('Updating galleries...');
  const galleries = [
    { id: '1-slide-1', image: '/images/product-1.jpg' },
    { id: '1-slide-2', image: '/images/product-1.jpg' },
    { id: '2-slide-1', image: '/images/product-2.jpg' },
    { id: '3-slide-1', image: '/images/product-3.jpg' },
  ];

  for (const g of galleries) {
    const { error } = await supabase
      .from('product_galleries')
      .update({ image: g.image })
      .eq('id', g.id);
      
    if (error) {
      console.error(`Failed to update gallery ${g.id}:`, error);
    } else {
      console.log(`Updated gallery ${g.id} successfully.`);
    }
  }
}

run();
