-- Lit-Sheet: users own questions, and every review is preserved.

create table if not exists users (
  id uuid primary key,
  email text unique not null,
  name text,
  password_hash text,
  timezone text not null default 'Africa/Lagos',
  created_at timestamptz not null default now()
);

-- Accounts created before passwords existed keep a null hash and cannot sign in.
alter table users add column if not exists password_hash text;

create table if not exists problems (
  id uuid primary key,
  leetcode_number integer unique not null,
  title text not null,
  slug text unique not null,
  difficulty text not null,
  topic text not null
);

create table if not exists questions (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  problem_id uuid not null references problems(id),
  key_insight text not null,
  notes text,
  time_complexity text,
  space_complexity text,
  interval_days integer not null default 1,
  review_count integer not null default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, problem_id)
);

create table if not exists reviews (
  id uuid primary key,
  question_id uuid not null references questions(id) on delete cascade,
  result text not null check (result in ('remembered', 'struggled', 'forgot')),
  previous_interval integer not null,
  new_interval integer not null,
  reviewed_at timestamptz not null default now()
);

create index if not exists questions_due_by_user on questions (user_id, next_review_at);
create index if not exists reviews_by_question on reviews (question_id, reviewed_at desc);

-- Google accounts. Password-only accounts keep a null google_id, and vice versa.
alter table users add column if not exists google_id text;

create unique index if not exists users_google_id_key on users (google_id);

-- The technique used, chosen per question because one problem has many valid
-- approaches. Distinct from problems.topic, which is the category.
alter table questions add column if not exists patterns text[] not null default '{}';

create index if not exists questions_patterns on questions using gin (patterns);
