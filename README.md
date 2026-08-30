# Lit-Sheet

*Because solved doesn't mean remembered.*

A spaced-repetition tracker for LeetCode problems. You write down the one thing
worth remembering about each problem you solve, and Lit-Sheet decides when to
ask you about it again — before you forget it.

## The idea

Every problem climbs a **mastery ladder**: `1 → 3 → 7 → 30 → 90` days. Remember
it and you move up a rung; struggle and you drop one; forget and you go back to
the bottom. Clear the top rung and the problem is **vaulted**.

Colour carries that state, so the sheet is readable at a glance:

```
Vaulted → Mastered → Strong → Steady → Slipping → Fading → Weak → Abandoned
 blue      deep green ............................................ deep red
```

Nothing else on the page competes for colour — a warm colour always means a
memory is decaying.

## Running it

```bash
npm install
cp .env.example .env.local     # then fill in the values below
npm run db:migrate
npm start                      # http://localhost:5173
```

### Environment

| Variable | Required | What it is |
|---|---|---|
| `DATABASE_URL` | yes | Neon pooled connection string |
| `AUTH_SECRET` | yes | Any long random string; signs session cookies |
| `GOOGLE_CLIENT_ID` | no | Google OAuth client. Omit to hide the Google button |
| `GOOGLE_CLIENT_SECRET` | no | " |
| `APP_URL` | no | Defaults to `http://localhost:5173` |

For Google sign-in, add `APP_URL + /api/auth/google/callback` as an authorised
redirect URI on the OAuth client, exactly.

## Layout

```
lib/api.mjs       every /api/* route — the single source of truth
lib/db.mjs        Neon connection, reads .env.local
lib/auth.mjs      scrypt passwords, HMAC-signed session cookie
lib/google.mjs    OAuth authorization-code flow
lib/catalogue.mjs problem list + demo sheet, served at /api/problems
server.mjs        local dev only: static files + delegates to lib/api.mjs
api/[...path].mjs Vercel entry point: delegates to lib/api.mjs
public/           login page (index.html) and the app (sheet.html)
db/schema.sql     applied by `npm run db:migrate` (idempotent)
```

One runtime dependency: `@neondatabase/serverless`. There is no build step.

## Deploying to Vercel

`public/` is served as static files and `api/[...path].mjs` becomes a serverless
function, so the same `lib/api.mjs` runs locally and in production.

1. Import the repo at **vercel.com/new**.
2. Add environment variables (Settings → Environment Variables):
   `DATABASE_URL`, `AUTH_SECRET`, and optionally `GOOGLE_CLIENT_ID` /
   `GOOGLE_CLIENT_SECRET`.
3. Deploy, then set `APP_URL` to the domain Vercel gives you
   (e.g. `https://leetracker.vercel.app`) and redeploy — Google's redirect URI
   is built from it.
4. For Google sign-in, add `https://your-domain/api/auth/google/callback` to the
   OAuth client's authorised redirect URIs. Google matches it exactly.

The schema lives in Neon, so there is nothing to migrate at deploy time. Run
`npm run db:migrate` locally whenever `db/schema.sql` changes.

Session cookies gain the `Secure` flag automatically when `VERCEL` is set or
`APP_URL` starts with `https:`.

## Security notes

Passwords are hashed with scrypt from Node's own crypto. Sessions are a signed
cookie (`userId.expiry.hmac`) verified with `timingSafeEqual`, so there is no
session table. Login returns the same error whether the email is unknown or the
password is wrong, so the form cannot be used to discover who has an account.
Every `/api/*` route below sign-in is scoped to the session's user.

**Known limitation: email addresses are not verified.** Anyone can sign up with
an address they do not own. Google sign-in therefore *refuses* to merge with an
existing password account, which stops someone pre-registering your address and
being handed your account. A passwordless row is safe to adopt, so those still
link. The proper fix is a verification email on password signup — free at this
scale via Gmail SMTP (~500/day) or Brevo (300/day).
