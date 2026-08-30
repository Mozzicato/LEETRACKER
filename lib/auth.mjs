import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHmac } from 'node:crypto';
import { promisify } from 'node:util';
import { sql } from './db.mjs';

const scryptAsync = promisify(scrypt);
const COOKIE = 'lit_sheet_session';
const THIRTY_DAYS = 60 * 60 * 24 * 30;

/* ---------- passwords ---------- */

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scryptAsync(password, salt, 64);
  return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const derived = await scryptAsync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  /* Length check first — timingSafeEqual throws on a mismatch. */
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

/* ---------- sessions (signed cookie, no session table needed) ---------- */

const sign = value => createHmac('sha256', process.env.AUTH_SECRET).update(value).digest('base64url');

export function createSession(userId) {
  const expires = Date.now() + THIRTY_DAYS * 1000;
  const body = `${userId}.${expires}`;
  return `${body}.${sign(body)}`;
}

export function readSession(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [userId, expires, signature] = parts;
  const expected = sign(`${userId}.${expires}`);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(expires) < Date.now()) return null;

  return userId;
}

/* Browsers reject Secure cookies over plain http, so only set it where the app
   is actually served over https (Vercel always is). */
const secure = () =>
  process.env.VERCEL || (process.env.APP_URL || '').startsWith('https:') ? '; Secure' : '';

export const sessionCookie = token =>
  `${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${THIRTY_DAYS}${secure()}`;

export const clearedCookie = () =>
  `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure()}`;

export const oauthCookie = state =>
  `lit_sheet_oauth=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600${secure()}`;

export const clearedOauthCookie = () =>
  `lit_sheet_oauth=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure()}`;

export function parseCookies(header = '') {
  return Object.fromEntries(
    header.split(';').map(part => {
      const index = part.indexOf('=');
      return index < 0 ? [part.trim(), ''] : [part.slice(0, index).trim(), part.slice(index + 1).trim()];
    }).filter(([key]) => key)
  );
}

/** The signed-in user's id, or null. */
export function currentUserId(request) {
  return readSession(parseCookies(request.headers.cookie).lit_sheet_session);
}

/* ---------- accounts ---------- */

export const normaliseEmail = email => String(email || '').trim().toLowerCase();

export async function createUser(email, password, name) {
  const id = randomUUID();
  const passwordHash = await hashPassword(password);
  const rows = await sql.query(
    `insert into users (id, email, name, password_hash) values ($1, $2, $3, $4)
     on conflict (email) do nothing
     returning id, email, name`,
    [id, email, name || null, passwordHash]
  );
  return rows[0] || null;
}

export async function findUserByEmail(email) {
  const rows = await sql.query(
    'select id, email, name, password_hash from users where email = $1', [email]
  );
  return rows[0] || null;
}
