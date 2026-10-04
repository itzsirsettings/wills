import { useState, useCallback } from 'react';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  maxRetries?: number;
  retryDelay?: number;
}

export interface UseApiResult<T, Args extends unknown[]> {
  execute: (...args: Args) => Promise<T | null>;
  isLoading: boolean;
  error: ApiError | null;
  data: T | null;
  retryCount: number;
  reset: () => void;
}

export function useApi<T, Args extends unknown[] = unknown[]>(
  fetchFn: (...args: Args) => Promise<T>,
  options: UseApiOptions<T> = {},
): UseApiResult<T, Args> {
  const { onSuccess, onError, maxRetries = 3, retryDelay = 1000 } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setRetryCount(0);
  }, []);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      let lastError: ApiError = { message: 'An unexpected error occurred' };
      let attempts = 0;

      while (attempts <= maxRetries) {
        try {
          const result = await fetchFn(...args);

          setData(result);
          setIsLoading(false);

          if (attempts > 0) {
            setRetryCount(attempts);
          }

          if (onSuccess) {
            onSuccess(result);
          }

          return result;
        } catch (err) {
          lastError = parseError(err);
          attempts++;

          if (attempts <= maxRetries && isRetryableError(lastError)) {
            setRetryCount(attempts);
            await sleep(retryDelay * attempts);
            continue;
          }

          break;
        }
      }

      const finalError = {
        ...lastError,
        message: getUserFriendlyMessage(lastError),
      };

      setError(finalError);
      setIsLoading(false);

      if (onError) {
        onError(finalError);
      }

      return null;
    },
    [fetchFn, maxRetries, retryDelay, onSuccess, onError],
  );

  return {
    execute,
    isLoading,
    error,
    data,
    retryCount,
    reset,
  };
}

function parseError(err: unknown): ApiError {
  if (err instanceof Error) {
    return {
      message: err.message,
      code: err.name,
    };
  }

  if (typeof err === 'object' && err !== null) {
    const errorObj = err as Record<string, unknown>;
    return {
      message: (errorObj.message as string) || 'An unexpected error occurred',
      status: errorObj.status as number | undefined,
      code: errorObj.code as string | undefined,
    };
  }

  return { message: 'An unexpected error occurred' };
}

function isRetryableError(error: ApiError): boolean {
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  return error.status !== undefined && retryableStatusCodes.includes(error.status);
}

function getUserFriendlyMessage(error: ApiError): string {
  const errorMessages: Record<string, string> = {
    'Your cart is empty.': 'Please add items to your cart before checking out.',
    'We could not find that order.': 'We couldn\'t find an order with that reference. Please check and try again.',
    'Enter a valid email address.': 'Please enter a valid email address.',
    'Full name is required.': 'Please enter your full name.',
    'Phone number is required.': 'Please enter a valid phone number.',
    'Delivery address is required.': 'Please enter your delivery address.',
    'Your payment has not been confirmed yet.': 'Your payment is still being processed. Please wait a moment and try again.',
    'The checkout details are invalid.': 'Please check your order details and try again.',
    'Unable to start checkout right now.': 'We\'re having trouble starting checkout. Please try again in a moment.',
  };

  if (error.status === 0 || error.message.includes('network')) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }

  if (error.status === 429) {
    return 'Too many requests. Please wait a moment before trying again.';
  }

  if (error.status === 500) {
    return 'Something went wrong on our end. Please try again later.';
  }

  return errorMessages[error.message] || error.message;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useCheckoutApi<T>(options?: UseApiOptions<T>) {
  const { execute, isLoading, error, data, retryCount, reset } = useApi<T, [string]>(
    async (reference: string) => {
      const response = await fetch(`/api/checkout/verify/${encodeURIComponent(reference)}`, {
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw {
          message: payload.message || 'We could not verify your payment.',
          status: response.status,
        };
      }

      const payload = await response.json();
      return payload.order as T;
    },
    options,
  );

  return { execute, isLoading, error, data, retryCount, reset };
}

export function useCartApi<T>(options?: UseApiOptions<T>) {
  const { execute, isLoading, error, data, retryCount, reset } = useApi<T, [FormData]>(
    async (formData: FormData) => {
      const response = await fetch('/api/checkout/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw {
          message: payload.message || 'Unable to start checkout.',
          status: response.status,
        };
      }

      return response.json() as T;
    },
    options,
  );

  return { execute, isLoading, error, data, retryCount, reset };
}