/* The one and only serverless function.
   vercel.json funnels every /api/* path here, so the deployment stays at a
   single function (Hobby plans cap them at 12) while lib/api.mjs keeps doing
   the routing for both this and server.mjs. */
export { default } from '../lib/api.mjs';
