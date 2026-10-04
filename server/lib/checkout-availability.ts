import type { RequestHandler } from 'express';

export function isCommerceEnabled() {
  return process.env.LEGACY_COMMERCE_ENABLED === 'true';
}

export const requireCommerceEnabled: RequestHandler = (_request, response, next) => {
  if (!isCommerceEnabled()) {
    response.setHeader('Cache-Control', 'no-store');
    response.status(503).json({
      code: 'COMMERCE_UNAVAILABLE',
      message: 'Online store services are currently unavailable. Please contact Wills on WhatsApp.',
    });
    return;
  }
  next();
};

// Checkout stays closed unless an operator explicitly reopens it.
export const requireCheckoutEnabled: RequestHandler = (_request, response, next) => {
  if (process.env.STORE_CHECKOUT_ENABLED !== 'true') {
    response.setHeader('Cache-Control', 'no-store');
    response.status(503).json({
      code: 'STORE_TEMPORARILY_CLOSED',
      message: 'The store is temporarily closed. New purchases and payments are unavailable.',
    });
    return;
  }

  next();
};
