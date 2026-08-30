import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

/** Reads .env.local once so `node server.mjs` works without any extra tooling. */
export async function loadEnv() {
  try {
    const file = await readFile('.env.local', 'utf8');
    for (const line of file.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*["']?(.*?)["']?\s*$/i);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
    }
  } catch {
    /* no .env.local — fall back to real environment variables */
  }
}

await loadEnv();

/* Locally, exit with something readable. On Vercel there is no console to read,
   and killing the process would take the whole function down, so throw instead. */
function require_(name, hint) {
  if (process.env[name]) return;
  const message = `${name} is missing. ${hint}`;
  if (process.env.VERCEL) throw new Error(message);
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

require_('DATABASE_URL', 'Put your Neon connection string in .env.local, then restart.');
require_('AUTH_SECRET', 'Add any long random string to .env.local.');

export const sql = neon(process.env.DATABASE_URL);
