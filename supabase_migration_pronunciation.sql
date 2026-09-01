-- Pronunciation Learning MVP
-- Apply after the existing profile and licensing migrations.

create extension if not exists pgcrypto;

do $$ begin
  create type public.pronunciation_content_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pronunciation_exercise_type as enum ('word', 'sentence', 'passage');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pronunciation_translation_status as enum
    ('generating', 'pending_review', 'approved', 'stale', 'failed');
exception when duplicate_object then null;
end $$;

create table if not exists public.pronunciation_levels (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text,
  sort_order integer not null default 1 check (sort_order > 0),
  status public.pronunciation_content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pronunciation_topics (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references public.pronunciation_levels(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text,
  sort_order integer not null default 1 check (sort_order > 0),
  status public.pronunciation_content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pronunciation_lessons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.pronunciation_topics(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 180),
  instructions_en text not null default '',
  sort_order integer not null default 1 check (sort_order > 0),
  status public.pronunciation_content_status not null default 'draft',
  required_locales text[] not null default array['hi-IN', 'pa-IN', 'mr-IN', 'bn-IN', 'ta-IN', 'te-IN'],
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pronunciation_exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.pronunciation_lessons(id) on delete cascade,
  type public.pronunciation_exercise_type not null,
  english_text text not null check (char_length(trim(english_text)) between 1 and 5000),
  meaning_en text,
  example_en text,
  segments jsonb not null default '[]'::jsonb check (jsonb_typeof(segments) = 'array'),
  sort_order integer not null default 1 check (sort_order > 0),
  difficulty smallint not null default 1 check (difficulty between 1 and 5),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pronunciation_translations (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('level', 'topic', 'lesson', 'exercise')),
  entity_id uuid not null,
  locale text not null check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  field_name text not null,
  translated_text text not null default '',
  status public.pronunciation_translation_status not null default 'pending_review',
  source_hash text not null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_id, locale, field_name)
);

create table if not exists public.pronunciation_attempts (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null,
  student_key text not null,
  profile_id uuid references public.profiles(id) on delete set null,
  licence_id uuid references public.licences(id) on delete set null,
  exercise_id uuid not null references public.pronunciation_exercises(id) on delete restrict,
  exercise_version integer not null check (exercise_version > 0),
  transcript text,
  normalized_transcript text,
  confidence numeric(5,4) check (confidence is null or confidence between 0 and 1),
  score smallint not null check (score between 0 and 100),
  word_results jsonb not null default '[]'::jsonb check (jsonb_typeof(word_results) = 'array'),
  duration_ms integer not null check (duration_ms between 0 and 600000),
  algorithm_version text not null,
  platform_category text not null check (platform_category in ('web', 'android', 'ios')),
  created_at timestamptz not null default now(),
  transcript_expires_at timestamptz not null default (now() + interval '90 days'),
  unique (student_key, idempotency_key)
);

create index if not exists pronunciation_topics_level_idx
  on public.pronunciation_topics(level_id, sort_order);
create index if not exists pronunciation_lessons_topic_idx
  on public.pronunciation_lessons(topic_id, sort_order);
create index if not exists pronunciation_exercises_lesson_idx
  on public.pronunciation_exercises(lesson_id, sort_order);
create index if not exists pronunciation_translations_lookup_idx
  on public.pronunciation_translations(entity_type, entity_id, locale, status);
create index if not exists pronunciation_attempts_student_idx
  on public.pronunciation_attempts(student_key, created_at desc);
create index if not exists pronunciation_attempts_exercise_idx
  on public.pronunciation_attempts(exercise_id, created_at desc);
create index if not exists pronunciation_attempts_expiry_idx
  on public.pronunciation_attempts(transcript_expires_at)
  where transcript is not null;

alter table public.pronunciation_levels enable row level security;
alter table public.pronunciation_topics enable row level security;
alter table public.pronunciation_lessons enable row level security;
alter table public.pronunciation_exercises enable row level security;
alter table public.pronunciation_translations enable row level security;
alter table public.pronunciation_attempts enable row level security;

-- Client access is intentionally routed through authenticated Next.js APIs.
-- Service-role access bypasses RLS. These policies additionally allow a signed-in
-- super admin to use Supabase tooling without granting students direct table access.
do $$ begin
  create policy pronunciation_super_admin_levels on public.pronunciation_levels
    for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'))
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy pronunciation_super_admin_topics on public.pronunciation_topics
    for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'))
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy pronunciation_super_admin_lessons on public.pronunciation_lessons
    for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'))
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy pronunciation_super_admin_exercises on public.pronunciation_exercises
    for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'))
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy pronunciation_super_admin_translations on public.pronunciation_translations
    for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'))
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy pronunciation_super_admin_attempts on public.pronunciation_attempts
    for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));
exception when duplicate_object then null;
end $$;

create or replace function public.purge_expired_pronunciation_transcripts()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare affected bigint;
begin
  update public.pronunciation_attempts
  set transcript = null, normalized_transcript = null, word_results = '[]'::jsonb
  where transcript_expires_at <= now() and transcript is not null;
  get diagnostics affected = row_count;
  return affected;
end;
$$;
