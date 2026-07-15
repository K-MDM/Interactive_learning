-- ============================================================
-- Keeelai Content Types Taxonomy Migration
-- Creates: content_types, note_content_types
-- Run this in Supabase SQL Editor or migration tool
-- ============================================================

-- 1. CONTENT_TYPES (e.g., Game, Quiz, Flashcards, Lecture…)
CREATE TABLE IF NOT EXISTS content_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  icon_emoji  TEXT,            -- e.g., "🎮", "📝", "🃏"
  color_hex   TEXT,            -- e.g., "#6C63FF"
  sort_order  INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. NOTE_CONTENT_TYPES — many-to-many junction
CREATE TABLE IF NOT EXISTS note_content_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id         UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  content_type_id UUID NOT NULL REFERENCES content_types(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(note_id, content_type_id)  -- no duplicate mappings
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nct_note         ON note_content_types(note_id);
CREATE INDEX IF NOT EXISTS idx_nct_content_type ON note_content_types(content_type_id);

-- RLS
ALTER TABLE content_types      ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_content_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_types_public_read"      ON content_types      FOR SELECT USING (true);
CREATE POLICY "note_content_types_public_read" ON note_content_types FOR SELECT USING (true);

-- SEED: Default content types
INSERT INTO content_types (name, slug, icon_emoji, color_hex, sort_order) VALUES
  ('Lecture',       'lecture',       '📖', '#3B82F6', 1),
  ('Quiz',          'quiz',          '📝', '#8B5CF6', 2),
  ('Game',          'game',          '🎮', '#10B981', 3),
  ('Flashcards',    'flashcards',    '🃏', '#F59E0B', 4),
  ('Worksheet',     'worksheet',     '📋', '#EF4444', 5),
  ('Simulation',    'simulation',    '🔬', '#06B6D4', 6),
  ('Summary',       'summary',       '📌', '#6B7280', 7),
  ('Practice Test', 'practice-test', '✅', '#EC4899', 8)
ON CONFLICT (slug) DO NOTHING;
