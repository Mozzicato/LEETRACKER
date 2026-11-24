/* Build step (Vercel runs it, see vercel.json): stamps every local .js/.css the
   HTML pages load with a hash of that file's contents, e.g. /app.js?v=3f9a1c2b.

   vercel.json lets the browser cache a stamped file for a year without asking
   again, which matters on a slow or lossy connection where every revalidation
   costs a round trip. A deploy that changes a file changes its hash, so the
   (never cached) HTML points at a new URL and the browser fetches it fresh.
   Files that did not change keep their URL and stay cached across deploys.

   It rewrites public/ in the build environment only. Never commit its output;
   locally the pages keep their plain paths and nothing is stamped. */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url));
const ASSET = /(src|href)="\/([\w.-]+\.(?:js|css))"/g;

const hashes = new Map();
async function hashOf(name) {
  if (!hashes.has(name)) {
    const content = await readFile(join(PUBLIC, name));
    hashes.set(name, createHash('sha256').update(content).digest('hex').slice(0, 10));
  }
  return hashes.get(name);
}

let stamped = 0;
for (const page of (await readdir(PUBLIC)).filter(name => name.endsWith('.html'))) {
  const path = join(PUBLIC, page);
  const html = await readFile(path, 'utf8');

  const names = [...html.matchAll(ASSET)].map(match => match[2]);
  for (const name of names) await hashOf(name);

  const out = html.replace(ASSET, (_, attribute, name) => `${attribute}="/${name}?v=${hashes.get(name)}"`);
  await writeFile(path, out);
  stamped += names.length;
  console.log(`  ${page}: ${names.map(name => `${name}?v=${hashes.get(name)}`).join(', ') || 'nothing to stamp'}`);
}

/* An unstamped deploy would still work, just without the caching, but it
   would mean the pattern above stopped matching. Better to hear about it. */
if (!stamped) {
  console.error('stamp-assets: no local .js/.css references found in public/*.html');
  process.exit(1);
}
