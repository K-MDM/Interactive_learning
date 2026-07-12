-- ============================================================
-- Keeelai Taxonomy Migration
-- Creates: boards, classes, subjects, note_taxonomy
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. BOARDS (e.g., CBSE, ICSE, IB, State Board, Cambridge)
CREATE TABLE IF NOT EXISTS boards (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  sort_order INT  NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CLASSES (e.g., Grade 6, Grade 7 ... Grade 12)
CREATE TABLE IF NOT EXISTS classes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  sort_order INT  NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SUBJECTS (e.g., Physics, Chemistry, Biology, History)
CREATE TABLE IF NOT EXISTS subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  icon_emoji  TEXT,                -- e.g., "⚗️", "🔬", "📐"
  sort_order  INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. NOTE_TAXONOMY — many-to-many junction
--    One note can belong to multiple board + class + subject combos
CREATE TABLE IF NOT EXISTS note_taxonomy (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id    UUID NOT NULL REFERENCES notes(id)    ON DELETE CASCADE,
  board_id   UUID           REFERENCES boards(id)   ON DELETE CASCADE,
  class_id   UUID           REFERENCES classes(id)  ON DELETE CASCADE,
  subject_id UUID           REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Prevent exact duplicate tag combos on the same note
  UNIQUE(note_id, board_id, class_id, subject_id)
);

-- Indexes for fast Flutter filtering queries
CREATE INDEX IF NOT EXISTS idx_note_taxonomy_note    ON note_taxonomy(note_id);
CREATE INDEX IF NOT EXISTS idx_note_taxonomy_board   ON note_taxonomy(board_id);
CREATE INDEX IF NOT EXISTS idx_note_taxonomy_class   ON note_taxonomy(class_id);
CREATE INDEX IF NOT EXISTS idx_note_taxonomy_subject ON note_taxonomy(subject_id);

-- ============================================================
-- RLS POLICIES
-- Taxonomy metadata is public (needed for browse without login)
-- Only super_admin can modify taxonomy
-- ============================================================

ALTER TABLE boards       ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_taxonomy ENABLE ROW LEVEL SECURITY;

-- Public read for boards, classes, subjects
CREATE POLICY "boards_public_read"    ON boards    FOR SELECT USING (true);
CREATE POLICY "classes_public_read"   ON classes   FOR SELECT USING (true);
CREATE POLICY "subjects_public_read"  ON subjects  FOR SELECT USING (true);
CREATE POLICY "note_taxonomy_public_read" ON note_taxonomy FOR SELECT USING (true);

-- Super admin write access (uses service role from Next.js admin client)
-- These policies allow the service_role to bypass RLS entirely (default Supabase behavior)
-- No additional policy needed for admin writes — admin client uses service_role key

-- ============================================================
-- SEED: Common boards
-- ============================================================
INSERT INTO boards (name, slug, sort_order) VALUES
  ('CBSE',          'cbse',          1),
  ('ICSE',          'icse',          2),
  ('IB',            'ib',            3),
  ('Cambridge',     'cambridge',     4),
  ('State Board',   'state-board',   5)
ON CONFLICT (slug) DO NOTHING;

-- SEED: Common classes (Grade 1–12)
INSERT INTO classes (name, slug, sort_order) VALUES
  ('Grade 1',  'grade-1',  1),
  ('Grade 2',  'grade-2',  2),
  ('Grade 3',  'grade-3',  3),
  ('Grade 4',  'grade-4',  4),
  ('Grade 5',  'grade-5',  5),
  ('Grade 6',  'grade-6',  6),
  ('Grade 7',  'grade-7',  7),
  ('Grade 8',  'grade-8',  8),
  ('Grade 9',  'grade-9',  9),
  ('Grade 10', 'grade-10', 10),
  ('Grade 11', 'grade-11', 11),
  ('Grade 12', 'grade-12', 12)
ON CONFLICT (slug) DO NOTHING;

-- SEED: Common K-12 subjects
INSERT INTO subjects (name, slug, icon_emoji, sort_order) VALUES
  ('Physics',          'physics',          '⚡', 1),
  ('Chemistry',        'chemistry',        '⚗️', 2),
  ('Biology',          'biology',          '🔬', 3),
  ('Mathematics',      'mathematics',      '📐', 4),
  ('Geography',        'geography',        '🌍', 5),
  ('History',          'history',          '🏛️', 6),
  ('English',          'english',          '📚', 7),
  ('Environmental Science', 'env-science', '🌱', 8)
ON CONFLICT (slug) DO NOTHING;
