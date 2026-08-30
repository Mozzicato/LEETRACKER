/* Local development server.
   On Vercel this file is not used: public/ is served by the CDN and
   api/[...path].mjs handles /api/*. Both run the same lib/api.mjs. */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import api from './lib/api.mjs';

const PORT = Number(process.env.PORT || 5173);

/* fileURLToPath decodes %20 and fixes the Windows drive letter — a plain
   pathname does neither, which breaks any project folder containing a space. */
const PUBLIC = fileURLToPath(new URL('./public/', import.meta.url));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

async function serveStatic(pathname, response) {
  const wanted = pathname === '/' ? 'index.html' : pathname;
  const relative = normalize(wanted).replace(/^([/\\])+/, '');

  /* normalize() has already collapsed any ../ segments; this refuses what is left. */
  if (relative.includes('..')) {
    response.writeHead(400, { 'Content-Type': 'text/plain' });
    return response.end('Bad path');
  }

  try {
    const file = await readFile(join(PUBLIC, relative));
    response.writeHead(200, {
      'Content-Type': TYPES[extname(relative)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    response.end(file);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('Not found');
  }
}

createServer((request, response) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);
  return pathname.startsWith('/api/')
    ? api(request, response)
    : serveStatic(pathname, response);
}).listen(PORT, () => console.log(`Lit-Sheet running at http://localhost:${PORT}`));
