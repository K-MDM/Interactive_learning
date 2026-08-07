-- ============================================================
-- Keeelai Optimized Browse Filters Stored Function
-- Function: get_browse_filters
-- Returns JSON matching the exact schema expected by /api/flutter/browse-filters
-- Run this in Supabase SQL Editor
-- ============================================================

-- Fast lookup composite indexes
CREATE INDEX IF NOT EXISTS idx_nct_content_type_note ON note_content_types(content_type_id, note_id);
CREATE INDEX IF NOT EXISTS idx_note_taxonomy_note_class ON note_taxonomy(note_id, class_id);
CREATE INDEX IF NOT EXISTS idx_note_taxonomy_note_subject ON note_taxonomy(note_id, subject_id);

CREATE OR REPLACE FUNCTION get_browse_filters(
  p_content_type_id UUID DEFAULT NULL,
  p_class_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_available_categories JSONB;
  v_has_others BOOLEAN := FALSE;
  v_others_count INT := 0;
  v_available_classes JSONB := '[]'::JSONB;
  v_has_all_classes BOOLEAN := FALSE;
  v_available_subjects JSONB := '[]'::JSONB;
  v_has_general_subject BOOLEAN := FALSE;
  v_total_notes INT := 0;
  v_categorized_count INT := 0;
BEGIN
  -- 1. Available Categories with note count
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', ct.id,
        'name', ct.name,
        'slug', ct.slug,
        'icon_emoji', ct.icon_emoji,
        'color_hex', ct.color_hex,
        'note_count', sub.cnt
      ) ORDER BY ct.sort_order
    ),
    '[]'::jsonb
  )
  INTO v_available_categories
  FROM content_types ct
  JOIN (
    SELECT content_type_id, COUNT(DISTINCT note_id) AS cnt
    FROM note_content_types
    GROUP BY content_type_id
  ) sub ON sub.content_type_id = ct.id
  WHERE sub.cnt > 0;

  -- Total & uncategorized notes count
  SELECT COUNT(*) INTO v_total_notes FROM notes;
  SELECT COUNT(DISTINCT note_id) INTO v_categorized_count FROM note_content_types;
  v_others_count := GREATEST(0, v_total_notes - v_categorized_count);
  v_has_others := (v_others_count > 0);

  -- 2. Available Classes (when p_content_type_id is passed)
  IF p_content_type_id IS NOT NULL THEN
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'slug', c.slug,
          'sort_order', c.sort_order
        ) ORDER BY c.sort_order
      ),
      '[]'::jsonb
    )
    INTO v_available_classes
    FROM (
      SELECT DISTINCT c.id, c.name, c.slug, c.sort_order
      FROM note_content_types nct
      JOIN note_taxonomy nt ON nt.note_id = nct.note_id
      JOIN classes c ON c.id = nt.class_id
      WHERE nct.content_type_id = p_content_type_id
        AND nt.class_id IS NOT NULL
    ) c;

    -- Check if there are notes in this category that don't have a class assigned (or no taxonomy entry)
    SELECT EXISTS (
      SELECT 1
      FROM note_content_types nct
      LEFT JOIN note_taxonomy nt ON nt.note_id = nct.note_id
      WHERE nct.content_type_id = p_content_type_id
        AND (nt.class_id IS NULL OR nt.id IS NULL)
    ) INTO v_has_all_classes;
  END IF;

  -- 3. Available Subjects (when p_content_type_id + p_class_id are passed)
  IF p_content_type_id IS NOT NULL AND p_class_id IS NOT NULL THEN
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'name', s.name,
          'slug', s.slug,
          'icon_emoji', s.icon_emoji,
          'sort_order', s.sort_order
        ) ORDER BY s.sort_order
      ),
      '[]'::jsonb
    )
    INTO v_available_subjects
    FROM (
      SELECT DISTINCT s.id, s.name, s.slug, s.icon_emoji, s.sort_order
      FROM note_content_types nct
      JOIN note_taxonomy nt ON nt.note_id = nct.note_id
      JOIN subjects s ON s.id = nt.subject_id
      WHERE nct.content_type_id = p_content_type_id
        AND nt.subject_id IS NOT NULL
        AND (
          p_class_id = 'all' 
          OR nt.class_id IS NULL 
          OR nt.class_id::text = p_class_id
        )
    ) s;

    -- Check if there are notes in this category & class without a subject assigned
    SELECT EXISTS (
      SELECT 1
      FROM note_content_types nct
      LEFT JOIN note_taxonomy nt ON nt.note_id = nct.note_id
      WHERE nct.content_type_id = p_content_type_id
        AND (
          p_class_id = 'all' 
          OR nt.class_id IS NULL 
          OR nt.class_id::text = p_class_id
        )
        AND (nt.subject_id IS NULL OR nt.id IS NULL)
    ) INTO v_has_general_subject;
  END IF;

  -- Return final response JSON object
  RETURN jsonb_build_object(
    'available_categories', v_available_categories,
    'has_others', v_has_others,
    'others_count', v_others_count,
    'available_classes', v_available_classes,
    'has_all_classes', v_has_all_classes,
    'available_subjects', v_available_subjects,
    'has_general_subject', v_has_general_subject
  );
END;
$$;
