/* Vercel catch-all for every /api/* request. The routing itself lives in
   lib/api.mjs so local and deployed behaviour cannot drift apart. */
export { default } from '../lib/api.mjs';
