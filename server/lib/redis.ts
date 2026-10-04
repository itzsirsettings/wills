import net from 'node:net';
import tls from 'node:tls';

export type RedisValue = string | number | null | RedisValue[];

interface ParsedRedisValue {
  nextOffset: number;
  value: RedisValue;
}

function encodeRedisCommand(parts: string[]) {
  return Buffer.from(
    `*${parts.length}\r\n${parts
      .map((part) => `$${Buffer.byteLength(part, 'utf8')}\r\n${part}\r\n`)
      .join('')}`,
    'utf8',
  );
}

function findLineEnd(buffer: Buffer, offset: number) {
  for (let index = offset; index < buffer.length - 1; index += 1) {
    if (buffer[index] === 13 && buffer[index + 1] === 10) {
      return index;
    }
  }

  return -1;
}

function parseRedisValue(buffer: Buffer, offset = 0): ParsedRedisValue | null {
  if (offset >= buffer.length) {
    return null;
  }

  const prefix = String.fromCharCode(buffer[offset]);
  const lineEnd = findLineEnd(buffer, offset + 1);

  if (lineEnd === -1) {
    return null;
  }

  const line = buffer.toString('utf8', offset + 1, lineEnd);
  const nextOffset = lineEnd + 2;

  switch (prefix) {
    case '+':
      return { nextOffset, value: line };
    case '-':
      throw new Error(`Redis error: ${line}`);
    case ':':
      return { nextOffset, value: Number(line) };
    case '$': {
      const length = Number(line);

      if (length === -1) {
        return { nextOffset, value: null };
      }

      const valueEnd = nextOffset + length;

      if (buffer.length < valueEnd + 2) {
        return null;
      }

      return {
        nextOffset: valueEnd + 2,
        value: buffer.toString('utf8', nextOffset, valueEnd),
      };
    }
    case '*': {
      const count = Number(line);

      if (count === -1) {
        return { nextOffset, value: null };
      }

      let cursor = nextOffset;
      const items: RedisValue[] = [];

      for (let index = 0; index < count; index += 1) {
        const parsed = parseRedisValue(buffer, cursor);

        if (!parsed) {
          return null;
        }

        items.push(parsed.value);
        cursor = parsed.nextOffset;
      }

      return { nextOffset: cursor, value: items };
    }
    default:
      throw new Error(`Unsupported Redis response prefix: ${prefix}`);
  }
}

class RedisSession {
  private buffer = Buffer.alloc(0);

  constructor(private readonly socket: net.Socket | tls.TLSSocket) {}

  async sendCommand(parts: string[]) {
    return new Promise<RedisValue>((resolve, reject) => {
      const handleData = (chunk: Buffer) => {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        tryResolve();
      };
      const handleError = (error: Error) => {
        cleanup();
        reject(error);
      };
      const handleClose = () => {
        cleanup();
        reject(new Error('Redis connection closed unexpectedly.'));
      };

      const cleanup = () => {
        this.socket.off('data', handleData);
        this.socket.off('error', handleError);
        this.socket.off('close', handleClose);
      };

      const tryResolve = () => {
        try {
          const parsed = parseRedisValue(this.buffer);

          if (!parsed) {
            return;
          }

          this.buffer = this.buffer.subarray(parsed.nextOffset);
          cleanup();
          resolve(parsed.value);
        } catch (error) {
          cleanup();
          reject(error instanceof Error ? error : new Error('Redis command failed.'));
        }
      };

      this.socket.on('data', handleData);
      this.socket.on('error', handleError);
      this.socket.on('close', handleClose);
      this.socket.write(encodeRedisCommand(parts), (error) => {
        if (error) {
          cleanup();
          reject(error);
          return;
        }

        tryResolve();
      });
    });
  }
}

async function createRedisSocket(redisUrl: URL, timeoutMs: number) {
  const port = Number(redisUrl.port || (redisUrl.protocol === 'rediss:' ? 6380 : 6379));
  const host = redisUrl.hostname;

  const socket = await new Promise<net.Socket | tls.TLSSocket>((resolve, reject) => {
    const handleError = (error: Error) => {
      reject(error);
    };

    const connection =
      redisUrl.protocol === 'rediss:'
        ? tls.connect({ host, port, servername: host })
        : net.createConnection({ host, port });

    connection.setTimeout(timeoutMs, () => {
      connection.destroy(new Error('Redis connection timed out.'));
    });
    connection.once('error', handleError);
    connection.once('connect', () => {
      connection.off('error', handleError);
      resolve(connection);
    });
  });

  socket.setNoDelay(true);
  return socket;
}

function getRedisDatabaseIndex(redisUrl: URL) {
  const path = redisUrl.pathname.replace(/^\//, '').trim();

  if (!path) {
    return 0;
  }

  const databaseIndex = Number(path);
  return Number.isFinite(databaseIndex) ? databaseIndex : 0;
}

export class RedisClient {
  constructor(
    private readonly redisUrl: string,
    private readonly timeoutMs: number = 3000,
  ) {}

  private async withSession<T>(handler: (session: RedisSession) => Promise<T>) {
    const url = new URL(this.redisUrl);
    const socket = await createRedisSocket(url, this.timeoutMs);
    const session = new RedisSession(socket);

    try {
      const password = decodeURIComponent(url.password || '');
      const username = decodeURIComponent(url.username || '');

      if (password) {
        const authArgs = username
          ? ['AUTH', username, password]
          : ['AUTH', password];
        await session.sendCommand(authArgs);
      }

      const databaseIndex = getRedisDatabaseIndex(url);

      if (databaseIndex > 0) {
        await session.sendCommand(['SELECT', String(databaseIndex)]);
      }

      return await handler(session);
    } finally {
      socket.end();
    }
  }

  async incrementWindow(key: string, windowMs: number) {
    const script = [
      "local current = redis.call('INCR', KEYS[1])",
      "if current == 1 then",
      "  redis.call('PEXPIRE', KEYS[1], ARGV[1])",
      'end',
      "local ttl = redis.call('PTTL', KEYS[1])",
      'return {current, ttl}',
    ].join('\n');

    const result = await this.withSession((session) =>
      session.sendCommand(['EVAL', script, '1', key, String(windowMs)]),
    );

    if (
      !Array.isArray(result) ||
      typeof result[0] !== 'number' ||
      typeof result[1] !== 'number'
    ) {
      throw new Error('Unexpected Redis response for rate limiting.');
    }

    return {
      count: result[0],
      resetAfterMs: Math.max(result[1], 0),
    };
  }
}
