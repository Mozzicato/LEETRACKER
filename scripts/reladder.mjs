/* Moves stored review intervals onto the current LADDER.

   The rung a problem sits on is its interval_days, looked up in LADDER. Change
   the ladder and any interval that is no longer on it becomes an orphan — the
   app now rounds to the nearest rung so nothing breaks, but the stored number
   stays wrong, and the pips and the "1d › 3d › …" line read oddly until the
   next review rewrites it.

   This snaps every orphan to its nearest rung. Due dates are deliberately left
   alone: the rung changes, when you next see the problem does not.

   Run with `node scripts/reladder.mjs` (add --dry to only look). */

import { LADDER, rungFor } from '../lib/catalogue.mjs';
import { sql } from '../lib/db.mjs';

const dry = process.argv.includes('--dry');

const rows = await sql.query(
  `select interval_days as days, count(*)::int as total
     from questions group by interval_days order by interval_days`
);

if (!rows.length) {
  console.log('No questions stored yet — nothing to move.');
  process.exit(0);
}

console.log(`Ladder: ${LADDER.join(' → ')}\n`);

let moved = 0;
for (const { days, total } of rows) {
  const target = LADDER[rungFor(days)];
  if (target === days) {
    console.log(`  ${String(days).padStart(4)}d  ${String(total).padStart(4)} question(s)  already a rung`);
    continue;
  }
  console.log(`  ${String(days).padStart(4)}d  ${String(total).padStart(4)} question(s)  →  ${target}d  (rung ${rungFor(days) + 1} of ${LADDER.length})`);
  if (!dry) {
    await sql.query('update questions set interval_days = $1 where interval_days = $2', [target, days]);
  }
  moved += total;
}

console.log(dry
  ? `\n--dry: nothing written. ${moved} question(s) would move.`
  : `\nMoved ${moved} question(s) onto the ladder.`);
