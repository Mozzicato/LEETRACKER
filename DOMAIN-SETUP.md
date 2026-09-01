# Putting Lit-Sheet on `leetsheet.dev`

Everything needed to move the app from a `*.vercel.app` URL onto the real
domain, in the order it has to happen. Domain is registered at **Name.com**
(GitHub Student Pack), hosting is **Vercel**, database is **Neon**.

---

## Before you start: `.dev` is HTTPS-only

`.dev` is on the browsers' [HSTS preload list](https://hstspreload.org/). Every
major browser refuses plain `http://` for the entire TLD — there is no warning
page and no "proceed anyway" link.

Two practical consequences:

- Between DNS resolving and Vercel issuing the certificate, the site will look
  **completely broken**, not merely insecure. That is expected. Wait it out.
- `APP_URL` must always be `https://leetsheet.dev`. An `http://` value will
  break Google sign-in in a way that is annoying to diagnose.

---

## Step 1 — Add the domain in Vercel

1. Vercel → your project → **Settings → Domains**
2. Enter `leetsheet.dev` → **Add**
3. When it offers `www.leetsheet.dev`, add that too and leave it set to redirect
   to the apex. One canonical address means one Google callback to register.

Vercel now shows the DNS records it wants. **Those on-screen values win over
anything written here** — Vercel changes IPs occasionally.

---

## Step 2 — Point Name.com at Vercel

Two routes. Since this domain is only ever going to serve this app — no email,
no other subdomains — **route A is the one to take**.

### Route A — hand DNS to Vercel (recommended)

Name.com → `leetsheet.dev` → **Nameservers** → replace both with:

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

Vercel then manages all DNS and certificates. Nothing else to configure.

Trade-off: Name.com's DNS editor stops applying, so you cannot point `mail.` or
similar anywhere else. Not a concern here.

### Route B — keep DNS at Name.com

Leave the nameservers alone and add two records:

| Type | Host | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

Leave TTL at its default. Delete any parked-page or forwarding records Name.com
added for `@` and `www`, or they will fight these.

---

## Step 3 — Wait

Propagation takes minutes to a few hours. Vercel issues the TLS certificate on
its own once DNS resolves; there is nothing to click.

The domain is ready when Vercel's Domains page shows **Valid Configuration** and
this returns JSON:

```bash
curl -s https://leetsheet.dev/api/health
# {"ok":true,"database":true,"authSecret":true,"google":true}
```

While it is still settling you may see connection refused, a certificate error,
or the old Vercel URL. All normal. See [Troubleshooting](#troubleshooting).

---

## Step 4 — Pin `APP_URL`

Vercel → **Settings → Environment Variables**:

```
APP_URL = https://leetsheet.dev
```

No quotation marks, no trailing slash. Vercel stores the value literally, so
`"https://leetsheet.dev"` would include the quotes and break URL building.
(A `.env.local` file is different — quotes there are stripped on read.)

**Then redeploy.** Environment variables only apply to builds made after they
are set.

### Why this matters

Without `APP_URL`, the app derives its address from whichever host the request
arrived on. That is convenient with one domain and actively harmful with
several: arriving via `leetracker-nine.vercel.app` would send Google a
`redirect_uri` for *that* host, which is not registered, producing
`Error 400: redirect_uri_mismatch`.

Pinning `APP_URL` makes every Google sign-in use `https://leetsheet.dev`
regardless of which URL the visitor came in on, so exactly one callback needs
registering.

---

## Step 5 — Register the domain with Google

Google Cloud Console → **APIs & Services → Credentials** → the OAuth client the
app uses. Direct link:

```
https://console.cloud.google.com/apis/credentials/oauthclient/1062386952399-vbv0okvmm3ocn66jjo7fgr77ttq6up8u.apps.googleusercontent.com
```

Two boxes on that page, and they are easy to confuse:

| Box | Accepts a path? | Add this |
|---|---|---|
| Authorised **JavaScript origins** | no | `https://leetsheet.dev` |
| Authorised **redirect URIs** | yes | `https://leetsheet.dev/api/auth/google/callback` |

Keep the localhost entries so development still works:

```
http://localhost:5173
http://localhost:5173/api/auth/google/callback
```

The old `*.vercel.app` entries can be deleted once the domain works.

**Press Save.** The console does not warn about unsaved changes.

Google's own note says changes take *"a few minutes to a few hours"* to take
effect. A `redirect_uri_mismatch` immediately after saving usually means
propagation, not a mistake — verify the entry looks right, then wait and retry.

---

## Step 6 — Verify

```bash
# 1. DNS points at Vercel
nslookup leetsheet.dev

# 2. the app is served over HTTPS
curl -s -o /dev/null -w "%{http_code}\n" https://leetsheet.dev/

# 3. the API is alive and configured
curl -s https://leetsheet.dev/api/health

# 4. the redirect_uri the app sends — must match Google exactly
curl -s -o /dev/null -D - https://leetsheet.dev/api/auth/google \
  | grep -o "redirect_uri=[^&]*"
```

Expected from step 4:

```
redirect_uri=https%3A%2F%2Fleetsheet.dev%2Fapi%2Fauth%2Fgoogle%2Fcallback
```

If that decodes to anything other than `https://leetsheet.dev/api/auth/google/callback`,
`APP_URL` is wrong or the redeploy has not happened.

Then sign in with Google in a browser. Success ends on `/sheet.html` signed in.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Site unreachable, no certificate | DNS or cert still propagating | Wait. `.dev` has no bypass — this looks worse than it is |
| `Error 400: redirect_uri_mismatch` | The `redirect_uri` sent is not registered | Compare verification step 4 against the Console, character for character. No trailing slash |
| Sign-in fails *after* choosing an account | `GOOGLE_CLIENT_SECRET` in Vercel does not match the Console | Rotating the secret requires updating Vercel **and redeploying** |
| Google button missing | `/api/auth/config` unreachable or `google:false` | Check `/api/health`. HTML instead of JSON means something sits in front of the API |
| Everything 404s or redirects to `vercel.com/sso-api` | Deployment Protection is on | Settings → Deployment Protection → Vercel Authentication → Disabled |
| Pushes change nothing | The build is failing, so the previous build stays live | Check the commit status on GitHub, or Vercel's Deployments tab. Do not assume a push deployed |
| Build fails on function count | Hobby plans allow 12 serverless functions | This project deliberately uses **one** (`api/index.mjs`) with a rewrite in `vercel.json`. Do not split routes into separate files |
| Chrome "Dangerous site" | Safe Browsing flagging a login form on a throwaway `*.vercel.app` subdomain | The custom domain is the fix. If it follows you, report it at `safebrowsing.google.com/safebrowsing/report_error/` |

---

## After it works

- Update `README.md` and the repo's GitHub **About** with `https://leetsheet.dev`
- Delete the stale `*.vercel.app` redirect URIs from the OAuth client
- Rotate anything that has been pasted into a chat, screenshot, or issue:
  `GOOGLE_CLIENT_SECRET` (Console → Add secret, then delete the old),
  the Neon role password (Neon Console, then update `DATABASE_URL` in Vercel
  **and** `.env.local`), and `AUTH_SECRET` (any long random string; the only
  effect is that everyone is signed out)

---

## Environment variables, final state

| Variable | Value | Required |
|---|---|---|
| `DATABASE_URL` | Neon pooled connection string | yes |
| `AUTH_SECRET` | long random string | yes |
| `APP_URL` | `https://leetsheet.dev` | yes, once the domain is live |
| `GOOGLE_CLIENT_ID` | `…apps.googleusercontent.com` | only for Google sign-in |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-…` | only for Google sign-in |

Set them in Vercel without quotes, and **redeploy after any change**.
