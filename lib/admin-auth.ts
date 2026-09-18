import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function getAuthConfig() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_AUTH_SECRET;

  if (!username || !password || !secret) {
    throw new Error('Variáveis de autenticação administrativa não configuradas.');
  }

  return { username, password, secret };
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function validateAdminCredentials(username: string, password: string) {
  const config = getAuthConfig();
  return username === config.username && password === config.password;
}

export function createAdminSession(username: string) {
  const { secret } = getAuthConfig();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = `${username}.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function isValidAdminSession(token: string | undefined) {
  if (!token) return false;

  try {
    const { secret, username } = getAuthConfig();
    const [tokenUsername, expiresAt, signature] = token.split('.');
    const payload = `${tokenUsername}.${expiresAt}`;
    const expectedSignature = sign(payload, secret);

    if (!tokenUsername || tokenUsername !== username || !signature || Number(expiresAt) <= Math.floor(Date.now() / 1000)) {
      return false;
    }

    const provided = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);
    return provided.length === expected.length && timingSafeEqual(provided, expected);
  } catch {
    return false;
  }
}

export function getAdminSessionFromRequest(request: Request) {
  return request.headers.get('cookie')?.match(/(?:^|;\s*)admin_session=([^;]+)/)?.[1];
}

export { SESSION_DURATION_SECONDS };