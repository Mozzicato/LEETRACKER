Absolutely. And **Lit-Sheet** is a much better name for the concept—it captures the idea of a personal sheet of things you need to remember without sounding like you're cheating on LeetCode.

Below is a proper product/engineering PRD. I've structured it so we can actually **build from it phase by phase**, rather than creating a PRD that sounds nice but is useless once coding starts.

# LIT-SHEET — PRODUCT REQUIREMENTS DOCUMENT

**Product:** Lit-Sheet
**Category:** LeetCode revision / spaced-repetition tracker
**Primary users:** Software engineering students, internship applicants, coding interview candidates
**Platform:** Web application / PWA
**Status:** Pre-development
**Document version:** 1.0
**Core principle:** *Solved doesn't mean remembered.*

---

# 1. Product Overview

## 1.1 Problem

People preparing for software engineering interviews solve large numbers of LeetCode problems.

The problem is not necessarily solving the problem initially.

The problem is **retention**.

A user may solve:

> Two Sum — August 27

and feel confident.

Seven days later, they encounter the same problem or a similar problem and realize they have forgotten:

* the approach
* the pattern
* the key observation
* the implementation
* the edge cases
* the complexity

Existing trackers primarily answer:

> **"How many problems have I solved?"**

Lit-Sheet should answer:

> **"Which problems do I need to remember today?"**

---

# 2. Product Vision

Lit-Sheet is a lightweight personal revision system that turns solved LeetCode problems into a continuously scheduled memory queue.

The system should automatically determine when a user should revisit a problem based on their previous performance.

### Core loop

```text
SOLVE
  ↓
RECORD
  ↓
SCHEDULE
  ↓
REVIEW
  ↓
REMEMBER / STRUGGLE / FORGET
  ↓
RESCHEDULE
  ↓
REVIEW AGAIN
```

The long-term goal is to help users develop **durable algorithmic problem-solving knowledge**, rather than simply accumulate solved-problem counts.

---

# 3. Product Philosophy

Lit-Sheet should follow five principles.

### 3.1 Fast

Recording a solved problem should take seconds, not minutes.

### 3.2 Clean

The UI should feel calm and lightweight.

### 3.3 Memory-first

The system should optimize for remembering concepts, not tracking vanity metrics.

### 3.4 Low friction

The user should never feel like maintaining Lit-Sheet is another task.

### 3.5 Progressive complexity

The MVP should remain simple.

Advanced analytics, AI and integrations come later.

---

# 4. Target Users

## Primary persona

### The Internship Candidate

A university student preparing for:

* Google
* Meta
* Microsoft
* Amazon
* other software engineering internships
* general coding interviews

Typical behavior:

```text
Monday
Solve 3 problems

Tuesday
Solve 2 problems

Wednesday
Solve 4 problems

Thursday
Solve nothing

Next week
Forgot half of them.
```

They need a system that tells them:

> **"Revise these five today."**

---

# 5. User Stories

### Recording

> As a user, I want to quickly add a LeetCode problem I've solved.

### Notes

> As a user, I want to record the important insight I learned from a problem.

### Complexity

> As a user, I want to record the time and space complexity.

### Search

> As a user, I want to search for a problem by title or number.

### Revision

> As a user, I want Lit-Sheet to tell me when I should revisit a problem.

### Review

> As a user, I want to indicate whether I remembered a problem.

### Scheduling

> As a user, I want successful reviews to increase the interval before the next review.

### Forgetting

> As a user, I want forgotten problems to return sooner.

### Notifications

> As a user, I want Lit-Sheet to remind me when problems are due.

---

# 6. Core Product Concepts

Lit-Sheet has four major concepts.

## 6.1 Problem

A LeetCode problem.

Example:

```text
#206
Reverse Linked List

Difficulty:
Easy

Pattern:
Linked List
```

---

## 6.2 Cheat

A user's personal record for that problem.

Example:

```text
Reverse Linked List

My insight:
Use three pointers:
prev, current, next.

Time:
O(n)

Space:
O(1)
```

The distinction is important.

A **problem** belongs to Lit-Sheet's global database.

A **cheat** belongs to the individual user.

---

## 6.3 Review

An attempt by the user to recall/solve a previously recorded problem.

Example:

```text
Review #3

Problem:
3Sum

Result:
Remembered

Previous interval:
7 days

New interval:
14 days
```

---

## 6.4 Schedule

The system's calculated next review date.

Example:

```text
Solved:
August 27

Next review:
August 30
```

---

# 7. MVP FEATURES

The MVP is divided into the following systems.

```text
Authentication
      ↓
Problem Database
      ↓
Cheat Creation
      ↓
Revision Scheduler
      ↓
Dashboard
      ↓
Review System
      ↓
Notifications
```

---

# 8. Feature: Authentication

Users should be able to create accounts.

### Requirements

* Email/password authentication
* Google authentication
* Logout
* Password reset
* Session persistence

### Future

* GitHub authentication
* LeetCode account connection

---

# 9. Feature: LeetCode Problem Database

Lit-Sheet needs a searchable database of LeetCode problems.

Each problem should contain:

```text
id
leetcode_number
title
slug
difficulty
url
topics
```

Example:

```json
{
  "leetcode_number": 206,
  "title": "Reverse Linked List",
  "slug": "reverse-linked-list",
  "difficulty": "Easy",
  "topics": [
    "Linked List",
    "Recursion"
  ]
}
```

---

# 10. Problem Search

When adding a cheat:

```text
Search LeetCode problems...
```

The user can type:

```text
206
```

or:

```text
reverse linked
```

or:

```text
linked list reverse
```

Results should appear immediately.

Example:

```text
206 · Reverse Linked List
Easy · Linked List

92 · Reverse Linked List II
Medium · Linked List

25 · Reverse Nodes in k-Group
Hard · Linked List
```

### Requirements

* Search by number
* Search by title
* Search by slug
* Fuzzy matching
* Keyboard navigation
* Maximum result count
* Debounced search

---

# 11. Feature: Create Cheat

After selecting a problem:

```text
Reverse Linked List
#206
```

The user sees:

### Required

* Problem
* Solved date

### Optional

* Pattern
* Time complexity
* Space complexity
* Notes
* Key insight
* Mistake
* Difficulty confirmation

---

# 12. Cheat Data Model

Conceptually:

```text
User
 │
 └── Cheats
       │
       ├── Problem
       ├── Notes
       ├── Complexity
       ├── Key Insight
       ├── Created At
       ├── Last Reviewed
       ├── Next Review
       ├── Review Count
       ├── Current Interval
       └── Status
```

---

# 13. Key Insight

This should be one of the most important fields.

Prompt:

> **What do you need to remember?**

Examples:

```text
The array is sorted, so use two pointers.
```

```text
Use a dummy node because the head may be removed.
```

```text
Fast pointer moves n steps ahead.
```

This becomes the user's personal "cheat."

---

# 14. Notes

A free-form notes section.

Example:

```text
Initially tried nested loops.

The important observation is that the
array is sorted.

Two pointers reduce the solution from
O(n²) to O(n).
```

Markdown can be supported later.

MVP can use plain text.

---

# 15. Complexity

Two fields:

### Time Complexity

Examples:

```text
O(n)
O(n log n)
O(n²)
```

### Space Complexity

Examples:

```text
O(1)
O(n)
O(log n)
```

Users can either type them or select from suggestions.

---

# 16. Revision Engine

This is the heart of Lit-Sheet.

The initial MVP should use a **simple deterministic spaced-repetition algorithm**.

Don't start by building complicated AI.

### Initial schedule

```text
First solve
     ↓
3 days
     ↓
7 days
     ↓
14 days
     ↓
30 days
     ↓
60 days
     ↓
90 days
```

---

# 17. Review Outcomes

After reviewing a problem, the user chooses:

### 🟢 Remembered

> I could solve/explain it confidently.

Increase interval.

```text
3 → 7
7 → 14
14 → 30
30 → 60
60 → 90
```

---

### 🟡 Struggled

> I remembered the idea but struggled with implementation.

Keep/reduce the interval.

Example:

```text
14 → 7
```

---

### 🔴 Forgot

> I couldn't remember the solution/approach.

Reset:

```text
30 → 3
```

---

# 18. Review Algorithm

Initial logic:

```text
if remembered:
    increase interval

elif struggled:
    decrease interval moderately

elif forgot:
    reset interval
```

The scheduler should eventually become more sophisticated.

But **V1 should remain explainable.**

A user should understand why something is appearing again.

---

# 19. Status System

Each cheat has a visual status.

### Fresh

Recently solved.

```text
🟢
```

### Upcoming

Review approaching.

```text
🟡
```

### Due

Review date has arrived.

```text
🟠
```

### Overdue

Review is late.

```text
🔴
```

### Severely overdue

Long overdue.

```text
🔴🔴
```

---

# 20. Dynamic Red System

This is one of Lit-Sheet's signature UI concepts.

Instead of:

```text
Overdue = red
```

calculate intensity based on overdue duration.

Conceptually:

```text
0 days overdue
    ↓
No red

1–2 days
    ↓
Light red

3–6 days
    ↓
Medium red

7–13 days
    ↓
Strong red

14+ days
    ↓
Deep red
```

The UI should communicate urgency without needing the user to read numbers.

---

# 21. Dashboard

The dashboard should answer one question:

> **What should I do right now?**

### Proposed layout

```text
LIT-SHEET

Good evening.

You have 6 Cheats due today.

        [ REVIEW NOW ]


DUE TODAY

🔴 Remove Nth Node From End
🔴 3Sum
🟠 Binary Search


UPCOMING

🟡 Two Sum
🟡 Valid Parentheses


RECENTLY ADDED

🟢 Merge Intervals
🟢 Reverse Linked List
```

---

# 22. Dashboard Metrics

Minimal MVP metrics:

### Total Cheats

```text
47
```

### Due Today

```text
6
```

### Overdue

```text
3
```

### Mastered

```text
12
```

Don't add dozens of metrics.

---

# 23. Review Mode

When a user clicks:

> **Review Cheats**

Lit-Sheet enters focused review mode.

---

## Step 1 — Problem

```text
REMOVE NTH NODE
FROM END OF LIST

Medium
Linked List

Can you solve this?
```

Button:

> **Open on LeetCode**

---

## Step 2 — User solves

They solve externally.

Then return.

---

## Step 3 — Self-assessment

```text
How did it go?

🟢 I remembered it

🟡 I struggled

🔴 I forgot
```

---

## Step 4 — Reveal Cheat

After assessment:

```text
YOUR CHEAT

Use a dummy node.

Move fast pointer n steps ahead,
then move both pointers together.

Time: O(n)
Space: O(1)
```

This is important.

**Don't reveal the notes before the user attempts recall.**

Otherwise the revision system becomes passive reading.

---

# 24. Review Queue

The review queue should prioritize:

```text
1. Severely overdue
2. Overdue
3. Due today
4. Upcoming
```

Within each category:

* older due dates first
* optionally harder problems first

---

# 25. Daily Review

Users should have a clear daily target.

Example:

> **Today's Cheats: 7**

Then:

```text
3 overdue
2 due today
2 scheduled
```

The system can tell them:

> Clear your 7 Cheats today.

---

# 26. Streak

Potential MVP-lite feature.

Example:

```text
🔥 8 day streak
```

A streak should represent **review consistency**, not number of problems solved.

This distinction matters.

Someone who reviews 3 problems shouldn't lose to someone who solves 20 new problems but reviews nothing.

---

# 27. Calendar

Later MVP/V2 feature.

Calendar view:

```text
AUGUST 2026

M T W T F S S

          1  2
3  4  5  6  7  8  9
...

27 28 29 30 31
```

Days can show:

* problems solved
* reviews completed
* overdue count

---

# 28. Topics / Patterns

Each cheat should eventually have one or more patterns.

Examples:

```text
Arrays
Hash Map
Two Pointers
Sliding Window
Binary Search
Stack
Queue
Linked List
Trees
Graphs
Heap
Backtracking
Dynamic Programming
Greedy
Intervals
Trie
Union Find
```

---

# 29. Pattern Dashboard

Later:

```text
YOUR PATTERNS

Arrays             █████████  91%
Hash Maps          ████████   83%
Two Pointers       ███████    76%
Trees              ██████     61%
Graphs             ████       42%
Dynamic Programming███        34%
```

This should be based on review performance rather than simply problem count.

---

# 30. Weakness Detection

Eventually Lit-Sheet can say:

> **You keep forgetting Dynamic Programming.**

For example:

```text
DP
12 problems
Average retention: 43%

Graphs
8 problems
Average retention: 51%

Arrays
15 problems
Average retention: 87%
```

This becomes valuable interview preparation intelligence.

---

# 31. Notifications

Email notifications should be optional.

Example:

### Morning

> **You have 5 Cheats waiting.**

### Evening

> **3 Cheats are still overdue.**

Users should control:

```text
Email reminders
[ ON ]

Reminder time
[ 8:00 AM ]

Timezone
[ Africa/Lagos ]

Frequency
[ Daily ]
```

---

# 32. Notification Architecture

Don't build email sending directly into the frontend.

Use:

```text
Scheduler
   ↓
Find users with due Cheats
   ↓
Generate notification
   ↓
Email provider
   ↓
User
```

The system should avoid duplicate emails.

---

# 33. Import

Important future feature.

Instead of manually adding:

> 100 solved problems

the user can import their LeetCode history.

Potential methods:

* LeetCode username
* exported data
* browser extension
* manual CSV

Then Lit-Sheet can create the initial Cheats.

---

# 34. Browser Extension

This could become one of the best features.

Imagine the user is on:

> LeetCode → Two Sum

They click the Lit-Sheet extension.

It detects:

```text
Two Sum
#1
Easy
```

and displays:

> **+ Add to Lit-Sheet**

Click.

Done.

No copying titles.

No switching tabs.

This directly solves the biggest friction in the product.

---

# 35. PWA

The web application should eventually behave like an app.

Requirements:

* responsive
* mobile-friendly
* installable
* offline-friendly review access
* fast loading

---

# 36. AI Features — NOT MVP

AI can come later.

Potential features:

### Automatic note summarization

User writes:

> I initially tried brute force...

AI generates:

> **Key insight:** Use a hash map to achieve O(n).

### Pattern detection

User adds a problem.

AI suggests:

> Two Pointers

### Weakness analysis

> You're repeatedly struggling with sliding-window problems.

### Cheat generation

After solving:

> Generate my cheat.

But AI should **not become necessary for the basic product.**

---

# 37. Database Architecture

High-level model:

```text
users
 │
 ├── cheats
 │      │
 │      └── problems
 │
 ├── reviews
 │
 └── notification_preferences
```

### `users`

```text
id
email
name
created_at
timezone
```

### `problems`

```text
id
leetcode_number
title
slug
difficulty
url
```

### `topics`

```text
id
name
```

### `problem_topics`

```text
problem_id
topic_id
```

### `cheats`

```text
id
user_id
problem_id

notes
key_insight
time_complexity
space_complexity

created_at
last_reviewed_at
next_review_at

interval_days
review_count

status
```

### `reviews`

```text
id
cheat_id
reviewed_at
result

previous_interval
new_interval
```

---

# 38. Important Engineering Principle

Don't store only:

```text
next_review_at
```

Store the **review history**.

Why?

Because eventually we want to know:

```text
How many times did they forget?

How quickly do they retain linked-list problems?

Which problems repeatedly fail?

What was their historical schedule?
```

That requires review events.

---

# 39. API Structure

Potential backend structure:

```text
/auth
/problems
/cheats
/reviews
/dashboard
/notifications
/topics
```

Example:

```text
GET /problems/search?q=reverse

POST /cheats

GET /cheats/due

GET /cheats/upcoming

POST /cheats/:id/review

GET /dashboard
```

---

# 40. Frontend Pages

MVP:

```text
/
 /login
 /signup

 /dashboard

 /cheats
 /cheats/new
 /cheats/:id

 /review
 /review/:id

 /settings
```

---

# 41. Phase Breakdown

Now the actual build roadmap.

---

# PHASE 0 — Product Definition

### Goal

Freeze what we're building.

### Tasks

* Finalize Lit-Sheet branding
* Finalize MVP scope
* Define user stories
* Define review algorithm
* Define database schema
* Define UI architecture
* Define success metrics

### Deliverable

A frozen MVP specification.

**Do not code heavily before this is done.**

---

# PHASE 1 — UX / Design

### Goal

Create the visual identity.

Design:

* Logo
* typography
* colors
* buttons
* cards
* input fields
* problem cards
* status colors
* dashboard
* review mode
* mobile layout

### Core design direction

**Soft notebook / study sheet aesthetic.**

Avoid:

* excessive gradients
* dashboard clutter
* neon developer aesthetic
* unnecessary animations

### Deliverable

Complete clickable UI prototype.

---

# PHASE 2 — Project Foundation

### Goal

Create the actual engineering foundation.

Set up:

```text
frontend/
backend/
database/
tests/
docs/
```

Configure:

* Git
* environment variables
* linting
* formatting
* TypeScript if chosen
* database migrations
* CI
* deployment environments

### Deliverable

Application boots locally and deploys successfully.

---

# PHASE 3 — Authentication

Implement:

* signup
* login
* logout
* session persistence
* password reset
* protected routes

### Deliverable

A user can create an account and access their private dashboard.

---

# PHASE 4 — Problem Database

Create/import the LeetCode problem dataset.

Implement:

* problem storage
* search
* autocomplete
* number lookup
* title lookup
* difficulty
* topics

### Deliverable

User can type:

> `206`

and receive:

> Reverse Linked List.

---

# PHASE 5 — Cheat Creation

Implement:

```text
+ Add Cheat
```

User selects problem and enters:

* notes
* key insight
* complexity
* pattern
* solved date

Save.

### Deliverable

The first complete core workflow:

```text
Search problem
     ↓
Select
     ↓
Add notes
     ↓
Save
```

---

# PHASE 6 — Revision Engine

Implement scheduling.

Initial algorithm:

```text
NEW
 ↓
3d
 ↓
7d
 ↓
14d
 ↓
30d
 ↓
60d
 ↓
90d
```

Implement:

* next review date
* interval
* status
* due calculation
* overdue calculation

### Deliverable

Lit-Sheet automatically knows which problems need review.

---

# PHASE 7 — Dashboard

Build the main home screen.

Show:

```text
Due today
Overdue
Upcoming
Recently added
Statistics
```

Implement dynamic status colors.

### Deliverable

User can open Lit-Sheet and immediately know what to do.

---

# PHASE 8 — Review Mode

Implement the actual learning loop.

```text
Open review
 ↓
See problem
 ↓
Attempt
 ↓
Self-assess
 ↓
Reveal cheat
 ↓
Update schedule
```

### Deliverable

The core Lit-Sheet experience is complete.

At this point, **you have a usable product.**

---

# PHASE 9 — Notifications

Implement:

* email preferences
* daily reminder
* due notification
* overdue notification
* timezone handling
* unsubscribe

### Deliverable

Users don't have to remember to open Lit-Sheet.

Lit-Sheet remembers for them.

---

# PHASE 10 — Analytics

Add:

* problems solved
* reviews completed
* retention rate
* streak
* mastered problems
* topic performance

### Deliverable

Users understand their preparation progress.

---

# PHASE 11 — Pattern Intelligence

Add:

* topic statistics
* weak topics
* retention by pattern
* difficulty analysis

Example:

> **Your weakest pattern is Dynamic Programming.**

---

# PHASE 12 — Import / Integrations

Add:

* LeetCode import
* browser extension
* GitHub integration
* CSV import

The browser extension is particularly valuable because it reduces the friction of recording problems.

---

# PHASE 13 — AI Layer

Only after the core product has usage.

Potential AI:

```text
Problem
 ↓
AI analyzes
 ↓
Suggested pattern
 ↓
Suggested key insight
 ↓
Suggested complexity
```

And:

> **Generate Cheat**

---

# PHASE 14 — Growth / Social

Potential features:

### Public profile

```text
Mozzic's Lit-Sheet

247 problems
83 mastered
12 day streak
```

### Shareable cheat sheets

```text
My Top 20 Two Pointer Cheats
```

### Study groups

Users can create:

> **Google Internship Prep — 30 Days**

with shared challenges.

But this is **far beyond MVP.**

---

# 42. MVP Definition

The MVP is officially complete when a new user can:

```text
Sign up
   ↓
Search "206"
   ↓
Select Reverse Linked List
   ↓
Write their insight
   ↓
Add complexity
   ↓
Save
   ↓
See it scheduled for review
   ↓
Return three days later
   ↓
Review it
   ↓
Mark "Remembered"
   ↓
See the next review automatically scheduled
```

If this works beautifully, **we have an MVP.**

Everything else is secondary.

---

# 43. Success Metrics

Don't obsess over total registrations.

The most important metric is:

### Weekly active reviewers

How many users actually return to review?

Other important metrics:

### Activation

Percentage of users who create their first Cheat.

### First-week retention

How many return after seven days?

### Review completion rate

```text
reviews completed
──────────────────
reviews due
```

### Retention

How many problems are successfully retained?

### Cheats per active user

Average number of problems tracked.

---

# 44. North Star Metric

I'd make the North Star:

> **Successful Reviews Completed**

Not:

> Problems added.

Because adding 500 problems means nothing if the user remembers none of them.

A successful review represents actual value.

---

# 45. Non-Goals for MVP

We explicitly do **not** build:

❌ AI tutor
❌ Social network
❌ Leaderboards
❌ Chatbot
❌ Full LeetCode replacement
❌ Code editor
❌ Competitive programming platform
❌ Complex gamification
❌ Interview simulator
❌ Mobile native apps
❌ Browser extension

Not yet.

---

# 46. Security & Privacy

User data should be isolated.

Users must only access their own:

* Cheats
* Notes
* Review history
* Preferences

Backend authorization must enforce ownership.

Never rely solely on frontend restrictions.

---

# 47. Performance Requirements

The application should feel instantaneous for common operations.

Target:

```text
Search autocomplete:
< 200ms

Dashboard:
< 1 second

Saving cheat:
< 500ms perceived response

Review submission:
< 500ms perceived response
```

Exact targets can be adjusted after measurement.

---

# 48. Mobile Requirements

The interface must work properly on:

* desktop
* tablet
* mobile

The most important mobile workflow:

```text
Open
 ↓
See due Cheats
 ↓
Review
 ↓
Done
```

No complicated navigation.

---

# 49. Accessibility

Support:

* keyboard navigation
* readable contrast
* semantic HTML
* focus states
* screen readers
* reduced motion
* accessible form labels

The color system **must not rely exclusively on color**.

For example:

```text
🔴 OVERDUE
```

rather than only making the card red.

---

# 50. Brand

## Name

# **Lit-Sheet**

Possible positioning:

> **Your LeetCode memory sheet.**

or:

> **Solved ≠ Remembered.**

My favorite:

# **Lit-Sheet**

### *Because solved doesn't mean remembered.*

The name can also naturally support terminology:

> "Add a Cheat."

> "Your Cheats are due."

> "Clear your Cheats."

> "You've got 7 Cheats waiting."

That gives the product its own language.

---

# 51. Final Product Architecture

Eventually, the whole thing looks like:

```text
                         LIT-SHEET
                             │
             ┌───────────────┴───────────────┐
             │                               │
         PROBLEMS                         USERS
             │                               │
     ┌───────┴───────┐               ┌───────┴───────┐
     │               │               │               │
   Search          Topics          Cheats          Reviews
                                     │               │
                                     └───────┬───────┘
                                             │
                                      SCHEDULING ENGINE
                                             │
                              ┌──────────────┼──────────────┐
                              │              │              │
                           Due Today      Upcoming       Overdue
                              │              │              │
                              └──────────────┼──────────────┘
                                             │
                                         REVIEW
                                             │
                              ┌──────────────┼──────────────┐
                              │              │              │
                         Remembered      Struggled       Forgot
                              │              │              │
                              └──────────────┼──────────────┘
                                             │
                                       RESCHEDULE
                                             │
                                         REPEAT
```

## The most important thing

**Don't start by building the whole diagram.**

Build the smallest loop first:

```text
Add problem
     ↓
Save cheat
     ↓
Wait / manipulate date
     ↓
Problem becomes due
     ↓
Review
     ↓
Remembered / Struggled / Forgot
     ↓
New review date
```

If **that loop feels addictive, fast and beautiful**, Lit-Sheet has a product.

If that loop isn't good, no amount of analytics, AI, streaks, email or social features will save it.

So the development journey should be **Phase 0 → Phase 1 → Phase 2...**, with each phase producing something testable before moving forward.
