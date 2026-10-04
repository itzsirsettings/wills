import pino from 'pino';
import { randomBytes } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

const isDevelopment = process.env.NODE_ENV !== 'production';
const isTest = process.env.NODE_ENV === 'test';

const loggerConfig = {
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname,req.id,responseTime',
      },
    },
  }),
  ...(isTest && {
    level: 'silent',
  }),
};

export const logger = pino(loggerConfig);

export function createRequestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || randomBytes(4).toString('hex');
  (req as Request & { id: string }).id = requestId;

  const startTime = Date.now();

  res.on('finish', () => {
    const logData = {
      req: {
        id: requestId,
        method: req.method,
        url: req.url,
        headers: {
          'user-agent': req.headers['user-agent'],
          'x-forwarded-for': req.headers['x-forwarded-for'],
        },
        remoteAddress: req.ip,
      },
      res: {
        statusCode: res.statusCode,
      },
      responseTime: Date.now() - startTime,
    };

    if (res.statusCode >= 500) {
      logger.error(logData);
    } else if (res.statusCode >= 400) {
      logger.warn(logData);
    } else {
      logger.info(logData);
    }
  });

  next();
}

export function logApiRequest(logger: pino.Logger, req: Request) {
  return logger.child({
    req: {
      id: (req as Request & { id: string }).id,
      method: req.method,
      url: req.url,
     remoteAddress: req.ip,
    },
  });
}

export function logError(logger: pino.Logger, error: Error, context: Record<string, unknown> = {}) {
  const serializedError = {
    message: error.message,
    stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    name: error.name,
  };

  logger.error({
    error: serializedError,
    ...context,
  });
}

export function logSecurity(logger: pino.Logger, event: string, data: Record<string, unknown> = {}) {
  logger.warn({
    security: true,
    event,
    ...data,
  });
}

export function createChildLogger(logger: pino.Logger, context: Record<string, unknown>) {
  return logger.child(context);
}