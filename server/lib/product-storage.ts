import { randomUUID } from 'node:crypto';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

export async function sanitizeProductImage(input: Buffer) {
  if (input.length > 2 * 1024 * 1024) throw new Error('Image must be 2MB or smaller.');
  const image = sharp(input, { limitInputPixels: 16_000_000, failOn: 'warning', animated: false });
  const metadata = await image.metadata();
  if (!['jpeg', 'png', 'webp'].includes(metadata.format || '') || (metadata.pages || 1) > 1) throw new Error('Unsupported image content.');
  const output = await image.rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  if (output.length > 2 * 1024 * 1024) throw new Error('Processed image exceeds the size limit.');
  return output;
}

function getStorageClient() {
  const endpoint = process.env.AWS_ENDPOINT_URL;
  if (!endpoint || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) throw new Error('Railway storage is not configured.');
  const parsed = new URL(endpoint);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('Storage endpoint must use HTTPS.');
  return new S3Client({
    endpoint, region: process.env.AWS_DEFAULT_REGION || 'auto', forcePathStyle: true, maxAttempts: 2,
    credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY },
  });
}

export async function storeProductImage(input: Buffer) {
  const image = await sanitizeProductImage(input);
  const id = `${randomUUID()}.webp`;
  const client = getStorageClient();
  try {
    await client.send(new PutObjectCommand({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key: `products/${id}`, Body: image, ContentType: 'image/webp' }), { abortSignal: AbortSignal.timeout(10_000) });
    return `/api/media/products/${id}`;
  } finally { client.destroy(); }
}

export async function readProductImage(id: string) {
  if (!/^[a-f0-9-]{36}\.webp$/.test(id)) throw new Error('Invalid image identifier.');
  const client = getStorageClient();
  try {
    const response = await client.send(new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key: `products/${id}` }), { abortSignal: AbortSignal.timeout(10_000) });
    if (!response.Body || (response.ContentLength || 0) > 2 * 1024 * 1024) throw new Error('Stored image unavailable.');
    const chunks: Buffer[] = [];
    let length = 0;
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      length += chunk.length;
      if (length > 2 * 1024 * 1024) throw new Error('Stored image exceeds the size limit.');
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks, length);
  } finally { client.destroy(); }
}
