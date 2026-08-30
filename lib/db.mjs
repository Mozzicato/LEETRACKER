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

if (!process.env.DATABASE_URL) {
  console.error('\n  DATABASE_URL is missing.\n  Put your Neon connection string in .env.local, then restart.\n');
  process.exit(1);
}

if (!process.env.AUTH_SECRET) {
  console.error('\n  AUTH_SECRET is missing. Add any long random string to .env.local.\n');
  process.exit(1);
}

export const sql = neon(process.env.DATABASE_URL);
