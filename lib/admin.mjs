/* Owner-only reporting. Everything here is gated on ADMIN_EMAIL, checked on the
   server against the signed-in account — hiding the button in the UI is not a
   permission check. */

import { sql } from './db.mjs';

export const adminEmail = () => (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
export const adminConfigured = () => Boolean(adminEmail());

export const isAdminEmail = email =>
  adminConfigured() && String(email || '').trim().toLowerCase() === adminEmail();

/** Vercel puts the visitor's rough location on the request at the edge.
    Absent locally, which simply leaves the columns null. */
export function geoFrom(request) {
  const headers = request?.headers ?? {};
  const clean = value => {
    const text = decodeURIComponent(String(value || '')).trim();
    return text && text !== 'undefined' ? text.slice(0, 80) : null;
  };
  return {
    country: clean(headers['x-vercel-ip-country']),
    region: clean(headers['x-vercel-ip-country-region']),
    city: clean(headers['x-vercel-ip-city'])
  };
}

/** Records where and when someone was last seen. Never overwrites a known
    location with a null one, so a local sign-in does not wipe real data. */
export async function touchUser(userId, request) {
  const { country, region, city } = geoFrom(request);
  await sql.query(
    `update users set last_seen_at = now(),
       country = coalesce($2, country),
       region  = coalesce($3, region),
       city    = coalesce($4, city)
     where id = $1`,
    [userId, country, region, city]
  );
}

/** One round trip per block, rather than per statistic. */
export async function overview() {
  const [totals] = await sql.query(`
    select
      count(*)::int as users,
      count(*) filter (where created_at > now() - interval '7 days')::int  as new_this_week,
      count(*) filter (where created_at > now() - interval '30 days')::int as new_this_month,
      count(*) filter (where last_seen_at > now() - interval '7 days')::int as active_this_week,
      count(*) filter (where google_id is not null)::int as via_google,
      count(*) filter (where password_hash is not null)::int as via_password
    from users`);

  const [work] = await sql.query(`
    select
      (select count(*)::int from questions) as questions,
      (select count(*)::int from reviews)   as reviews,
      (select count(distinct user_id)::int from questions) as users_with_questions,
      (select count(*)::int from feedback where not resolved) as open_feedback`);

  const countries = await sql.query(`
    select coalesce(country, 'Unknown') as country, count(*)::int as users
    from users group by 1 order by users desc, country asc limit 12`);

  const patterns = await sql.query(`
    select pattern, count(*)::int as uses
    from questions, unnest(patterns) as pattern
    group by pattern order by uses desc, pattern asc limit 10`);

  const recent = await sql.query(`
    select u.email, u.name, u.created_at, u.last_seen_at, u.country, u.city,
           (u.google_id is not null) as google,
           (u.password_hash is not null) as password,
           (select count(*)::int from questions q where q.user_id = u.id) as questions
    from users u order by u.created_at desc limit 25`);

  return { totals, work, countries, patterns, recent };
}

export async function listFeedback() {
  return sql.query(`
    select f.id, f.message, f.page, f.resolved, f.created_at,
           u.email, u.country
    from feedback f join users u on u.id = f.user_id
    order by f.resolved asc, f.created_at desc
    limit 200`);
}
