/* Every /api/* route. Used by server.mjs locally and by api/[...path].mjs on
   Vercel, so both environments run exactly the same code. */

import { randomUUID } from 'node:crypto';
import { sql } from './db.mjs';
import { LADDER, rungFor, PROBLEMS, SAMPLE, byNumber, searchProblems } from './catalogue.mjs';
import { PATTERN_FAMILIES, MAX_PATTERNS, cleanPatterns, patternsForProblem } from './patterns.mjs';
import { isAdminEmail, adminConfigured, touchUser, overview, listFeedback } from './admin.mjs';
import {
  createSession, sessionCookie, clearedCookie, oauthCookie, clearedOauthCookie,
  currentUserId, createUser, findUserByEmail, verifyPassword, normaliseEmail, parseCookies
} from './auth.mjs';
import {
  googleConfigured, authUrl, newState, exchangeCode, readIdToken, upsertGoogleUser
} from './google.mjs';

const send = (response, status, body, headers = {}) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  response.end(JSON.stringify(body));
};

const redirect = (response, location, headers = {}) => {
  response.writeHead(302, { Location: location, ...headers });
  response.end();
};

/* Vercel's runtime may have already parsed the body; locally it is still a stream. */
async function readBody(request) {
  if (request.body && typeof request.body === 'object') return request.body;
  if (typeof request.body === 'string') {
    try { return JSON.parse(request.body); } catch { return {}; }
  }

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return {}; }
}

/* Everything the browser needs about one question, in one shape. */
const QUESTION_COLUMNS = `
  q.id, p.leetcode_number, p.title, p.slug, p.difficulty, p.topic,
  q.key_insight, q.notes, q.time_complexity, q.space_complexity,
  q.interval_days, q.review_count, q.last_reviewed_at, q.next_review_at, q.created_at,
  q.patterns`;

const oneQuestion = id => sql.query(
  `select ${QUESTION_COLUMNS} from questions q join problems p on p.id = q.problem_id where q.id = $1`,
  [id]
).then(rows => rows.map(row => ({
  ...row,
  availablePatterns: patternsForProblem(row)
})));

export default async function api(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  /* On Vercel every /api/* path is rewritten into the single function and the
     original path arrives as __path, because one function keeps the deployment
     under the Hobby plan's limit. Locally the pathname is already correct. */
  const rewritten = url.searchParams.get('__path');
  const path = rewritten ? `/api/${rewritten.replace(/^\/+/, '')}` : url.pathname;
  const method = request.method;

  try {
    /* ---------- auth ---------- */

    if (path === '/api/auth/signup' && method === 'POST') {
      const { email, password, name } = await readBody(request);
      const address = normaliseEmail(email);

      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address)) {
        return send(response, 400, { error: 'Enter a valid email address.' });
      }
      if (String(password || '').length < 8) {
        return send(response, 400, { error: 'Password must be at least 8 characters.' });
      }

      const user = await createUser(address, password, name);
      if (!user) return send(response, 409, { error: 'That email already has an account. Sign in instead.' });

      return send(response, 201, { user: { id: user.id, email: user.email, name: user.name } },
        { 'Set-Cookie': sessionCookie(createSession(user.id)) });
    }

    if (path === '/api/auth/login' && method === 'POST') {
      const { email, password } = await readBody(request);
      const user = await findUserByEmail(normaliseEmail(email));
      const ok = user && await verifyPassword(String(password || ''), user.password_hash);

      /* Same message either way, so this cannot be used to discover who has an account. */
      if (!ok) return send(response, 401, { error: 'Email or password is incorrect.' });

      return send(response, 200, { user: { id: user.id, email: user.email, name: user.name } },
        { 'Set-Cookie': sessionCookie(createSession(user.id)) });
    }

    if (path === '/api/auth/logout' && method === 'POST') {
      return send(response, 200, { ok: true }, { 'Set-Cookie': clearedCookie() });
    }

    if (path === '/api/auth/me' && method === 'GET') {
      const userId = currentUserId(request);
      if (!userId) return send(response, 401, { error: 'Not signed in.' });
      const rows = await sql.query('select id, email, name from users where id = $1', [userId]);
      if (!rows[0]) return send(response, 401, { error: 'Not signed in.' }, { 'Set-Cookie': clearedCookie() });

      /* Cheap enough to record on the one call every page load already makes. */
      await touchUser(userId, request);

      return send(response, 200, { user: { ...rows[0], isAdmin: isAdminEmail(rows[0].email) } });
    }

    /* Lets the login page show the Google button only when it will actually work. */
    if (path === '/api/auth/config' && method === 'GET') {
      return send(response, 200, { google: googleConfigured() });
    }

    /* Deploy smoke test. Reports whether configuration arrived, never its values.
       If this does not return JSON, something is sitting in front of the API. */
    if (path === '/api/health' && method === 'GET') {
      return send(response, 200, {
        ok: true,
        database: Boolean(process.env.DATABASE_URL),
        authSecret: Boolean(process.env.AUTH_SECRET),
        google: googleConfigured(),
        admin: adminConfigured()
      });
    }

    if (path === '/api/auth/google' && method === 'GET') {
      if (!googleConfigured()) return send(response, 503, { error: 'Google sign-in is not configured.' });

      const state = newState();
      /* Short-lived, so a stray callback cannot be replayed later. */
      return redirect(response, authUrl(state, request), { 'Set-Cookie': oauthCookie(state) });
    }

    if (path === '/api/auth/google/callback' && method === 'GET') {
      const expected = parseCookies(request.headers.cookie).lit_sheet_oauth;
      const state = url.searchParams.get('state');
      const code = url.searchParams.get('code');

      const fail = reason => redirect(response, `/?error=${encodeURIComponent(reason)}`,
        { 'Set-Cookie': clearedOauthCookie() });

      if (url.searchParams.get('error')) return fail('Google sign-in was cancelled.');
      /* No state, or one that does not match what we issued, means this callback
         did not start from our login page. */
      if (!code || !state || !expected || state !== expected) {
        return fail('Google sign-in expired. Try again.');
      }

      try {
        const user = await upsertGoogleUser(readIdToken(await exchangeCode(code, request)));
        return redirect(response, '/sheet.html', {
          'Set-Cookie': [sessionCookie(createSession(user.id)), clearedOauthCookie()]
        });
      } catch (problem) {
        /* `expected` marks a refusal we chose, not a fault worth logging. */
        if (!problem.expected) console.error('Google sign-in failed:', problem);
        return fail(problem.message || 'Google sign-in failed.');
      }
    }

    /* Catalogue metadata only. The 4,000 problems are far too big to hand over
       on every page load, so they are searched through the endpoint below. */
    if (path === '/api/problems' && method === 'GET') {
      return send(response, 200, {
        ladder: LADDER,
        patternFamilies: PATTERN_FAMILIES,
        maxPatterns: MAX_PATTERNS,
        problemCount: PROBLEMS.length
      });
    }

    if (path === '/api/problems/search' && method === 'GET') {
      return send(response, 200,
        { problems: searchProblems(url.searchParams.get('q') || '', 20).map(problem => ({
          ...problem,
          availablePatterns: patternsForProblem(problem)
        })) },
        /* The catalogue only changes when the importer is re-run. */
        { 'Cache-Control': 'public, max-age=3600' });
    }

    /* ---------- everything below needs an account ---------- */

    const userId = currentUserId(request);
    if (!userId) return send(response, 401, { error: 'Not signed in.' });

    if (path === '/api/questions' && method === 'GET') {
      const questions = await sql.query(
        `select ${QUESTION_COLUMNS} from questions q join problems p on p.id = q.problem_id
         where q.user_id = $1 order by q.next_review_at asc`,
        [userId]
      );
      return send(response, 200, {
        questions: questions.map(question => ({
          ...question,
          availablePatterns: patternsForProblem(question)
        }))
      });
    }

    if (path === '/api/questions' && method === 'POST') {
      const body = await readBody(request);
      const number = Number(body.number);
      const insight = String(body.insight || '').trim();
      const catalogued = byNumber(number);
      const title = String(body.title || catalogued?.title || '').trim();

      if (!Number.isInteger(number) || number < 1 || !title || !insight) {
        return send(response, 400, { error: 'Problem and key note are required.' });
      }

      const slug = String(body.slug || catalogued?.slug ||
        title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

      const problem = await sql.query(
        `insert into problems (id, leetcode_number, title, slug, difficulty, topic)
         values ($1, $2, $3, $4, $5, $6)
         on conflict (leetcode_number) do update set title = excluded.title
         returning id`,
        [randomUUID(), number, title, slug,
          String(body.difficulty || catalogued?.difficulty || 'Unrated'),
          String(body.topic || catalogued?.topic || 'General')]
      );

      const saved = await sql.query(
        `insert into questions (id, user_id, problem_id, key_insight, notes,
           time_complexity, space_complexity, patterns, next_review_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8::text[], now() + ($9::int * interval '1 day'))
         on conflict (user_id, problem_id) do update set
           key_insight = excluded.key_insight, notes = excluded.notes,
           time_complexity = excluded.time_complexity, space_complexity = excluded.space_complexity,
           patterns = excluded.patterns
         returning id`,
        [randomUUID(), userId, problem[0].id, insight, String(body.notes || ''),
          String(body.time || ''), String(body.space || ''),
          cleanPatterns(body.patterns), LADDER[0]]
      );

      return send(response, 201, { question: (await oneQuestion(saved[0].id))[0] });
    }

    const reviewMatch = path.match(/^\/api\/questions\/([0-9a-f-]{36})\/review$/i);
    if (reviewMatch && method === 'POST') {
      const { result } = await readBody(request);
      if (!['remembered', 'struggled', 'forgot'].includes(result)) {
        return send(response, 400, { error: 'Invalid review result.' });
      }

      const existing = await sql.query(
        'select id, interval_days from questions where id = $1 and user_id = $2',
        [reviewMatch[1], userId]
      );
      if (!existing[0]) return send(response, 404, { error: 'Question not found.' });

      const previous = existing[0].interval_days;
      const rung = rungFor(previous);
      const next = result === 'remembered' ? LADDER[Math.min(rung + 1, LADDER.length - 1)]
        : result === 'struggled' ? LADDER[Math.max(rung - 1, 0)]
        : LADDER[0];

      await sql.query(
        `update questions set interval_days = $1::int, review_count = review_count + 1,
           last_reviewed_at = now(), next_review_at = now() + ($1::int * interval '1 day')
         where id = $2`,
        [next, reviewMatch[1]]
      );
      await sql.query(
        `insert into reviews (id, question_id, result, previous_interval, new_interval)
         values ($1, $2, $3, $4, $5)`,
        [randomUUID(), reviewMatch[1], result, previous, next]
      );

      return send(response, 200, { question: (await oneQuestion(reviewMatch[1]))[0] });
    }

    const deleteMatch = path.match(/^\/api\/questions\/([0-9a-f-]{36})$/i);
    if (deleteMatch && method === 'DELETE') {
      const removed = await sql.query(
        'delete from questions where id = $1 and user_id = $2 returning id',
        [deleteMatch[1], userId]
      );
      if (!removed[0]) return send(response, 404, { error: 'Question not found.' });
      return send(response, 200, { id: removed[0].id });
    }

    /* ---------- feedback ---------- */

    if (path === '/api/feedback' && method === 'POST') {
      const body = await readBody(request);
      const message = String(body.message || '').trim();

      if (message.length < 3) return send(response, 400, { error: 'Write a little more first.' });
      if (message.length > 4000) return send(response, 400, { error: 'That is too long — 4000 characters max.' });

      await sql.query(
        'insert into feedback (id, user_id, message, page) values ($1, $2, $3, $4)',
        [randomUUID(), userId, message, String(body.page || '').slice(0, 120)]
      );
      return send(response, 201, { ok: true });
    }

    /* ---------- owner only ---------- */

    if (path.startsWith('/api/admin/')) {
      const rows = await sql.query('select email from users where id = $1', [userId]);
      /* Checked here, on the server, against the signed-in account. */
      if (!isAdminEmail(rows[0]?.email)) return send(response, 403, { error: 'Not allowed.' });

      if (path === '/api/admin/overview' && method === 'GET') {
        return send(response, 200, await overview());
      }

      if (path === '/api/admin/feedback' && method === 'GET') {
        return send(response, 200, { feedback: await listFeedback() });
      }

      const resolveMatch = path.match(/^\/api\/admin\/feedback\/([0-9a-f-]{36})\/resolve$/i);
      if (resolveMatch && method === 'POST') {
        const { resolved } = await readBody(request);
        await sql.query('update feedback set resolved = $2 where id = $1',
          [resolveMatch[1], resolved !== false]);
        return send(response, 200, { ok: true });
      }

      return send(response, 404, { error: 'No such endpoint.' });
    }

    if (path === '/api/seed' && method === 'POST') {
      const count = await sql.query(
        'select count(*)::int as count from questions where user_id = $1', [userId]
      );
      if (count[0].count > 0) return send(response, 409, { error: 'Your sheet already has questions.' });

      for (const row of SAMPLE) {
        const problem = byNumber(row.number);
        if (!problem) continue;

        const stored = await sql.query(
          `insert into problems (id, leetcode_number, title, slug, difficulty, topic)
           values ($1, $2, $3, $4, $5, $6)
           on conflict (leetcode_number) do update set title = excluded.title
           returning id`,
          [randomUUID(), problem.number, problem.title, problem.slug, problem.difficulty, problem.topic]
        );

        await sql.query(
          `insert into questions (id, user_id, problem_id, key_insight, notes,
             time_complexity, space_complexity, interval_days, review_count,
             next_review_at, created_at)
           values ($1, $2, $3, $4, '', $5, $6, $7::int, $8::int,
                   now() + ($9::int * interval '1 day'), now() - ($10::int * interval '1 day'))
           on conflict (user_id, problem_id) do nothing`,
          [randomUUID(), userId, stored[0].id, row.insight, row.time, row.space,
            LADDER[row.rung], row.rung + 1, row.due, row.solved]
        );
      }
      return send(response, 201, { seeded: SAMPLE.length });
    }

    return send(response, 404, { error: 'No such endpoint.' });
  } catch (error) {
    console.error(`${method} ${path} failed:`, error);
    return send(response, 500, { error: 'Something went wrong on the server.' });
  }
}
