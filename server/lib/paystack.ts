import { createHmac, timingSafeEqual } from 'node:crypto';
import type { PaystackTransactionData } from './types.js';

interface PaystackApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface InitializeTransactionResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface InitializeTransactionInput {
  amountInKobo: number;
  email: string;
  reference: string;
  metadata: Record<string, unknown>;
  callbackUrl?: string;
}

const PAYSTACK_API_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_PLACEHOLDER_SECRET_KEY = 'sk_test_your_paystack_secret_key';

function isLocalHost(hostname: string) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1'
  );
}

function isPlaceholderSecretKey(secretKey: string) {
  return (
    secretKey === PAYSTACK_PLACEHOLDER_SECRET_KEY ||
    secretKey.includes('your_paystack_secret_key')
  );
}

function isLocalPreviewSite() {
  try {
    const configuredUrl =
      process.env.PUBLIC_SITE_URL?.trim() || 'http://localhost:5173';
    const parsedUrl = new URL(configuredUrl);
    return isLocalHost(parsedUrl.hostname);
  } catch {
    return false;
  }
}

export function isPaystackDemoMode() {
  if (process.env.NODE_ENV === 'production') return false;
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  return isLocalPreviewSite() && (!secretKey || isPlaceholderSecretKey(secretKey));
}

function getPaystackSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();

  if (!secretKey) {
    if (isPaystackDemoMode()) {
      return '';
    }

    throw new Error(
      'PAYSTACK_SECRET_KEY is missing. Add it to your environment before starting the checkout server.',
    );
  }

  if (isPlaceholderSecretKey(secretKey) && !isPaystackDemoMode()) {
    throw new Error(
      'PAYSTACK_SECRET_KEY is still using the example placeholder value. Replace it with a real Paystack secret key.',
    );
  }

  return secretKey;
}

function getDefaultCallbackUrl() {
  const configuredUrl = process.env.PUBLIC_SITE_URL?.trim() || 'http://localhost:5173';
  return new URL('/store', configuredUrl).toString();
}

async function paystackRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<PaystackApiResponse<T>> {
  const response = await fetch(`${PAYSTACK_API_BASE_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    signal: init?.signal || AbortSignal.timeout(10000),
  });

  const payload = (await response.json()) as PaystackApiResponse<T>;

  if (!response.ok || !payload.status) {
    throw new Error(payload.message || 'Paystack request failed.');
  }

  return payload;
}

function createDemoAuthorizationUrl(reference: string, callbackUrl?: string) {
  const redirectUrl = new URL(callbackUrl || getDefaultCallbackUrl());
  redirectUrl.searchParams.set('reference', reference);
  return redirectUrl.toString();
}

export function createDemoPaystackTransaction(input: {
  amountInKobo: number;
  currency: string;
  reference: string;
}): PaystackTransactionData {
  return {
    id: Date.now(),
    reference: input.reference,
    status: 'success',
    amount: input.amountInKobo,
    currency: input.currency,
    channel: 'Local demo checkout',
    paid_at: new Date().toISOString(),
    gateway_response: 'Demo payment completed locally.',
    metadata: {
      mode: 'demo',
    },
  };
}

export async function initializePaystackTransaction(
  input: InitializeTransactionInput,
) {
  if (isPaystackDemoMode()) {
    return {
      authorization_url: createDemoAuthorizationUrl(
        input.reference,
        input.callbackUrl,
      ),
      access_code: `demo_${input.reference}`,
      reference: input.reference,
    };
  }

  const response = await paystackRequest<InitializeTransactionResponse>(
    '/transaction/initialize',
    {
      method: 'POST',
      body: JSON.stringify({
        amount: String(input.amountInKobo),
        email: input.email,
        reference: input.reference,
        currency: 'NGN',
        callback_url: input.callbackUrl || getDefaultCallbackUrl(),
        metadata: JSON.stringify(input.metadata),
      }),
    },
  );

  return response.data;
}

export async function verifyPaystackTransaction(reference: string) {
  if (isPaystackDemoMode()) {
    throw new Error(
      'Demo checkout verification must be resolved from stored order data.',
    );
  }

  const encodedReference = encodeURIComponent(reference);
  const response = await paystackRequest<PaystackTransactionData>(
    `/transaction/verify/${encodedReference}`,
  );

  return response.data;
}

export function isValidPaystackSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
) {
  if (!signatureHeader || !/^[a-f0-9]{128}$/i.test(signatureHeader.trim())) {
    return false;
  }

  const expectedSignature = createHmac('sha512', getPaystackSecretKey())
    .update(rawBody)
    .digest('hex');

  const receivedSignature = signatureHeader.trim();

  if (expectedSignature.length !== receivedSignature.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(expectedSignature, 'utf8'),
    Buffer.from(receivedSignature, 'utf8'),
  );
}
