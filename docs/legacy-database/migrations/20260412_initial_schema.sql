-- Initial schema for Stankings Trade Hub on Supabase

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  name TEXT PRIMARY KEY,
  caption TEXT NOT NULL,
  sku_count TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
  name TEXT PRIMARY KEY,
  specialty TEXT NOT NULL,
  score TEXT NOT NULL,
  fulfillment TEXT NOT NULL,
  markets TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  category TEXT NOT NULL REFERENCES categories(name) ON DELETE CASCADE,
  image TEXT NOT NULL,
  supplier TEXT NOT NULL REFERENCES suppliers(name) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  moq TEXT NOT NULL,
  lead_time TEXT NOT NULL,
  rating DOUBLE PRECISION NOT NULL,
  orders TEXT NOT NULL,
  badge TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT GALLERIES
CREATE TABLE IF NOT EXISTS product_galleries (
  id TEXT PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image TEXT NOT NULL,
  title TEXT NOT NULL,
  caption TEXT NOT NULL,
  object_position TEXT NOT NULL,
  image_transform TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT TAGS
CREATE TABLE IF NOT EXISTS product_tags (
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (product_id, tag)
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  reference TEXT PRIMARY KEY,
  receipt_token_hash TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  amount_in_kobo INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed')),
  customer_full_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_state TEXT NOT NULL,
  customer_notes TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  payment_channel TEXT,
  paystack_transaction_id TEXT,
  delivery_message TEXT NOT NULL,
  notification_email_status TEXT NOT NULL,
  notification_sms_status TEXT NOT NULL
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  order_reference TEXT NOT NULL REFERENCES orders(reference) ON DELETE CASCADE,
  item_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  quantity INTEGER NOT NULL,
  image TEXT NOT NULL,
  PRIMARY KEY (order_reference, item_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_reference ON order_items(order_reference);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- RLS (Row Level Security) - Enabled for safety, but public anonymous READ for catalog
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Anonymous READ policies for catalog
CREATE POLICY "Allow public read-only access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to suppliers" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to product_galleries" ON product_galleries FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to product_tags" ON product_tags FOR SELECT USING (true);

-- Admin policies (Service Role Key bypasses these, but these are for dashboard usage if needed)
-- Note: Orders are sensitive, only Service Role or Auth should see them.
