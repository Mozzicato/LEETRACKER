import { randomBytes, randomUUID } from 'node:crypto';
import { sql } from './db.mjs';

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

export const appUrl = () => (process.env.APP_URL || 'http://localhost:5173').replace(/\/+$/, '');
export const redirectUri = () => `${appUrl()}/api/auth/google/callback`;

/** Google sign-in only appears in the UI once both values are configured. */
export const googleConfigured = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const newState = () => randomBytes(16).toString('hex');

export function authUrl(state) {
  const parameters = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account'
  });
  return `${AUTH_ENDPOINT}?${parameters}`;
}

/** Swap the one-time code for tokens. Runs server-to-server over TLS. */
export async function exchangeCode(code) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri(),
      grant_type: 'authorization_code'
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id_token) {
    throw new Error(data.error_description || data.error || 'Google rejected the sign-in.');
  }
  return data.id_token;
}

/* The id_token came straight from Google's token endpoint over TLS in exchange
   for our client secret, so the payload can be trusted without re-verifying the
   signature. (A token accepted from the browser would have to be verified.) */
export function readIdToken(idToken) {
  const payload = idToken.split('.')[1];
  if (!payload) throw new Error('Google returned a malformed token.');

  const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (!claims.email) throw new Error('Google did not share an email address.');
  if (claims.email_verified === false) throw new Error('That Google email is not verified.');

  return { googleId: claims.sub, email: String(claims.email).toLowerCase(), name: claims.name || null };
}

/** Find the account for this Google identity, creating or linking as needed. */
export async function upsertGoogleUser({ googleId, email, name }) {
  const byGoogle = await sql.query('select id, email, name from users where google_id = $1', [googleId]);
  if (byGoogle[0]) return byGoogle[0];

  const byEmail = await sql.query('select id, email, name from users where email = $1', [email]);
  if (byEmail[0]) {
    await sql.query(
      'update users set google_id = $1, name = coalesce(name, $2) where id = $3',
      [googleId, name, byEmail[0].id]
    );
    return byEmail[0];
  }

  const created = await sql.query(
    `insert into users (id, email, name, google_id) values ($1, $2, $3, $4)
     returning id, email, name`,
    [randomUUID(), email, name, googleId]
  );
  return created[0];
}
