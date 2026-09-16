/* WHAT'S NEW — the announcements shown in the pop-up on the sheet.

   To announce something, add an entry at the TOP. That is all: anyone who
   has not seen the newest id gets the banner again next time they open the
   sheet, and everything above the last one they saw is theirs to read.

   - id     unique and never reused; date plus a slug keeps that easy
   - date   YYYY-MM-DD
   - title  a few words
   - body   one or two plain sentences, written for the person using it */

window.LIT_UPDATES = [
  {
    id: '2026-09-15-dark-mode',
    date: '2026-09-15',
    title: 'Dark mode',
    body: 'Switch between System, Light and Dark from the sidebar. System follows your device, so the sheet goes dark when your machine does.'
  },
  {
    id: '2026-09-15-readability',
    date: '2026-09-15',
    title: 'Easier to read',
    body: 'The small grey text, dates, captions and labels, is darker and clearer in both themes.'
  },
  {
    id: '2026-09-15-live-sheet',
    date: '2026-09-15',
    title: 'Your sheet keeps itself up to date',
    body: 'Come back to a tab you left open and anything you added since, here or on another device, shows up without a refresh.'
  },
  {
    id: '2026-09-06-fast-slow',
    date: '2026-09-06',
    title: 'Fast and slow pointers on linked lists',
    body: 'Linked list problems now suggest the tortoise-and-hare pattern.'
  },
  {
    id: '2026-09-03-patterns-per-problem',
    date: '2026-09-03',
    title: 'Patterns that fit the question',
    body: 'The pattern picker suggests techniques that suit the problem you chose, and folds away once you pick one.'
  },
  {
    id: '2026-09-03-every-problem',
    date: '2026-09-03',
    title: 'Every LeetCode problem',
    body: 'Search the whole LeetCode catalogue when you add a question, not a short hand-picked list.'
  },
  {
    id: '2026-09-03-mobile',
    date: '2026-09-03',
    title: 'Better on phones',
    body: 'The sidebar, the sheet and the dialogs have been reworked for small screens.'
  }
];
