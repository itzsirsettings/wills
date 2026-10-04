import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import { fileURLToPath } from 'node:url';
import { getOrderStoreEncryptionKey, logSecurityEvent } from './security.js';
import { validatePaymentForOrder } from './payment-validation.js';
import type {
  NotificationState,
  NotificationStatus,
  OrderRecord,
  PaystackTransactionData,
} from './types.js';

interface OrderStoreData {
  orders: OrderRecord[];
}

interface EncryptedStoreEnvelope {
  version: 1;
  iv: string;
  tag: string;
  ciphertext: string;
}

interface ClaimedPaidOrder {
  order: OrderRecord | null;
  claimed: {
    email: boolean;
    sms: boolean;
  };
}

interface OrderRowShape {
  reference: string;
  receipt_token_hash: string;
  amount: number;
  amount_in_kobo: number;
  currency: 'NGN';
  status: 'pending' | 'paid' | 'failed';
  customer_full_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_state: string;
  customer_notes: string;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  payment_channel: string | null;
  paystack_transaction_id: string | null;
  delivery_message: string;
  notification_email_status: NotificationStatus;
  notification_sms_status: NotificationStatus;
}

interface OrderItemRowShape {
  order_reference: string;
  item_id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface PostgresOrderRow extends QueryResultRow, OrderRowShape {}
interface PostgresOrderItemRow extends QueryResultRow, OrderItemRowShape {}

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDirectory, '..', '..');
const defaultSqliteDatabasePath = path.resolve(projectRoot, 'server', 'data', 'orders.sqlite');
const legacyStoreFilePath = path.resolve(projectRoot, 'server', 'data', 'orders.json');
const DEFAULT_STORE: OrderStoreData = { orders: [] };
const ENCRYPTED_VALUE_PREFIX = 'enc:v1:';

let pool: Pool | null = null;
let initializationPromise: Promise<void> | null = null;

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const shouldClaimNotification = (status: NotificationStatus) =>
  status === 'pending' || status === 'failed' || status === 'not_configured';

function getRequiredDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing.');
  }

  return databaseUrl;
}

function getDatabasePoolMax() {
  const configuredSize = Number(process.env.DATABASE_POOL_MAX || 10);

  if (!Number.isFinite(configuredSize)) {
    return 10;
  }

  return Math.min(50, Math.max(1, Math.trunc(configuredSize)));
}

function getPostgresSslConfig() {
  const configuredMode = process.env.DATABASE_SSL_MODE?.trim().toLowerCase();

  if (configuredMode === 'disable') {
    const host = new URL(getRequiredDatabaseUrl()).hostname;
    if (process.env.NODE_ENV === 'production' && !host.endsWith('.railway.internal')) throw new Error('Unencrypted database transport is restricted to verified Railway private networking.');
    return false;
  }

  if (configuredMode === 'verify-full') {
    return { rejectUnauthorized: true, ...(process.env.DATABASE_CA_CERT ? { ca: process.env.DATABASE_CA_CERT } : {}) };
  }

  if (configuredMode === 'require') {
    return { rejectUnauthorized: true, ...(process.env.DATABASE_CA_CERT ? { ca: process.env.DATABASE_CA_CERT } : {}) };
  }

  const parsedUrl = new URL(getRequiredDatabaseUrl());
  const isLocalHost =
    parsedUrl.hostname === 'localhost' ||
    parsedUrl.hostname === '127.0.0.1' ||
    parsedUrl.hostname === '::1';

  return isLocalHost && process.env.NODE_ENV !== 'production' ? false : { rejectUnauthorized: true };
}

function getDatabaseQueryTimeout() {
  const timeoutMs = Number(process.env.DATABASE_STATEMENT_TIMEOUT_MS || 10000);
  return Number.isFinite(timeoutMs) ? timeoutMs : 10000;
}

function resolveLocalSqlitePath() {
  const configuredPath = process.env.ORDER_DATABASE_PATH?.trim();

  if (!configuredPath) {
    return defaultSqliteDatabasePath;
  }

  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(projectRoot, configuredPath);
}

function getPool() {
  if (!pool) {
    throw new Error('Postgres order store has not been initialized yet.');
  }

  return pool;
}

function isPlainStoreData(value: unknown): value is OrderStoreData {
  return Boolean(
    value &&
      typeof value === 'object' &&
      Array.isArray((value as Partial<OrderStoreData>).orders),
  );
}

function isEncryptedStoreEnvelope(value: unknown): value is EncryptedStoreEnvelope {
  return Boolean(
    value &&
      typeof value === 'object' &&
      (value as Partial<EncryptedStoreEnvelope>).version === 1 &&
      typeof (value as Partial<EncryptedStoreEnvelope>).iv === 'string' &&
      typeof (value as Partial<EncryptedStoreEnvelope>).tag === 'string' &&
      typeof (value as Partial<EncryptedStoreEnvelope>).ciphertext === 'string',
  );
}

function decryptSensitiveValue(value: string) {
  if (!value || !value.startsWith(ENCRYPTED_VALUE_PREFIX)) {
    return value;
  }

  const payload = value.slice(ENCRYPTED_VALUE_PREFIX.length);
  const [iv, tag, ciphertext] = payload.split('.');

  if (!iv || !tag || !ciphertext) {
    throw new Error('Encrypted order field is malformed.');
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getOrderStoreEncryptionKey(),
    Buffer.from(iv, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64url')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

function encryptSensitiveValue(value: string) {
  if (!value) {
    return '';
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getOrderStoreEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${ENCRYPTED_VALUE_PREFIX}${iv.toString('base64url')}.${tag.toString('base64url')}.${ciphertext.toString('base64url')}`;
}

function decryptLegacyStore(raw: string): OrderStoreData {
  const parsed = JSON.parse(raw) as unknown;

  if (isPlainStoreData(parsed)) {
    return clone(parsed);
  }

  if (!isEncryptedStoreEnvelope(parsed)) {
    return clone(DEFAULT_STORE);
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getOrderStoreEncryptionKey(),
    Buffer.from(parsed.iv, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(parsed.tag, 'base64url'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(parsed.ciphertext, 'base64url')),
    decipher.final(),
  ]);
  const store = JSON.parse(decrypted.toString('utf8')) as unknown;

  if (!isPlainStoreData(store)) {
    return clone(DEFAULT_STORE);
  }

  return clone(store);
}

function normalizeNumber(value: unknown) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return Number(value);
  }

  return 0;
}

function normalizeNullableString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function fromRowShape(orderRow: OrderRowShape, itemRows: OrderItemRowShape[]): OrderRecord {
  return {
    reference: orderRow.reference,
    receiptTokenHash: orderRow.receipt_token_hash,
    amount: orderRow.amount,
    amountInKobo: orderRow.amount_in_kobo,
    currency: orderRow.currency,
    status: orderRow.status,
    customer: {
      fullName: decryptSensitiveValue(orderRow.customer_full_name),
      email: decryptSensitiveValue(orderRow.customer_email),
      phone: decryptSensitiveValue(orderRow.customer_phone),
      address: decryptSensitiveValue(orderRow.customer_address),
      city: decryptSensitiveValue(orderRow.customer_city),
      state: decryptSensitiveValue(orderRow.customer_state),
      notes: decryptSensitiveValue(orderRow.customer_notes),
    },
    items: itemRows.map((itemRow) => ({
      id: itemRow.item_id,
      name: itemRow.name,
      price: itemRow.price,
      quantity: itemRow.quantity,
      image: itemRow.image,
    })),
    createdAt: orderRow.created_at,
    updatedAt: orderRow.updated_at,
    paidAt: orderRow.paid_at || undefined,
    paymentChannel: orderRow.payment_channel || undefined,
    paystackTransactionId: orderRow.paystack_transaction_id || undefined,
    deliveryMessage: orderRow.delivery_message,
    notificationStatus: {
      email: orderRow.notification_email_status,
      sms: orderRow.notification_sms_status,
    },
  };
}

function normalizePostgresOrderRow(row: PostgresOrderRow): OrderRowShape {
  return {
    reference: String(row.reference),
    receipt_token_hash: String(row.receipt_token_hash),
    amount: normalizeNumber(row.amount),
    amount_in_kobo: normalizeNumber(row.amount_in_kobo),
    currency: String(row.currency) as 'NGN',
    status: String(row.status) as 'pending' | 'paid' | 'failed',
    customer_full_name: String(row.customer_full_name),
    customer_email: String(row.customer_email),
    customer_phone: String(row.customer_phone),
    customer_address: String(row.customer_address),
    customer_city: String(row.customer_city),
    customer_state: String(row.customer_state),
    customer_notes: String(row.customer_notes),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    paid_at: normalizeNullableString(row.paid_at),
    payment_channel: normalizeNullableString(row.payment_channel),
    paystack_transaction_id: normalizeNullableString(row.paystack_transaction_id),
    delivery_message: String(row.delivery_message),
    notification_email_status: String(row.notification_email_status) as NotificationStatus,
    notification_sms_status: String(row.notification_sms_status) as NotificationStatus,
  };
}

function normalizePostgresItemRow(row: PostgresOrderItemRow): OrderItemRowShape {
  return {
    order_reference: String(row.order_reference),
    item_id: normalizeNumber(row.item_id),
    name: String(row.name),
    price: normalizeNumber(row.price),
    quantity: normalizeNumber(row.quantity),
    image: String(row.image),
  };
}

function normalizeSqliteOrderRow(row: Record<string, unknown>): OrderRowShape {
  return {
    reference: String(row.reference),
    receipt_token_hash: String(row.receipt_token_hash),
    amount: normalizeNumber(row.amount),
    amount_in_kobo: normalizeNumber(row.amount_in_kobo),
    currency: String(row.currency) as 'NGN',
    status: String(row.status) as 'pending' | 'paid' | 'failed',
    customer_full_name: String(row.customer_full_name),
    customer_email: String(row.customer_email),
    customer_phone: String(row.customer_phone),
    customer_address: String(row.customer_address),
    customer_city: String(row.customer_city),
    customer_state: String(row.customer_state),
    customer_notes: String(row.customer_notes),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    paid_at: normalizeNullableString(row.paid_at),
    payment_channel: normalizeNullableString(row.payment_channel),
    paystack_transaction_id: normalizeNullableString(row.paystack_transaction_id),
    delivery_message: String(row.delivery_message),
    notification_email_status: String(row.notification_email_status) as NotificationStatus,
    notification_sms_status: String(row.notification_sms_status) as NotificationStatus,
  };
}

function normalizeSqliteItemRow(row: Record<string, unknown>): OrderItemRowShape {
  return {
    order_reference: String(row.order_reference),
    item_id: normalizeNumber(row.item_id),
    name: String(row.name),
    price: normalizeNumber(row.price),
    quantity: normalizeNumber(row.quantity),
    image: String(row.image),
  };
}

async function createSchema(client: PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS categories (
      name TEXT PRIMARY KEY,
      caption TEXT NOT NULL,
      sku_count TEXT NOT NULL,
      icon TEXT NOT NULL
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS suppliers (
      name TEXT PRIMARY KEY,
      specialty TEXT NOT NULL,
      score TEXT NOT NULL,
      fulfillment TEXT NOT NULL,
      markets TEXT NOT NULL
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      price DOUBLE PRECISION NOT NULL,
      category TEXT NOT NULL,
      image TEXT NOT NULL,
      supplier TEXT NOT NULL,
      origin TEXT NOT NULL,
      moq TEXT NOT NULL,
      lead_time TEXT NOT NULL,
      rating DOUBLE PRECISION NOT NULL,
      orders TEXT NOT NULL,
      badge TEXT NOT NULL,
      summary TEXT NOT NULL
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS product_galleries (
      id TEXT PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image TEXT NOT NULL,
      title TEXT NOT NULL,
      caption TEXT NOT NULL,
      object_position TEXT NOT NULL,
      image_transform TEXT NOT NULL
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS product_tags (
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      tag TEXT NOT NULL,
      PRIMARY KEY (product_id, tag)
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS orders (
      reference TEXT PRIMARY KEY,
      receipt_token_hash TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      amount_in_kobo INTEGER NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL,
      customer_full_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      customer_city TEXT NOT NULL,
      customer_state TEXT NOT NULL,
      customer_notes TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      paid_at TEXT,
      payment_channel TEXT,
      paystack_transaction_id TEXT,
      delivery_message TEXT NOT NULL,
      notification_email_status TEXT NOT NULL,
      notification_sms_status TEXT NOT NULL
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      order_reference TEXT NOT NULL REFERENCES orders(reference) ON DELETE CASCADE,
      item_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price DOUBLE PRECISION NOT NULL,
      quantity INTEGER NOT NULL,
      image TEXT NOT NULL,
      PRIMARY KEY (order_reference, item_id)
    )
  `);

  await client.query(
    'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
  );
  await client.query(
    'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)',
  );
  await client.query(
    'CREATE INDEX IF NOT EXISTS idx_order_items_reference ON order_items(order_reference)',
  );
}

async function insertOrder(client: PoolClient, order: OrderRecord) {
  await client.query('DELETE FROM orders WHERE reference = $1', [order.reference]);

  await client.query(
    `INSERT INTO orders (
      reference,
      receipt_token_hash,
      amount,
      amount_in_kobo,
      currency,
      status,
      customer_full_name,
      customer_email,
      customer_phone,
      customer_address,
      customer_city,
      customer_state,
      customer_notes,
      created_at,
      updated_at,
      paid_at,
      payment_channel,
      paystack_transaction_id,
      delivery_message,
      notification_email_status,
      notification_sms_status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
      $18, $19, $20, $21
    )`,
    [
      order.reference,
      order.receiptTokenHash,
      order.amount,
      order.amountInKobo,
      order.currency,
      order.status,
      encryptSensitiveValue(order.customer.fullName),
      encryptSensitiveValue(order.customer.email),
      encryptSensitiveValue(order.customer.phone),
      encryptSensitiveValue(order.customer.address),
      encryptSensitiveValue(order.customer.city),
      encryptSensitiveValue(order.customer.state),
      encryptSensitiveValue(order.customer.notes),
      order.createdAt,
      order.updatedAt,
      order.paidAt || null,
      order.paymentChannel || null,
      order.paystackTransactionId || null,
      order.deliveryMessage,
      order.notificationStatus.email,
      order.notificationStatus.sms,
    ],
  );

  for (const item of order.items) {
    await client.query(
      `INSERT INTO order_items (
        order_reference,
        item_id,
        name,
        price,
        quantity,
        image
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [order.reference, item.id, item.name, item.price, item.quantity, item.image],
    );
  }
}

async function readOrderByReferenceWithClient(client: PoolClient, reference: string, lock = false) {
  const orderResult = await client.query<PostgresOrderRow>(
    `SELECT * FROM orders WHERE reference = $1 LIMIT 1${lock ? ' FOR UPDATE' : ''}`,
    [reference],
  );

  if (orderResult.rowCount === 0) {
    return null;
  }

  const itemsResult = await client.query<PostgresOrderItemRow>(
    'SELECT * FROM order_items WHERE order_reference = $1 ORDER BY item_id ASC',
    [reference],
  );

  return fromRowShape(
    normalizePostgresOrderRow(orderResult.rows[0]),
    itemsResult.rows.map(normalizePostgresItemRow),
  );
}

async function withClient<T>(handler: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect();

  try {
    return await handler(client);
  } finally {
    client.release();
  }
}

async function runInTransaction<T>(handler: (client: PoolClient) => Promise<T>) {
  return withClient(async (client) => {
    await client.query('BEGIN');

    try {
      const result = await handler(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Log but don't throw - original error takes precedence
        logSecurityEvent({ event: 'postgres_rollback_failed', outcome: 'failed', statusCode: 500 });
      }

      throw error;
    }
  });
}

async function loadOrdersFromLegacyJsonFile() {
  try {
    const raw = await fs.readFile(legacyStoreFilePath, 'utf8');
    return decryptLegacyStore(raw).orders;
  } catch {
    return [];
  }
}

function loadOrdersFromSqliteFile(sqlitePath: string) {
  try {
    const sqliteDatabase = new DatabaseSync(sqlitePath);

    try {
      const existingOrderTable = sqliteDatabase
        .prepare(
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'orders' LIMIT 1",
        )
        .get() as Record<string, unknown> | undefined;

      if (!existingOrderTable) {
        return [] as OrderRecord[];
      }

      const rawOrders = sqliteDatabase
        .prepare('SELECT * FROM orders ORDER BY created_at ASC')
        .all() as unknown as Array<Record<string, unknown>>;

      return rawOrders.map((rawOrder) => {
        const rawItems = sqliteDatabase
          .prepare('SELECT * FROM order_items WHERE order_reference = ? ORDER BY item_id ASC')
          .all(String(rawOrder.reference)) as unknown as Array<Record<string, unknown>>;

        return fromRowShape(
          normalizeSqliteOrderRow(rawOrder),
          rawItems.map(normalizeSqliteItemRow),
        );
      });
    } finally {
      sqliteDatabase.close();
    }
  } catch {
    return [] as OrderRecord[];
  }
}

async function migrateLegacyStoresIfNeeded() {
  const existingCount = await withClient(async (client) => {
    const result = await client.query<{ count: number }>('SELECT COUNT(*)::int AS count FROM orders');
    return Number(result.rows[0]?.count || 0);
  });

  if (existingCount > 0) {
    return;
  }

  const sqliteOrders = loadOrdersFromSqliteFile(resolveLocalSqlitePath());
  const legacyOrders = sqliteOrders.length > 0 ? sqliteOrders : await loadOrdersFromLegacyJsonFile();

  if (legacyOrders.length === 0) {
    return;
  }

  await runInTransaction(async (client) => {
    for (const order of legacyOrders) {
      await insertOrder(client, order);
    }
  });

  logSecurityEvent({
    event: 'order_store_migrated',
    outcome: 'succeeded',
    reason: sqliteOrders.length > 0
      ? `migrated_${legacyOrders.length}_orders_to_postgres_from_sqlite`
      : `migrated_${legacyOrders.length}_orders_to_postgres_from_json`,
  });
}

async function initializeStore() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const queryTimeout = getDatabaseQueryTimeout();
      const connection = new URL(getRequiredDatabaseUrl());
      for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) connection.searchParams.delete(key);
      
      pool = new Pool({
        connectionString: connection.toString(),
        max: getDatabasePoolMax(),
        ssl: getPostgresSslConfig(),
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 5000,
        query_timeout: queryTimeout,
        statement_timeout: queryTimeout,
      });
      pool.on('error', () => {
        logSecurityEvent({
          event: 'postgres_pool_error',
          outcome: 'failed',
          reason: 'Database connection failed.',
        });
      });

      if (process.env.NODE_ENV !== 'production') {
        await withClient(async (client) => { await createSchema(client); });
        await migrateLegacyStoresIfNeeded();
      }
    })();
  }

  return initializationPromise;
}

export async function getProducts() {
  await initializeStore();
  return withClient(async (client) => {
    const productsRes = await client.query('SELECT * FROM products ORDER BY id LIMIT 200');
    const galleriesRes = await client.query('SELECT * FROM product_galleries');
    const tagsRes = await client.query('SELECT * FROM product_tags');

    return productsRes.rows.map(row => ({
      id: normalizeNumber(row.id),
      name: String(row.name),
      price: normalizeNumber(row.price),
      category: String(row.category),
      image: String(row.image),
      supplier: String(row.supplier),
      origin: String(row.origin),
      moq: String(row.moq),
      leadTime: String(row.lead_time),
      rating: normalizeNumber(row.rating),
      orders: String(row.orders),
      badge: String(row.badge),
      summary: String(row.summary),
      gallery: galleriesRes.rows
        .filter(g => normalizeNumber(g.product_id) === normalizeNumber(row.id))
        .map(g => ({
          id: String(g.id),
          image: String(g.image),
          title: String(g.title),
          caption: String(g.caption),
          objectPosition: String(g.object_position),
          imageTransform: String(g.image_transform)
        })),
      tags: tagsRes.rows
        .filter(t => normalizeNumber(t.product_id) === normalizeNumber(row.id))
        .map(t => String(t.tag))
    }));
  });
}

export async function getProductsByIds(ids: number[]) {
  if (ids.length === 0) return [];
  const allProducts = await getProducts();
  return allProducts.filter(p => ids.includes(p.id));
}

export async function getCategories() {
  await initializeStore();
  return withClient(async (client) => {
    const res = await client.query('SELECT * FROM categories');
    return res.rows.map(row => ({
      name: String(row.name),
      caption: String(row.caption),
      skuCount: String(row.sku_count),
      icon: String(row.icon)
    }));
  });
}

export async function getSuppliers() {
  await initializeStore();
  return withClient(async (client) => {
    const res = await client.query('SELECT * FROM suppliers');
    return res.rows.map(row => ({
      name: String(row.name),
      specialty: String(row.specialty),
      score: String(row.score),
      fulfillment: String(row.fulfillment),
      markets: String(row.markets)
    }));
  });
}

export async function findOrderByReference(reference: string) {
  await initializeStore();
  const order = await withClient((client) => readOrderByReferenceWithClient(client, reference));
  return order ? clone(order) : null;
}

export async function createOrder(order: OrderRecord) {
  await initializeStore();

  const createdOrder = await runInTransaction(async (client) => {
    await insertOrder(client, order);
    return readOrderByReferenceWithClient(client, order.reference);
  });

  return createdOrder ? clone(createdOrder) : clone(order);
}

export async function claimPaidOrder(
  reference: string,
  payment: PaystackTransactionData,
): Promise<ClaimedPaidOrder> {
  await initializeStore();

  return runInTransaction(async (client) => {
    const order = await readOrderByReferenceWithClient(client, reference, true);

    if (!order) {
      return {
        order: null,
        claimed: { email: false, sms: false },
      };
    }

    validatePaymentForOrder(order, payment);
    order.status = 'paid';
    order.paidAt = payment.paid_at ?? order.paidAt ?? new Date().toISOString();
    order.paymentChannel = payment.channel ?? order.paymentChannel;
    order.paystackTransactionId = String(payment.id);
    order.updatedAt = new Date().toISOString();

    const claimed = {
      email: shouldClaimNotification(order.notificationStatus.email),
      sms: shouldClaimNotification(order.notificationStatus.sms),
    };

    if (claimed.email) {
      order.notificationStatus.email = 'processing';
    }

    if (claimed.sms) {
      order.notificationStatus.sms = 'processing';
    }

    await insertOrder(client, order);

    return {
      order: clone(order),
      claimed,
    };
  });
}

export async function updateNotificationStatus(
  reference: string,
  statuses: Partial<NotificationState>,
) {
  await initializeStore();

  return runInTransaction(async (client) => {
    const order = await readOrderByReferenceWithClient(client, reference, true);

    if (!order) {
      return null;
    }

    order.notificationStatus = {
      ...order.notificationStatus,
      ...statuses,
    };
    order.updatedAt = new Date().toISOString();

    await insertOrder(client, order);
    return clone(order);
  });
}

export async function queryDatabase(sql: string, values: unknown[] = []) {
  await initializeStore();
  return withClient(async client => (await client.query(sql, values)).rows);
}

const productColumns = new Set(['id', 'name', 'price', 'category', 'image', 'supplier', 'origin', 'moq', 'lead_time', 'rating', 'orders', 'badge', 'summary']);
export async function createProduct(values: Record<string, unknown>) {
  const keys = Object.keys(values);
  if (!keys.length || keys.some(key => !productColumns.has(key))) throw new Error('Invalid product fields.');
  const placeholders = keys.map((_, index) => '$' + (index + 1));
  const rows = await queryDatabase(`INSERT INTO products (${keys.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`, keys.map(key => values[key]));
  return rows[0];
}
export async function updateProduct(id: number, values: Record<string, unknown>) {
  const keys = Object.keys(values);
  if (!keys.length || keys.some(key => key === 'id' || !productColumns.has(key))) throw new Error('Invalid product fields.');
  const assignments = keys.map((key, index) => key + '=$' + (index + 2));
  const rows = await queryDatabase(`UPDATE products SET ${assignments.join(',')} WHERE id=$1 RETURNING *`, [id, ...keys.map(key => values[key])]);
  return rows[0] || null;
}
export async function deleteProduct(id: number) {
  await queryDatabase('DELETE FROM products WHERE id=$1', [id]);
}
export async function migrateDatabaseSchema() {
  const connectionString = process.env.MIGRATION_DATABASE_URL;
  if (!connectionString) throw new Error('MIGRATION_DATABASE_URL is required for schema changes.');
  const migrationPool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 5000 });
  const client = await migrationPool.connect();
  try {
    await client.query('BEGIN');
    await createSchema(client);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); await migrationPool.end(); }
}
