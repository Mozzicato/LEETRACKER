/* PATTERNS — the technique actually used, which is not the same thing as the
   topic. "Two Pointers" is a topic; converging, fast-and-slow and fixed
   separation are three different patterns inside it. A problem usually has more
   than one valid approach, so a pattern belongs to a question (your solution),
   never to the problem itself.

   Compiled from the widely used pattern lists — Grokking's 14/24 patterns,
   NeetCode's roadmap, AlgoMaster's 20 DP patterns — plus the standard graph and
   string algorithm sets and the less common techniques that still show up. */

/** Choosing this means the solution is not the intended complexity. */
export const BRUTE_FORCE = 'brute-force';

export const PATTERN_FAMILIES = [
  { key: 'baseline', name: 'Baseline', patterns: [
    { key: 'brute-force', name: 'Brute force / exhaustive' },
    { key: 'simulation', name: 'Direct simulation' },
    { key: 'matrix-transform', name: 'Matrix rotation / spiral / in-place transform' }
  ]},

  { key: 'two-pointers', name: 'Two pointers', patterns: [
    { key: 'converging', name: 'Converging (opposite ends)' },
    { key: 'fast-slow', name: 'Fast and slow (tortoise and hare)' },
    { key: 'fixed-separation', name: 'Fixed separation (n apart)' },
    { key: 'same-direction', name: 'Same direction (read / write pointer)' },
    { key: 'dutch-national-flag', name: 'Dutch national flag (3-way partition)' },
    { key: 'merge-two-sorted', name: 'Merging two sorted sequences' }
  ]},

  { key: 'sliding-window', name: 'Sliding window', patterns: [
    { key: 'fixed-window', name: 'Fixed-size window' },
    { key: 'variable-window', name: 'Variable window (longest / shortest valid)' },
    { key: 'window-with-counts', name: 'Window with a frequency map' },
    { key: 'monotonic-deque-window', name: 'Monotonic deque window (sliding maximum)' }
  ]},

  { key: 'prefix', name: 'Prefix and range', patterns: [
    { key: 'prefix-sum', name: 'Prefix sum' },
    { key: 'prefix-sum-hashmap', name: 'Prefix sum with a hash map (subarray sums)' },
    { key: 'prefix-suffix-products', name: 'Prefix and suffix products' },
    { key: 'difference-array', name: 'Difference array (range updates)' },
    { key: 'prefix-sum-2d', name: '2D prefix sum' }
  ]},

  { key: 'binary-search', name: 'Binary search', patterns: [
    { key: 'binary-search-classic', name: 'Classic binary search' },
    { key: 'boundary-search', name: 'Boundary search (lower / upper bound)' },
    { key: 'rotated-array-search', name: 'Rotated sorted array' },
    { key: 'peak-finding', name: 'Peak finding' },
    { key: 'binary-search-on-answer', name: 'Binary search on the answer (monotonic predicate)' },
    { key: 'search-2d-matrix', name: 'Search a sorted 2D matrix' }
  ]},

  { key: 'sorting', name: 'Sorting-based', patterns: [
    { key: 'sort-then-scan', name: 'Sort then scan' },
    { key: 'custom-comparator', name: 'Custom comparator' },
    { key: 'counting-bucket-sort', name: 'Counting / bucket / radix sort' },
    { key: 'cyclic-sort', name: 'Cyclic sort (values are 1..n)' },
    { key: 'quickselect', name: 'Quickselect (nth element)' },
    { key: 'coordinate-compression', name: 'Coordinate compression' }
  ]},

  { key: 'hashing', name: 'Hashing', patterns: [
    { key: 'hash-lookup', name: 'Hash map lookup / complement' },
    { key: 'frequency-count', name: 'Frequency counting' },
    { key: 'group-by-key', name: 'Grouping by a derived key' },
    { key: 'set-dedupe', name: 'Set for membership or de-duplication' },
    { key: 'rolling-hash', name: 'Rolling hash' }
  ]},

  { key: 'stack-queue', name: 'Stack and queue', patterns: [
    { key: 'monotonic-stack', name: 'Monotonic stack (next greater / smaller)' },
    { key: 'stack-simulation', name: 'Stack simulation (brackets, expressions)' },
    { key: 'largest-rectangle', name: 'Histogram / largest rectangle' },
    { key: 'two-stacks', name: 'Two stacks (queue, min-stack)' },
    { key: 'deque', name: 'Deque / double-ended queue' }
  ]},

  { key: 'heap', name: 'Heap and top-K', patterns: [
    { key: 'top-k-heap', name: 'Top-K with a heap' },
    { key: 'two-heaps', name: 'Two heaps (running median)' },
    { key: 'k-way-merge', name: 'K-way merge' },
    { key: 'scheduling-heap', name: 'Scheduling with a heap (meeting rooms, tasks)' }
  ]},

  { key: 'linked-list', name: 'Linked list', patterns: [
    { key: 'in-place-reversal', name: 'In-place reversal' },
    { key: 'dummy-head', name: 'Dummy head node' },
    { key: 'cycle-detection-list', name: 'Cycle detection and entry point' },
    { key: 'split-reorder', name: 'Split / reorder / interleave' }
  ]},

  { key: 'trees', name: 'Trees', patterns: [
    { key: 'tree-dfs', name: 'Tree DFS (pre / in / post-order)' },
    { key: 'tree-bfs', name: 'Tree BFS (level order)' },
    { key: 'postorder-aggregate', name: 'Bottom-up aggregation (return values upward)' },
    { key: 'bst-property', name: 'BST property (inorder is sorted)' },
    { key: 'lowest-common-ancestor', name: 'Lowest common ancestor' },
    { key: 'tree-diameter', name: 'Diameter / longest path' },
    { key: 'serialize-tree', name: 'Serialize and deserialize' },
    { key: 'morris-traversal', name: 'Morris traversal (constant space)' },
    { key: 'trie', name: 'Trie (prefix tree)' },
    { key: 'segment-tree', name: 'Segment tree' },
    { key: 'fenwick-tree', name: 'Fenwick tree / BIT' }
  ]},

  { key: 'graphs', name: 'Graphs', patterns: [
    { key: 'graph-dfs', name: 'Graph DFS' },
    { key: 'graph-bfs', name: 'Graph BFS (shortest unweighted)' },
    { key: 'flood-fill', name: 'Flood fill / island counting' },
    { key: 'multi-source-bfs', name: 'Multi-source BFS' },
    { key: 'bidirectional-bfs', name: 'Bidirectional BFS' },
    { key: 'zero-one-bfs', name: '0-1 BFS (deque)' },
    { key: 'topological-sort', name: 'Topological sort (Kahn or DFS)' },
    { key: 'union-find', name: 'Union-find (disjoint set)' },
    { key: 'bipartite-coloring', name: 'Bipartite check / two-colouring' },
    { key: 'cycle-detection-graph', name: 'Cycle detection in a graph' },
    { key: 'dijkstra', name: 'Dijkstra shortest path' },
    { key: 'bellman-ford', name: 'Bellman-Ford (negative weights)' },
    { key: 'floyd-warshall', name: 'Floyd-Warshall (all pairs)' },
    { key: 'mst', name: 'Minimum spanning tree (Kruskal or Prim)' },
    { key: 'tarjan', name: 'Tarjan bridges / articulation points' },
    { key: 'eulerian-path', name: 'Eulerian path or circuit' },
    { key: 'network-flow', name: 'Network flow / bipartite matching' }
  ]},

  { key: 'backtracking', name: 'Backtracking', patterns: [
    { key: 'subsets', name: 'Subsets / power set' },
    { key: 'permutations', name: 'Permutations' },
    { key: 'combinations', name: 'Combinations / combination sum' },
    { key: 'constraint-backtracking', name: 'Constraint search (N-Queens, Sudoku)' },
    { key: 'grid-backtracking', name: 'Grid backtracking (word search)' },
    { key: 'palindrome-partitioning', name: 'Palindrome partitioning' }
  ]},

  { key: 'dp', name: 'Dynamic programming', patterns: [
    { key: 'dp-linear', name: 'Linear DP (climbing stairs, house robber)' },
    { key: 'kadane', name: 'Kadane (maximum subarray)' },
    { key: 'knapsack-01', name: '0/1 knapsack' },
    { key: 'knapsack-unbounded', name: 'Unbounded knapsack / coin change' },
    { key: 'subset-sum', name: 'Subset sum / partition' },
    { key: 'lcs', name: 'Longest common subsequence' },
    { key: 'lis', name: 'Longest increasing subsequence' },
    { key: 'edit-distance', name: 'Edit distance' },
    { key: 'palindromic-subsequence', name: 'Palindromic subsequence / substring' },
    { key: 'interval-dp', name: 'Interval DP / matrix chain' },
    { key: 'grid-dp', name: 'DP on grids' },
    { key: 'tree-dp', name: 'DP on trees' },
    { key: 'graph-dp', name: 'DP on graphs / DAGs' },
    { key: 'bitmask-dp', name: 'Bitmask DP' },
    { key: 'digit-dp', name: 'Digit DP' },
    { key: 'probability-dp', name: 'Probability / expected value DP' },
    { key: 'state-machine-dp', name: 'State machine DP (stock problems)' },
    { key: 'string-partition-dp', name: 'String partition DP (word break)' },
    { key: 'count-ways', name: 'Counting distinct ways' },
    { key: 'catalan', name: 'Catalan numbers' }
  ]},

  { key: 'greedy', name: 'Greedy and intervals', patterns: [
    { key: 'greedy-exchange', name: 'Greedy exchange argument' },
    { key: 'merge-intervals', name: 'Merge intervals' },
    { key: 'interval-scheduling', name: 'Interval scheduling / non-overlapping' },
    { key: 'line-sweep', name: 'Line sweep / event sorting' },
    { key: 'jump-reachability', name: 'Reachability jumps (jump game)' },
    { key: 'circuit-greedy', name: 'Circuit / gas station' },
    { key: 'huffman', name: 'Huffman / repeated smallest merge' }
  ]},

  { key: 'bits', name: 'Bit manipulation', patterns: [
    { key: 'xor-trick', name: 'XOR trick (single number, pairing)' },
    { key: 'bit-counting', name: 'Bit counting / Brian Kernighan' },
    { key: 'bitmask-enumeration', name: 'Bitmask subset enumeration' },
    { key: 'power-of-two', name: 'Power-of-two and mask tricks' }
  ]},

  { key: 'math', name: 'Maths and randomness', patterns: [
    { key: 'gcd-lcm', name: 'GCD / LCM' },
    { key: 'modular-arithmetic', name: 'Modular arithmetic' },
    { key: 'combinatorics', name: 'Combinatorics' },
    { key: 'prime-sieve', name: 'Prime sieve' },
    { key: 'fast-exponentiation', name: 'Fast exponentiation' },
    { key: 'matrix-exponentiation', name: 'Matrix exponentiation' },
    { key: 'geometry', name: 'Geometry' },
    { key: 'convex-hull', name: 'Convex hull' },
    { key: 'base-conversion', name: 'Base conversion / digit manipulation' },
    { key: 'boyer-moore-voting', name: 'Boyer-Moore majority vote' },
    { key: 'reservoir-sampling', name: 'Reservoir sampling' },
    { key: 'weighted-random', name: 'Weighted random pick' }
  ]},

  { key: 'strings', name: 'String algorithms', patterns: [
    { key: 'expand-around-center', name: 'Expand around centre' },
    { key: 'kmp', name: 'KMP / prefix function' },
    { key: 'rabin-karp', name: 'Rabin-Karp' },
    { key: 'z-algorithm', name: 'Z-algorithm' },
    { key: 'manacher', name: 'Manacher' },
    { key: 'aho-corasick', name: 'Aho-Corasick' },
    { key: 'suffix-array', name: 'Suffix array / suffix tree' },
    { key: 'string-parsing', name: 'Parsing / tokenising' }
  ]},

  { key: 'divide', name: 'Divide and conquer', patterns: [
    { key: 'divide-conquer', name: 'Divide and conquer' },
    { key: 'merge-sort-counting', name: 'Merge sort counting (inversions)' },
    { key: 'meet-in-the-middle', name: 'Meet in the middle' }
  ]},

  { key: 'design', name: 'Design', patterns: [
    { key: 'lru-cache', name: 'LRU cache (hash map and list)' },
    { key: 'lfu-cache', name: 'LFU cache' },
    { key: 'iterator-design', name: 'Iterator design' },
    { key: 'data-stream', name: 'Data stream / running statistics' },
    { key: 'ordered-set', name: 'Ordered set / sorted container' }
  ]},

  { key: 'advanced', name: 'Advanced', patterns: [
    { key: 'sqrt-decomposition', name: 'Square root decomposition' },
    { key: 'mos-algorithm', name: 'Mo algorithm (offline queries)' },
    { key: 'heavy-light', name: 'Heavy-light decomposition' },
    { key: 'persistent-structure', name: 'Persistent data structure' },
    { key: 'game-theory', name: 'Game theory / minimax' }
  ]}
];

export const PATTERNS = PATTERN_FAMILIES.flatMap(family =>
  family.patterns.map(pattern => ({ ...pattern, family: family.name, familyKey: family.key }))
);

const KEYS = new Set(PATTERNS.map(pattern => pattern.key));

export const isPatternKey = key => KEYS.has(key);
export const patternName = key => PATTERNS.find(pattern => pattern.key === key)?.name ?? key;

/** At most this many per question — picking everything says nothing. */
export const MAX_PATTERNS = 4;

/** Keeps only real keys, de-duplicates, and caps the count. */
export const cleanPatterns = value => [...new Set(
  (Array.isArray(value) ? value : []).map(String).filter(isPatternKey)
)].slice(0, MAX_PATTERNS);
