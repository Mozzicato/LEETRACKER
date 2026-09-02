/* The problem catalogue: every LeetCode problem, imported by
   `npm run problems:fetch` into data/problems.json and committed, so a deploy
   never depends on LeetCode being reachable.

   The file is ~750 KB, far too big to hand to the browser on every page load,
   so the front end searches it through /api/problems/search instead. */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const LADDER = [1, 3, 7, 30, 90];

/* A tiny fallback so the app still runs if the import has never been done. */
const FALLBACK = [
  { number: 1, title: 'Two Sum', difficulty: 'Easy', topic: 'Array', slug: 'two-sum' },
  { number: 15, title: '3Sum', difficulty: 'Medium', topic: 'Array', slug: '3sum' },
  { number: 20, title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack', slug: 'valid-parentheses' },
  { number: 206, title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked List', slug: 'reverse-linked-list' }
];

function load() {
  try {
    return JSON.parse(readFileSync(fileURLToPath(new URL('../data/problems.json', import.meta.url)), 'utf8'));
  } catch {
    console.warn('data/problems.json missing — run: npm run problems:fetch');
    return FALLBACK;
  }
}

export const PROBLEMS = load();

const BY_NUMBER = new Map(PROBLEMS.map(problem => [problem.number, problem]));
export const byNumber = number => BY_NUMBER.get(Number(number));

/** Ranked search over 4,000 problems. Exact number wins, then title prefix,
 *  then anything containing the term, then a topic tag. Free problems first,
 *  because a premium one cannot be opened to practise. */
export function searchProblems(query, limit = 20) {
  const term = String(query || '').trim().toLowerCase();
  if (!term) return PROBLEMS.slice(0, limit);

  const asNumber = Number(term);
  const scored = [];

  for (const problem of PROBLEMS) {
    const title = problem.title.toLowerCase();
    let score = -1;

    if (Number.isInteger(asNumber) && problem.number === asNumber) score = 0;
    else if (title.startsWith(term)) score = 1;
    else if (String(problem.number).startsWith(term)) score = 2;
    else if (title.includes(term)) score = 3;
    else if ((problem.tags || [problem.topic]).some(tag => tag.toLowerCase().includes(term))) score = 4;

    if (score >= 0) scored.push([score + (problem.paid ? 0.5 : 0), problem]);
  }

  return scored
    .sort((a, b) => a[0] - b[0] || a[1].number - b[1].number)
    .slice(0, limit)
    .map(([, problem]) => problem);
}

/* A demo sheet spanning the whole progression, so the colour system is legible
   before you have practised for months. rung = index into LADDER,
   due = days from today, solved = days ago. */
export const SAMPLE = [
  { number: 1, insight: 'Store each number as you pass it and look for its complement in one scan.', time: 'O(n)', space: 'O(n)', rung: 4, due: 41, solved: 70 },
  { number: 206, insight: 'Three pointers: prev, current, next. Save next before you reverse the link.', time: 'O(n)', space: 'O(1)', rung: 4, due: 62, solved: 70 },
  { number: 20, insight: 'A closing bracket must match the most recent unmatched opening one, so use a stack.', time: 'O(n)', space: 'O(n)', rung: 3, due: 12, solved: 52 },
  { number: 121, insight: 'Track the minimum price so far and the best profit against it in one pass.', time: 'O(n)', space: 'O(1)', rung: 3, due: 21, solved: 52 },
  { number: 19, insight: 'Dummy node before the head, then move fast n steps ahead so both land correctly.', time: 'O(n)', space: 'O(1)', rung: 2, due: -18, solved: 52 },
  { number: 704, insight: 'Use low + (high - low) / 2, and keep the loop condition low <= high.', time: 'O(log n)', space: 'O(1)', rung: 2, due: 4, solved: 44 },
  { number: 226, insight: 'Swap the children, then recurse. The base case is a null node.', time: 'O(n)', space: 'O(h)', rung: 2, due: 6, solved: 44 },
  { number: 33, insight: 'One half is always sorted. Work out which, then decide if the target is inside it.', time: 'O(log n)', space: 'O(1)', rung: 2, due: -2, solved: 38 },
  { number: 15, insight: 'Sort first, fix one number, two-pointer the rest. Skip duplicates on every level.', time: 'O(n²)', space: 'O(1)', rung: 2, due: -7, solved: 38 },
  { number: 322, insight: 'Bottom-up DP over amounts: dp[a] = min(dp[a], dp[a - coin] + 1).', time: 'O(n·a)', space: 'O(a)', rung: 1, due: -14, solved: 35 },
  { number: 42, insight: 'Two pointers moving inward; the shorter side always decides the water level.', time: 'O(n)', space: 'O(1)', rung: 0, due: -31, solved: 35 },
  { number: 49, insight: 'Key the hash map by the sorted characters, or by a 26-slot letter count.', time: 'O(nk)', space: 'O(nk)', rung: 1, due: -3, solved: 28 },
  { number: 3, insight: 'Slide the window forward and jump the left edge past the last duplicate.', time: 'O(n)', space: 'O(k)', rung: 1, due: -9, solved: 28 },
  { number: 76, insight: 'Expand right until the window is valid, then shrink left while it stays valid.', time: 'O(n)', space: 'O(k)', rung: 0, due: -23, solved: 28 },
  { number: 21, insight: 'Dummy head, then splice the smaller node each step and attach the remainder.', time: 'O(n + m)', space: 'O(1)', rung: 1, due: 2, solved: 22 },
  { number: 141, insight: 'Fast and slow pointers. If they ever meet, there is a cycle.', time: 'O(n)', space: 'O(1)', rung: 1, due: 3, solved: 22 },
  { number: 102, insight: 'Queue the root, then process exactly one level per outer loop iteration.', time: 'O(n)', space: 'O(n)', rung: 1, due: 0, solved: 16 },
  { number: 207, insight: 'Topological sort. Queue every node with in-degree zero and count what you pop.', time: 'O(V + E)', space: 'O(V + E)', rung: 0, due: -12, solved: 16 },
  { number: 53, insight: 'Reset the running sum to zero whenever it goes negative; track the max as you go.', time: 'O(n)', space: 'O(1)', rung: 0, due: 0, solved: 9 },
  { number: 200, insight: 'Flood fill from every unvisited land cell and sink it as you go.', time: 'O(rc)', space: 'O(rc)', rung: 1, due: 8, solved: 9 }
];
