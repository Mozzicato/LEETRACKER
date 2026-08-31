import { randomBytes, randomUUID } from 'node:crypto';
import { sql } from './db.mjs';

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

/** Where this app is reachable.
 *
 *  APP_URL wins when set, so the domain can be pinned. Otherwise it is derived
 *  from the request, which is what makes deploys work without configuring
 *  anything. A forged x-forwarded-host cannot be abused: Google only redirects
 *  to URIs registered on the OAuth client, so a bogus one is simply rejected. */
export function appUrl(request) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, '');

  const headers = request?.headers ?? {};
  const host = headers['x-forwarded-host'] || headers.host;
  if (!host) return 'http://localhost:5173';

  const protocol = headers['x-forwarded-proto'] || (process.env.VERCEL ? 'https' : 'http');
  return `${protocol}://${host}`;
}

export const redirectUri = request => `${appUrl(request)}/api/auth/google/callback`;

/** Google sign-in only appears in the UI once both values are configured. */
export const googleConfigured = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const newState = () => randomBytes(16).toString('hex');

export function authUrl(state, request) {
  const parameters = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(request),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account'
  });
  return `${AUTH_ENDPOINT}?${parameters}`;
}

/** Swap the one-time code for tokens. Runs server-to-server over TLS.
 *  The redirect_uri must match the one sent to Google exactly, so the same
 *  request is used to derive it. */
export async function exchangeCode(code, request) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri(request),
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

/** Find the account for this Google identity, creating one when it is new.
 *
 *  Deliberately refuses to merge with an existing password account. Password
 *  signup does not verify addresses, so anyone could register someone else's
 *  Gmail first and be handed their account here. Adopting an account that has
 *  no password set is safe: nobody can be signing in to it. */
export async function upsertGoogleUser({ googleId, email, name }) {
  const byGoogle = await sql.query('select id, email, name from users where google_id = $1', [googleId]);
  if (byGoogle[0]) return byGoogle[0];

  const byEmail = await sql.query(
    'select id, email, name, password_hash from users where email = $1', [email]
  );

  if (byEmail[0]) {
    if (byEmail[0].password_hash) {
      const refusal = new Error('That email already has a password account. Sign in with your password instead.');
      refusal.expected = true;
      throw refusal;
    }

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
