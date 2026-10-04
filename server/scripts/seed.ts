import 'dotenv/config';
import { initializeStore, getDatabase } from '../lib/store.js';
import { marketplaceProducts, marketplaceCategories } from '../../src/lib/marketplace-data.ts';

async function seed() {
  await initializeStore();
  const db = getDatabase();

  console.log('Seeding categories...');
  const insertCategory = db.prepare('INSERT OR REPLACE INTO categories (name, caption, sku_count, icon) VALUES (?, ?, ?, ?)');
  for (const cat of marketplaceCategories) {
    insertCategory.run(cat.name, cat.caption, cat.skuCount, cat.icon);
  }

  console.log('Seeding suppliers (dynamic from products)...');
  const insertSupplier = db.prepare('INSERT OR IGNORE INTO suppliers (name, specialty, score, fulfillment, markets) VALUES (?, ?, ?, ?, ?)');
  const suppliers = new Set(marketplaceProducts.map(p => p.supplier));
  for (const sup of suppliers) {
    insertSupplier.run(sup, 'General Supplier', '5.0', 'FOB / EXW', 'Global');
  }

  console.log('Seeding products...');
  const insertProduct = db.prepare('INSERT OR REPLACE INTO products (id, name, price, category, image, supplier, origin, moq, lead_time, rating, orders, badge, summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insertGallery = db.prepare('INSERT OR REPLACE INTO product_galleries (id, product_id, image, title, caption, object_position, image_transform) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insertTag = db.prepare('INSERT OR IGNORE INTO product_tags (product_id, tag) VALUES (?, ?)');

  for (const prod of marketplaceProducts) {
    insertProduct.run(
      prod.id,
      prod.name,
      prod.price,
      prod.category,
      prod.image,
      prod.supplier,
      prod.origin,
      prod.moq,
      prod.leadTime,
      prod.rating,
      prod.orders,
      prod.badge || '',
      prod.summary || ''
    );

    if (prod.gallery) {
      for (const item of prod.gallery) {
        insertGallery.run(
          item.id,
          prod.id,
          item.image,
          item.title,
          item.caption,
          item.objectPosition || '',
          item.imageTransform || ''
        );
      }
    }

    if (prod.tags) {
      for (const tag of prod.tags) {
        insertTag.run(prod.id, tag);
      }
    }
  }

  console.log('Done mapping initial data into SQLite.');
}

seed().catch(console.error);
