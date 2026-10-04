import { z } from 'zod';
import type { OrderRecord, PaystackTransactionData } from './types.js';

export const successfulPaymentSchema = z.object({
  id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  reference: z.string().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/),
  status: z.literal('success'),
  amount: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  currency: z.string().length(3),
  channel: z.string().max(100).optional(),
  paid_at: z.string().max(64).nullish().transform(value => value || undefined),
});

export function validatePaymentForOrder(order: OrderRecord, payment: PaystackTransactionData) {
  const verified = successfulPaymentSchema.parse(payment);
  if (verified.reference !== order.reference || verified.amount !== order.amountInKobo || verified.currency !== order.currency) {
    throw new Error('Payment does not match the expected order.');
  }
  if (order.status === 'paid' && order.paystackTransactionId && order.paystackTransactionId !== String(verified.id)) {
    throw new Error('Order is already bound to another payment transaction.');
  }
  return verified;
}
