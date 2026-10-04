import {
  claimPaidOrder as claimPaidOrderPostgres,
  createOrder as createOrderPostgres,
  findOrderByReference as findOrderByReferencePostgres,
  updateNotificationStatus as updateNotificationStatusPostgres,
  getProducts as getProductsPostgres,
  getProductsByIds as getProductsByIdsPostgres,
  getCategories as getCategoriesPostgres,
  getSuppliers as getSuppliersPostgres
} from './postgres-store.js';
import type {
  NotificationState,
  OrderRecord,
  PaystackTransactionData,
} from './types.js';
import { catalogById, catalogItems } from './catalog.js';

// Railway PostgreSQL is used only when the retained commerce API is enabled.

const legacyCatalogTerms = [
  'sofa',
  'bed',
  'refrigerator',
  'rug',
  'dining',
  'appliance',
  'living room',
  'bedroom',
];

function isLegacyCatalogItem(product: { name?: unknown; category?: unknown; summary?: unknown }) {
  const searchable = `${String(product.name ?? '')} ${String(product.category ?? '')} ${String(product.summary ?? '')}`.toLowerCase();
  return legacyCatalogTerms.some((term) => searchable.includes(term));
}

export async function findOrderByReference(reference: string) {
  return findOrderByReferencePostgres(reference);
}

export async function createOrder(order: OrderRecord) {
  return createOrderPostgres(order);
}

export async function claimPaidOrder(
  reference: string,
  payment: PaystackTransactionData,
) {
  return claimPaidOrderPostgres(reference, payment);
}

export async function updateNotificationStatus(
  reference: string,
  statuses: Partial<NotificationState>,
) {
  return updateNotificationStatusPostgres(reference, statuses);
}

export async function getProducts() {
  const products = await getProductsPostgres();

  if (!products || products.length === 0 || products.some((product) => isLegacyCatalogItem(product))) {
    return catalogItems;
  }

  return products;
}

export async function getProductsByIds(ids: number[]) {
  const products = await getProductsByIdsPostgres(ids);

  if (!products || products.length !== ids.length || products.some((product) => isLegacyCatalogItem(product))) {
    return ids
      .map((id) => catalogById.get(id))
      .filter((product): product is NonNullable<typeof product> => Boolean(product));
  }

  return products;
}

export async function getCategories() {
  return getCategoriesPostgres();
}

export async function getSuppliers() {
  return getSuppliersPostgres();
}
