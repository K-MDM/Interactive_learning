-- ============================================================
-- Keeelai Full-Text Search Migration
-- Adds search_vector tsvector column to notes table
-- Run AFTER supabase_migration_taxonomy.sql
-- ============================================================

-- 1. Add the tsvector column
ALTER TABLE notes ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

-- 2. Backfill existing rows (title = weight A, description = weight B)
UPDATE notes
SET search_vector =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B');

-- 3. GIN index for fast FTS queries
CREATE INDEX IF NOT EXISTS idx_notes_fts ON notes USING GIN(search_vector);

-- 4. Auto-update trigger function
CREATE OR REPLACE FUNCTION notes_search_vector_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$;

-- 5. Attach trigger to notes table
DROP TRIGGER IF EXISTS notes_search_vector_trigger ON notes;
CREATE TRIGGER notes_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, description
  ON notes
  FOR EACH ROW
  EXECUTE FUNCTION notes_search_vector_update();
