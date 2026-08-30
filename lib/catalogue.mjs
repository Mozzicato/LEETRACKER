/* The problem catalogue and the demo sheet. Served to the browser at /api/problems
   so the front end and the seeder never drift apart. */

export const LADDER = [1, 3, 7, 30, 90];

export const PROBLEMS = [
  { number: 1, title: 'Two Sum', difficulty: 'Easy', topic: 'Hash Map', slug: 'two-sum' },
  { number: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Sliding Window', slug: 'longest-substring-without-repeating-characters' },
  { number: 11, title: 'Container With Most Water', difficulty: 'Medium', topic: 'Two Pointers', slug: 'container-with-most-water' },
  { number: 15, title: '3Sum', difficulty: 'Medium', topic: 'Two Pointers', slug: '3sum' },
  { number: 19, title: 'Remove Nth Node From End of List', difficulty: 'Medium', topic: 'Linked List', slug: 'remove-nth-node-from-end-of-list' },
  { number: 20, title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack', slug: 'valid-parentheses' },
  { number: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'Linked List', slug: 'merge-two-sorted-lists' },
  { number: 33, title: 'Search in Rotated Sorted Array', difficulty: 'Medium', topic: 'Binary Search', slug: 'search-in-rotated-sorted-array' },
  { number: 39, title: 'Combination Sum', difficulty: 'Medium', topic: 'Backtracking', slug: 'combination-sum' },
  { number: 42, title: 'Trapping Rain Water', difficulty: 'Hard', topic: 'Two Pointers', slug: 'trapping-rain-water' },
  { number: 49, title: 'Group Anagrams', difficulty: 'Medium', topic: 'Hash Map', slug: 'group-anagrams' },
  { number: 53, title: 'Maximum Subarray', difficulty: 'Medium', topic: 'Dynamic Programming', slug: 'maximum-subarray' },
  { number: 56, title: 'Merge Intervals', difficulty: 'Medium', topic: 'Intervals', slug: 'merge-intervals' },
  { number: 70, title: 'Climbing Stairs', difficulty: 'Easy', topic: 'Dynamic Programming', slug: 'climbing-stairs' },
  { number: 76, title: 'Minimum Window Substring', difficulty: 'Hard', topic: 'Sliding Window', slug: 'minimum-window-substring' },
  { number: 102, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', topic: 'Trees', slug: 'binary-tree-level-order-traversal' },
  { number: 121, title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', topic: 'Arrays', slug: 'best-time-to-buy-and-sell-stock' },
  { number: 141, title: 'Linked List Cycle', difficulty: 'Easy', topic: 'Linked List', slug: 'linked-list-cycle' },
  { number: 200, title: 'Number of Islands', difficulty: 'Medium', topic: 'Graphs', slug: 'number-of-islands' },
  { number: 206, title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked List', slug: 'reverse-linked-list' },
  { number: 207, title: 'Course Schedule', difficulty: 'Medium', topic: 'Graphs', slug: 'course-schedule' },
  { number: 215, title: 'Kth Largest Element in an Array', difficulty: 'Medium', topic: 'Heap', slug: 'kth-largest-element-in-an-array' },
  { number: 226, title: 'Invert Binary Tree', difficulty: 'Easy', topic: 'Trees', slug: 'invert-binary-tree' },
  { number: 238, title: 'Product of Array Except Self', difficulty: 'Medium', topic: 'Arrays', slug: 'product-of-array-except-self' },
  { number: 322, title: 'Coin Change', difficulty: 'Medium', topic: 'Dynamic Programming', slug: 'coin-change' },
  { number: 424, title: 'Longest Repeating Character Replacement', difficulty: 'Medium', topic: 'Sliding Window', slug: 'longest-repeating-character-replacement' },
  { number: 704, title: 'Binary Search', difficulty: 'Easy', topic: 'Binary Search', slug: 'binary-search' },
  { number: 875, title: 'Koko Eating Bananas', difficulty: 'Medium', topic: 'Binary Search', slug: 'koko-eating-bananas' }
];

export const byNumber = number => PROBLEMS.find(problem => problem.number === Number(number));

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
