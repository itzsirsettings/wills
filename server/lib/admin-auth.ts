import { createRemoteJWKSet, jwtVerify } from 'jose';

export interface AdminIdentity { id: string; email: string; role: 'admin' }
export class AdminAccessError extends Error {}
let keySet: ReturnType<typeof createRemoteJWKSet> | undefined;
let keySetUrl = '';

export async function authenticateAdmin(token: string): Promise<AdminIdentity | null> {
  const issuer = process.env.ADMIN_OIDC_ISSUER;
  const audience = process.env.ADMIN_OIDC_AUDIENCE;
  const jwks = process.env.ADMIN_OIDC_JWKS_URL;
  if (!issuer || !audience || !jwks || token.length > 8192) return null;
  const url = new URL(jwks);
  if (url.protocol !== 'https:' || url.username || url.password) return null;
  if (!keySet || keySetUrl !== jwks) {
    keySet = createRemoteJWKSet(url, { timeoutDuration: 5000, cooldownDuration: 30_000 });
    keySetUrl = jwks;
  }
  const { payload } = await jwtVerify(token, keySet, {
    issuer, audience, algorithms: ['RS256', 'ES256'], maxTokenAge: '15m',
    requiredClaims: ['sub', 'exp', 'iat'],
  });
  const approvedSubjects = new Set((process.env.ADMIN_SUBJECTS || '').split(',').map(value => value.trim()).filter(Boolean));
  if (!payload.sub || !approvedSubjects.has(payload.sub)) throw new AdminAccessError('Admin privileges are required.');
  const amr = payload.amr;
  const approvedAcr = process.env.ADMIN_MFA_ACR;
  if (!(Array.isArray(amr) && amr.includes('mfa')) && !(approvedAcr && payload.acr === approvedAcr)) {
    throw new AdminAccessError('Multi-factor authentication is required for admin access.');
  }
  return { id: payload.sub, email: typeof payload.email === 'string' ? payload.email : '', role: 'admin' };
}
