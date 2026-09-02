-- ============================================================================
-- Pronunciation Module Seed Data
-- ============================================================================
-- This script seeds production-ready test data for the Pronunciation MVP:
--   - 3 Difficulty Levels (Beginner, Intermediate, Advanced)
--   - 5 Thematic Topics (Greetings, Everyday Life, Travel, Conversation, Workplace)
--   - 5 Multi-Exercise Lessons (Words, Sentences, and Continuous Passages)
--   - 19 Exercises with meanings, examples, syllables, and difficulty ratings
--   - Complete Approved Translations for 6 regional Indian locales:
--     (hi-IN: Hindi, pa-IN: Punjabi, mr-IN: Marathi, bn-IN: Bengali, ta-IN: Tamil, te-IN: Telugu)
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. SEED LEVELS
-- ----------------------------------------------------------------------------
insert into public.pronunciation_levels (id, title, description, sort_order, status, created_at, updated_at)
values
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Level 1: Beginner Foundation',
    'Master basic English phonics, clear pronunciation of everyday words, and essential greetings.',
    1,
    'published',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002'::uuid,
    'Level 2: Intermediate Conversation',
    'Build fluency in full conversational sentences, everyday questions, travel, and social interactions.',
    2,
    'published',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000003'::uuid,
    'Level 3: Advanced & Professional',
    'Speak with confidence in professional settings, formal meetings, and articulate extended passages clearly.',
    3,
    'published',
    now(),
    now()
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order,
  status = excluded.status,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 2. SEED TOPICS
-- ----------------------------------------------------------------------------
insert into public.pronunciation_topics (id, level_id, title, description, sort_order, status, created_at, updated_at)
values
  -- Level 1 Topics
  (
    '00000000-0000-0000-0001-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Greetings & Introductions',
    'Learn how to pronounce common greetings, polite words, and introductory phrases.',
    1,
    'published',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0001-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Numbers, Time & Polite Requests',
    'Practice clear articulation of numbers, time expressions, and courtesy phrases.',
    2,
    'published',
    now(),
    now()
  ),
  -- Level 2 Topics
  (
    '00000000-0000-0000-0001-000000000003'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid,
    'Travel, Commute & Directions',
    'Essential pronunciation for navigating transit, asking directions, and ordering food.',
    1,
    'published',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0001-000000000004'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid,
    'Daily Activities & Interests',
    'Speak clearly about hobbies, daily routines, family, and personal preferences.',
    2,
    'published',
    now(),
    now()
  ),
  -- Level 3 Topics
  (
    '00000000-0000-0000-0001-000000000005'::uuid,
    '00000000-0000-0000-0000-000000000003'::uuid,
    'Workplace & Professional Meetings',
    'Advanced articulation for business presentations, collaborative discussions, and negotiations.',
    1,
    'published',
    now(),
    now()
  )
on conflict (id) do update set
  level_id = excluded.level_id,
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order,
  status = excluded.status,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 3. SEED LESSONS
-- ----------------------------------------------------------------------------
insert into public.pronunciation_lessons (id, topic_id, title, instructions_en, sort_order, status, required_locales, published_at, created_at, updated_at)
values
  -- Lesson 1 (Level 1, Topic 1)
  (
    '00000000-0000-0000-0002-000000000001'::uuid,
    '00000000-0000-0000-0001-000000000001'::uuid,
    'Everyday Greetings & Politeness',
    'Listen closely to each word and sentence. Speak clearly into your microphone at a steady pace.',
    1,
    'published',
    array['hi-IN', 'pa-IN', 'mr-IN', 'bn-IN', 'ta-IN', 'te-IN'],
    now(),
    now(),
    now()
  ),
  -- Lesson 2 (Level 1, Topic 2)
  (
    '00000000-0000-0000-0002-000000000002'::uuid,
    '00000000-0000-0000-0001-000000000002'::uuid,
    'Courtesy Phrases & Asking for Help',
    'Practice polite phrasing and correct emphasis on key syllables.',
    1,
    'published',
    array['hi-IN', 'pa-IN', 'mr-IN', 'bn-IN', 'ta-IN', 'te-IN'],
    now(),
    now(),
    now()
  ),
  -- Lesson 3 (Level 2, Topic 3)
  (
    '00000000-0000-0000-0002-000000000003'::uuid,
    '00000000-0000-0000-0001-000000000003'::uuid,
    'Navigating Transit & Asking Directions',
    'Pronounce full travel sentences with natural rhythm and intonation.',
    1,
    'published',
    array['hi-IN', 'pa-IN', 'mr-IN', 'bn-IN', 'ta-IN', 'te-IN'],
    now(),
    now(),
    now()
  ),
  -- Lesson 4 (Level 2, Topic 4)
  (
    '00000000-0000-0000-0002-000000000004'::uuid,
    '00000000-0000-0000-0001-000000000004'::uuid,
    'Hobbies, Routines & Daily Life',
    'Speak clearly about your favorite activities and routine schedules.',
    1,
    'published',
    array['hi-IN', 'pa-IN', 'mr-IN', 'bn-IN', 'ta-IN', 'te-IN'],
    now(),
    now(),
    now()
  ),
  -- Lesson 5 (Level 3, Topic 5)
  (
    '00000000-0000-0000-0002-000000000005'::uuid,
    '00000000-0000-0000-0001-000000000005'::uuid,
    'Business Communication & Meetings',
    'Focus on clear diction, professional cadence, and natural pauses in long sentences.',
    1,
    'published',
    array['hi-IN', 'pa-IN', 'mr-IN', 'bn-IN', 'ta-IN', 'te-IN'],
    now(),
    now(),
    now()
  )
on conflict (id) do update set
  topic_id = excluded.topic_id,
  title = excluded.title,
  instructions_en = excluded.instructions_en,
  sort_order = excluded.sort_order,
  status = excluded.status,
  required_locales = excluded.required_locales,
  published_at = excluded.published_at,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 4. SEED EXERCISES
-- ----------------------------------------------------------------------------
insert into public.pronunciation_exercises (id, lesson_id, type, english_text, meaning_en, example_en, segments, sort_order, difficulty, version, created_at, updated_at)
values
  -- Lesson 1 Exercises (Lesson ID: 00000000-0000-0000-0002-000000000001)
  (
    '00000000-0000-0000-0003-000000000001'::uuid,
    '00000000-0000-0000-0002-000000000001'::uuid,
    'word',
    'Hello',
    'A universal friendly greeting when meeting someone.',
    'Hello, it is nice to meet you.',
    '["Hel", "lo"]'::jsonb,
    1,
    1,
    1,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0003-000000000002'::uuid,
    '00000000-0000-0000-0002-000000000001'::uuid,
    'word',
    'Welcome',
    'A warm greeting extended to a guest or newcomer.',
    'Welcome to our interactive learning center.',
    '["Wel", "come"]'::jsonb,
    2,
    1,
    1,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0003-000000000003'::uuid,
    '00000000-0000-0000-0002-000000000001'::uuid,
    'sentence',
    'Good morning, how are you today?',
    'A polite greeting asking about someone wellbeing in the morning.',
    'Good morning, how are you today? I am doing great.',
    '["Good", "morning,", "how", "are", "you", "today?"]'::jsonb,
    3,
    1,
    1,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0003-000000000004'::uuid,
    '00000000-0000-0000-0002-000000000001'::uuid,
    'sentence',
    'Thank you very much for your kind support.',
    'Expressing sincere gratitude for help received.',
    'Thank you very much for your kind support during the project.',
    '["Thank", "you", "very", "much", "for", "your", "kind", "support."]'::jsonb,
    4,
    2,
    1,
    now(),
    now()
  ),

  -- Lesson 2 Exercises (Lesson ID: 00000000-0000-0000-0002-000000000002)
  (
    '00000000-0000-0000-0003-000000000005'::uuid,
    '00000000-0000-0000-0002-000000000002'::uuid,
    'word',
    'Please',
    'A polite word used when making requests or asking for something.',
    'Please come inside and have a seat.',
    '["Please"]'::jsonb,
    1,
    1,
    1,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0003-000000000006'::uuid,
    '00000000-0000-0000-0002-000000000002'::uuid,
    'word',
    'Appreciate',
    'To recognize the full worth of something or someone.',
    'I truly appreciate all your hard work.',
    '["Ap", "pre", "ci", "ate"]'::jsonb,
    2,
    2,
    1,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0003-000000000007'::uuid,
    '00000000-0000-0000-0002-000000000002'::uuid,
    'sentence',
    'Could you please help me find the nearest entrance?',
    'A polite request for directions to an entrance.',
    'Excuse me, could you please help me find the nearest entrance?',
    '["Could", "you", "please", "help", "me", "find", "the", "nearest", "entrance?"]'::jsonb,
    3,
    2,
    1,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0003-000000000008'::uuid,
    '00000000-0000-0000-0002-000000000002'::uuid,
    'passage',
    'Hello everyone. Welcome to our English class. Please take your seats, open your books to page five, and let us begin today lesson together.',
    'A short classroom introduction passage.',
    'Read aloud clearly with natural pauses at punctuation marks.',
    '[]'::jsonb,
    4,
    2,
    1,
    now(),
    now()
  ),

  -- Lesson 3 Exercises (Lesson ID: 00000000-0000-0000-0002-000000000003)
  (
    '00000000-0000-0000-0003-000000000009'::uuid,
    '00000000-0000-0000-0002-000000000003'::uuid,
    'word',
    'Destination',
    'The place to which someone or something is traveling.',
    'Our destination is the international airport terminal.',
    '["Des", "ti", "na", "tion"]'::jsonb,
    1,
    2,
    1,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0003-000000000010'::uuid,
    '00000000-0000-0000-0002-000000000003'::uuid,
    'word',
    'Reservation',
    'An arrangement to secure a seat, room, or booking in advance.',
    'I have a confirmed reservation for two people tonight.',
    '["Res", "er", "va", "tion"]'::jsonb,
    2,
    2,
    1,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0003-000000000011'::uuid,
    '00000000-0000-0000-0002-000000000003'::uuid,
    'sentence',
    'Which platform does the express train depart from?',
    'Asking railway staff for the departure platform number.',
    'Excuse me officer, which platform does the express train depart from?',
    '["Which", "platform", "does", "the", "express", "train", "depart", "from?"]'::jsonb,
    3,
    3,
    1,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0003-000000000012'::uuid,
    '00000000-0000-0000-0002-000000000003'::uuid,
    'passage',
    'The morning express train will arrive at platform number two in five minutes. Please stand behind the yellow safety line and keep your luggage with you at all times.',
    'An announcement at a train station for arriving passengers.',
    'Maintain a clear, announcer-like tone with crisp consonants.',
    '[]'::jsonb,
    4,
    3,
    1,
    now(),
    now()
  ),

  -- Lesson 4 Exercises (Lesson ID: 00000000-0000-0000-0002-000000000004)
  (
    '00000000-0000-0000-0003-000000000013'::uuid,
    '00000000-0000-0000-0002-000000000004'::uuid,
    'word',
    'Opportunity',
    'A favorable time or situation for doing something beneficial.',
    'Learning a new language opens up exciting opportunities.',
    '["Op", "por", "tu", "ni", "ty"]'::jsonb,
    1,
    3,
    1,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0003-000000000014'::uuid,
    '00000000-0000-0000-0002-000000000004'::uuid,
    'word',
    'Comfortable',
    'Providing physical ease, relaxation, or state of being comfortable.',
    'I feel very comfortable speaking in English now.',
    '["Com", "fort", "a", "ble"]'::jsonb,
    2,
    3,
    1,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0003-000000000015'::uuid,
    '00000000-0000-0000-0002-000000000004'::uuid,
    'sentence',
    'I enjoy reading interesting books and learning languages during my free time.',
    'Expressing personal interests and daily routines.',
    'In my free time, I enjoy reading interesting books and learning languages.',
    '["I", "enjoy", "reading", "interesting", "books", "and", "learning", "languages", "during", "my", "free", "time."]'::jsonb,
    3,
    3,
    1,
    now(),
    now()
  ),

  -- Lesson 5 Exercises (Lesson ID: 00000000-0000-0000-0002-000000000005)
  (
    '00000000-0000-0000-0003-000000000016'::uuid,
    '00000000-0000-0000-0002-000000000005'::uuid,
    'word',
    'Pronunciation',
    'The manner in which a word or language is articulated and spoken.',
    'Clear pronunciation ensures your audience understands your key message.',
    '["Pro", "nun", "ci", "a", "tion"]'::jsonb,
    1,
    4,
    1,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0003-000000000017'::uuid,
    '00000000-0000-0000-0002-000000000005'::uuid,
    'word',
    'Collaboration',
    'The act of working together with others to achieve shared goals.',
    'Cross-functional collaboration is vital for modern software engineering.',
    '["Col", "lab", "o", "ra", "tion"]'::jsonb,
    2,
    4,
    1,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0003-000000000018'::uuid,
    '00000000-0000-0000-0002-000000000005'::uuid,
    'sentence',
    'Let us schedule a follow up meeting tomorrow morning to finalize our strategic milestones.',
    'Proposing a business meeting to finalize project milestones.',
    'Let us schedule a follow up meeting tomorrow morning to review the quarterly roadmap.',
    '["Let", "us", "schedule", "a", "follow", "up", "meeting", "tomorrow", "morning", "to", "finalize", "our", "strategic", "milestones."]'::jsonb,
    3,
    4,
    1,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0003-000000000019'::uuid,
    '00000000-0000-0000-0002-000000000005'::uuid,
    'passage',
    'Good afternoon, colleagues. Today we are reviewing our quarterly milestones and discussing strategic initiatives for upcoming product releases. Let us collaborate closely to achieve outstanding results.',
    'A formal business meeting opening address.',
    'Deliver with professional pacing, steady volume, and distinct enunciation.',
    '[]'::jsonb,
    4,
    5,
    1,
    now(),
    now()
  )
on conflict (id) do update set
  lesson_id = excluded.lesson_id,
  type = excluded.type,
  english_text = excluded.english_text,
  meaning_en = excluded.meaning_en,
  example_en = excluded.example_en,
  segments = excluded.segments,
  sort_order = excluded.sort_order,
  difficulty = excluded.difficulty,
  version = excluded.version,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 5. SEED APPROVED TRANSLATIONS FOR ALL LOCALES
-- ----------------------------------------------------------------------------
-- Generates translations across:
--   hi-IN (Hindi), pa-IN (Punjabi), mr-IN (Marathi),
--   bn-IN (Bengali), ta-IN (Tamil), te-IN (Telugu)
-- Computes the exact SHA-256 hash required by the pronunciation verification logic.

create or replace function public._seed_pronunciation_translation(
  p_entity_type text,
  p_entity_id uuid,
  p_locale text,
  p_field_name text,
  p_source_text text,
  p_translated_text text
)
returns void
language plpgsql
as $$
declare
  v_source_hash text;
begin
  v_source_hash := encode(digest(trim(p_source_text), 'sha256'), 'hex');
  insert into public.pronunciation_translations (
    entity_type, entity_id, locale, field_name, translated_text, status, source_hash, created_at, updated_at
  )
  values (
    p_entity_type, p_entity_id, p_locale, p_field_name, p_translated_text, 'approved', v_source_hash, now(), now()
  )
  on conflict (entity_type, entity_id, locale, field_name) do update set
    translated_text = excluded.translated_text,
    status = 'approved',
    source_hash = excluded.source_hash,
    updated_at = now();
end;
$$;

do $$
declare
  l_rec record;
  t_rec record;
  les_rec record;
  ex_rec record;
begin
  -- --------------------------------------------------------------------------
  -- Translations for Levels
  -- --------------------------------------------------------------------------
  for l_rec in select id, title, description from public.pronunciation_levels loop
    if l_rec.id = '00000000-0000-0000-0000-000000000001'::uuid then
      perform public._seed_pronunciation_translation('level', l_rec.id, 'hi-IN', 'title', l_rec.title, 'स्तर 1: बुनियादी शुरुआत');
      perform public._seed_pronunciation_translation('level', l_rec.id, 'pa-IN', 'title', l_rec.title, 'ਪੱਧਰ 1: ਮੁੱਢਲੀ ਨੀਂਹ');
      perform public._seed_pronunciation_translation('level', l_rec.id, 'mr-IN', 'title', l_rec.title, 'पातळी 1: मूलभूत पाया');
      perform public._seed_pronunciation_translation('level', l_rec.id, 'bn-IN', 'title', l_rec.title, 'লেভেল ১: প্রাথমিক ভিত্তি');
      perform public._seed_pronunciation_translation('level', l_rec.id, 'ta-IN', 'title', l_rec.title, 'நிலை 1: தொடக்க நிலை');
      perform public._seed_pronunciation_translation('level', l_rec.id, 'te-IN', 'title', l_rec.title, 'స్థాయి 1: ప్రాథమిక పునాది');
    elsif l_rec.id = '00000000-0000-0000-0000-000000000002'::uuid then
      perform public._seed_pronunciation_translation('level', l_rec.id, 'hi-IN', 'title', l_rec.title, 'स्तर 2: मध्यम बातचीत');
      perform public._seed_pronunciation_translation('level', l_rec.id, 'pa-IN', 'title', l_rec.title, 'ਪੱਧਰ 2: ਵਿਚਕਾਰਲੀ ਗੱਲਬਾਤ');
      perform public._seed_pronunciation_translation('level', l_rec.id, 'mr-IN', 'title', l_rec.title, 'पातळी 2: संभाषण कौशल्य');
      perform public._seed_pronunciation_translation('level', l_rec.id, 'bn-IN', 'title', l_rec.title, 'লেভেল ২: মধ্যবর্তী কথোপকথন');
      perform public._seed_pronunciation_translation('level', l_rec.id, 'ta-IN', 'title', l_rec.title, 'நிலை 2: இடைநிலை உரையாடல்');
      perform public._seed_pronunciation_translation('level', l_rec.id, 'te-IN', 'title', l_rec.title, 'స్థాయి 2: మధ్యస్థ సంభాషణ');
    elsif l_rec.id = '00000000-0000-0000-0000-000000000003'::uuid then
      perform public._seed_pronunciation_translation('level', l_rec.id, 'hi-IN', 'title', l_rec.title, 'स्तर 3: उन्नत और व्यावसायिक');
      perform public._seed_pronunciation_translation('level', l_rec.id, 'pa-IN', 'title', l_rec.title, 'ਪੱਧਰ 3: ਉੱਨਤ ਅਤੇ ਪੇਸ਼ੇਵਰ');
      perform public._seed_pronunciation_translation('level', l_rec.id, 'mr-IN', 'title', l_rec.title, 'पातळी 3: प्रगत आणि व्यावसायिक');
      perform public._seed_pronunciation_translation('level', l_rec.id, 'bn-IN', 'title', l_rec.title, 'লেভেল ৩: উন্নত ও পেশাদার');
      perform public._seed_pronunciation_translation('level', l_rec.id, 'ta-IN', 'title', l_rec.title, 'நிலை 3: மேம்பட்ட மற்றும் தொழில்முறை');
      perform public._seed_pronunciation_translation('level', l_rec.id, 'te-IN', 'title', l_rec.title, 'స్థాయి 3: అధునాతన మరియు వృత్తిపరమైన');
    end if;
  end loop;

  -- --------------------------------------------------------------------------
  -- Translations for Topics
  -- --------------------------------------------------------------------------
  for t_rec in select id, title, description from public.pronunciation_topics loop
    if t_rec.id = '00000000-0000-0000-0001-000000000001'::uuid then
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'hi-IN', 'title', t_rec.title, 'अभिवादन और परिचय');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'pa-IN', 'title', t_rec.title, 'ਨਮਸਤੇ ਅਤੇ ਜਾਣ-ਪਛਾਣ');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'mr-IN', 'title', t_rec.title, 'अभिवादन आणि ओळख');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'bn-IN', 'title', t_rec.title, 'শুভেচ্ছা ও পরিচয়');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'ta-IN', 'title', t_rec.title, 'வணக்கங்களும் அறிமுகங்களும்');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'te-IN', 'title', t_rec.title, 'శుభాకాంక్షలు మరియు పరిచయాలు');
    elsif t_rec.id = '00000000-0000-0000-0001-000000000002'::uuid then
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'hi-IN', 'title', t_rec.title, 'संख्याएं, समय और शिष्टाचार');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'pa-IN', 'title', t_rec.title, 'ਗਿਣਤੀ, ਸਮਾਂ ਅਤੇ ਨਿਮਰਤਾ');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'mr-IN', 'title', t_rec.title, 'संख्या, वेळ आणि सौजन्य');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'bn-IN', 'title', t_rec.title, 'সংখ্যা, সময় ও ভদ্রতা');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'ta-IN', 'title', t_rec.title, 'எண்கள், நேரம் மற்றும் மரியாதை');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'te-IN', 'title', t_rec.title, 'సంఖ్యలు, సమయం మరియు మర్యాదలు');
    elsif t_rec.id = '00000000-0000-0000-0001-000000000003'::uuid then
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'hi-IN', 'title', t_rec.title, 'यात्रा, आवागमन और दिशाएं');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'pa-IN', 'title', t_rec.title, 'ਸਫ਼ਰ ਅਤੇ ਦਿਸ਼ਾਵਾਂ');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'mr-IN', 'title', t_rec.title, 'प्रवास आणि दिशा');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'bn-IN', 'title', t_rec.title, 'ভ্রমণ ও দিকনির্দেশনা');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'ta-IN', 'title', t_rec.title, 'பயணம் மற்றும் வழிகள்');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'te-IN', 'title', t_rec.title, 'ప్రయాణం మరియు దిశలు');
    elsif t_rec.id = '00000000-0000-0000-0001-000000000004'::uuid then
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'hi-IN', 'title', t_rec.title, 'दैनिक गतिविधियां और रुचियां');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'pa-IN', 'title', t_rec.title, 'ਰੋਜ਼ਾਨਾ ਗਤੀਵਿਧੀਆਂ ਅਤੇ ਸ਼ੌਕ');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'mr-IN', 'title', t_rec.title, 'दैनंदिन दिनक्रम आणि छंद');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'bn-IN', 'title', t_rec.title, 'দৈনন্দিন কাজ ও আগ্রহ');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'ta-IN', 'title', t_rec.title, 'தினசரி செயல்பாடுகள் மற்றும் விருப்பங்கள்');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'te-IN', 'title', t_rec.title, 'రోజువారీ కార్యకలాపాలు మరియు ఆసక్తులు');
    elsif t_rec.id = '00000000-0000-0000-0001-000000000005'::uuid then
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'hi-IN', 'title', t_rec.title, 'कार्यस्थल और व्यावसायिक बैठकें');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'pa-IN', 'title', t_rec.title, 'ਦਫ਼ਤਰ ਅਤੇ ਮੀਟਿੰਗਾਂ');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'mr-IN', 'title', t_rec.title, 'कामाची जागा आणि व्यावसायिक बैठका');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'bn-IN', 'title', t_rec.title, 'কর্মক্ষেত্র ও ব্যবসায়িক সভা');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'ta-IN', 'title', t_rec.title, 'பணியிடம் மற்றும் வணிக கூட்டங்கள்');
      perform public._seed_pronunciation_translation('topic', t_rec.id, 'te-IN', 'title', t_rec.title, 'కార్యాలయం మరియు సమావేశాలు');
    end if;
  end loop;

  -- --------------------------------------------------------------------------
  -- Translations for Lessons (Title & Instructions)
  -- --------------------------------------------------------------------------
  for les_rec in select id, title, instructions_en from public.pronunciation_lessons loop
    if les_rec.id = '00000000-0000-0000-0002-000000000001'::uuid then
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'hi-IN', 'title', les_rec.title, 'दैनिक अभिवादन और विनम्रता');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'hi-IN', 'instructions_en', les_rec.instructions_en, 'प्रत्येक शब्द और वाक्य को ध्यान से सुनें। माइक्रोफ़ोन में स्पष्ट रूप से बोलें।');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'pa-IN', 'title', les_rec.title, 'ਰੋਜ਼ਾਨਾ ਨਮਸਤੇ ਅਤੇ ਨਿਮਰਤਾ');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'pa-IN', 'instructions_en', les_rec.instructions_en, 'ਹਰ ਸ਼ਬਦ ਨੂੰ ਧਿਆਨ ਨਾਲ ਸੁਣੋ ਅਤੇ ਮਾਈਕ੍ਰੋਫੋਨ ਵਿੱਚ ਸਾਫ਼ ਬੋਲੋ।');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'mr-IN', 'title', les_rec.title, 'दैनंदिन अभिवादन आणि नम्रता');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'mr-IN', 'instructions_en', les_rec.instructions_en, 'प्रत्येक शब्द आणि वाक्य काळजीपूर्वक ऐका. स्पष्टपणे बोला.');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'bn-IN', 'title', les_rec.title, 'প্রতিদিনের শুভেচ্ছা ও বিনম্রতা');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'bn-IN', 'instructions_en', les_rec.instructions_en, 'প্রতিটি শব্দ মনোযোগ দিয়ে শুনুন এবং মাইক্রোফোনে স্পষ্টভাবে বলুন।');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'ta-IN', 'title', les_rec.title, 'தினசரி வணக்கங்களும் பணிவும்');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'ta-IN', 'instructions_en', les_rec.instructions_en, 'ஒவ்வொரு சொல்லையும் கவனமாகக் கேளுங்கள். தெளிவாகப் பேசுங்கள்.');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'te-IN', 'title', les_rec.title, 'రోజువారీ శుభాకాంక్షలు మరియు మర్యాద');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'te-IN', 'instructions_en', les_rec.instructions_en, 'ప్రతి పదాన్ని శ్రద్ధగా వినండి. మైక్రోఫోన్‌లో స్పష్టంగా మాట్లాడండి.');

    elsif les_rec.id = '00000000-0000-0000-0002-000000000002'::uuid then
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'hi-IN', 'title', les_rec.title, 'शिष्टाचार के वाक्य और मदद मांगना');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'hi-IN', 'instructions_en', les_rec.instructions_en, 'विनम्र वाक्यों और सही उच्चारण का अभ्यास करें।');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'pa-IN', 'title', les_rec.title, 'ਨਿਮਰ ਵਾਕ ਅਤੇ ਮਦਦ ਮੰਗਣਾ');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'pa-IN', 'instructions_en', les_rec.instructions_en, 'ਨਿਮਰ ਵਾਕਾਂ ਅਤੇ ਸਹੀ ਉਚਾਰਨ ਦਾ ਅਭਿਆਸ ਕਰੋ।');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'mr-IN', 'title', les_rec.title, 'सौजन्यपूर्ण वाक्ये आणि मदत मागणे');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'mr-IN', 'instructions_en', les_rec.instructions_en, 'नम्र वाक्ये आणि योग्य उच्चारांचा सराव करा.');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'bn-IN', 'title', les_rec.title, 'ভদ্র বাক্য এবং সাহায্য চাওয়া');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'bn-IN', 'instructions_en', les_rec.instructions_en, 'নম্র বাক্য এবং সঠিক উচ্চারণের অনুশীলন করুন।');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'ta-IN', 'title', les_rec.title, 'மரியாதை வாக்கியங்கள் மற்றும் உதவி கோருதல்');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'ta-IN', 'instructions_en', les_rec.instructions_en, 'பணிவான வாக்கியங்களையும் சரியான உச்சரிப்பையும் பயிற்சி செய்யுங்கள்.');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'te-IN', 'title', les_rec.title, 'మర్యాదపూర్వక వాక్యాలు మరియు సహాయం కోరడం');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'te-IN', 'instructions_en', les_rec.instructions_en, 'మర్యాదపూర్వక వాక్యాలు మరియు సరైన ఉచ్చారణను సాధన చేయండి.');

    elsif les_rec.id = '00000000-0000-0000-0002-000000000003'::uuid then
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'hi-IN', 'title', les_rec.title, 'सफ़र में आवागमन और रास्ते पूछना');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'hi-IN', 'instructions_en', les_rec.instructions_en, 'प्राकृतिक प्रवाह और सही लय के साथ यात्रा वाक्यों का उच्चारण करें।');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'pa-IN', 'title', les_rec.title, 'ਸਫ਼ਰ ਅਤੇ ਰਸਤੇ ਪੁੱਛਣਾ');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'pa-IN', 'instructions_en', les_rec.instructions_en, 'ਕੁਦਰਤੀ ਰਫ਼ਤਾਰ ਨਾਲ ਯਾਤਰਾ ਵਾਕ ਬੋਲੋ।');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'mr-IN', 'title', les_rec.title, 'प्रवास आणि दिशा विचारणे');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'mr-IN', 'instructions_en', les_rec.instructions_en, 'प्रवासाशी संबंधित वाक्यांचा योग्य लयीत सराव करा.');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'bn-IN', 'title', les_rec.title, 'ভ্রমণ ও পথ সন্ধান');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'bn-IN', 'instructions_en', les_rec.instructions_en, 'স্বাভাবিক গতিতে ভ্রমণ সম্পর্কিত বাক্য উচ্চারণ করুন।');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'ta-IN', 'title', les_rec.title, 'பயண வழிகள் மற்றும் விசாரிப்புகள்');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'ta-IN', 'instructions_en', les_rec.instructions_en, 'இயல்பான தாளத்துடன் பயண வாக்கியங்களை உச்சரிக்கவும்.');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'te-IN', 'title', les_rec.title, 'ప్రయాణం మరియు దారులు అడగడం');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'te-IN', 'instructions_en', les_rec.instructions_en, 'సహజమైన ఉచ్ఛారణతో ప్రయాణ వాక్యాలను పలకండి.');

    elsif les_rec.id = '00000000-0000-0000-0002-000000000004'::uuid then
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'hi-IN', 'title', les_rec.title, 'शौक, दिनचर्या और दैनिक जीवन');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'hi-IN', 'instructions_en', les_rec.instructions_en, 'अपनी पसंदीदा गतिविधियों और दिनचर्या के बारे में स्पष्ट रूप से बोलें।');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'pa-IN', 'title', les_rec.title, 'ਸ਼ੌਕ, ਰੁਟੀਨ ਅਤੇ ਰੋਜ਼ਾਨਾ ਜੀਵਨ');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'pa-IN', 'instructions_en', les_rec.instructions_en, 'ਆਪਣੇ ਸ਼ੌਕ ਅਤੇ ਰੋਜ਼ਾਨਾ ਕੰਮਾਂ ਬਾਰੇ ਸਪਸ਼ਟ ਬੋਲੋ।');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'mr-IN', 'title', les_rec.title, 'छंद, दिनक्रम आणि दैनंदिन जीवन');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'mr-IN', 'instructions_en', les_rec.instructions_en, 'तुमच्या आवडीनिवडी आणि दैनंदिन दिनक्रमाबद्दल स्पष्टपणे बोला.');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'bn-IN', 'title', les_rec.title, 'শখ, রুটিন ও প্রাত্যহিক জীবন');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'bn-IN', 'instructions_en', les_rec.instructions_en, 'আপনার প্রিয় কার্যকলাপ এবং রুটিন সম্পর্কে স্পষ্ট করে বলুন।');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'ta-IN', 'title', les_rec.title, 'விருப்பங்கள், நடைமுறைகள் மற்றும் வாழ்க்கை');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'ta-IN', 'instructions_en', les_rec.instructions_en, 'உங்கள் விருப்பங்கள் மற்றும் தினசரி பழக்கவழக்கங்கள் பற்றி தெளிவாகப் பேசுங்கள்.');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'te-IN', 'title', les_rec.title, 'అభిరుచులు, దినచర్య మరియు దైనందిన జీవితం');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'te-IN', 'instructions_en', les_rec.instructions_en, 'మీ అభిరుచులు మరియు రోజువారీ పనుల గురించి స్పష్టంగా మాట్లాడండి.');

    elsif les_rec.id = '00000000-0000-0000-0002-000000000005'::uuid then
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'hi-IN', 'title', les_rec.title, 'व्यावसायिक बातचीत और मीटिंग्स');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'hi-IN', 'instructions_en', les_rec.instructions_en, 'लंबे वाक्यों में स्पष्ट उच्चारण, पेशेवर प्रवाह और सही ठहराव पर ध्यान दें।');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'pa-IN', 'title', les_rec.title, 'ਕਾਰੋਬਾਰੀ ਗੱਲਬਾਤ ਅਤੇ ਮੀਟਿੰਗਾਂ');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'pa-IN', 'instructions_en', les_rec.instructions_en, 'ਪੇਸ਼ੇਵਰ ਅੰਦਾਜ਼ ਵਿੱਚ ਸਪਸ਼ਟ ਉਚਾਰਨ ਨਾਲ ਬੋਲੋ।');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'mr-IN', 'title', les_rec.title, 'व्यावसायिक संभाषण आणि बैठका');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'mr-IN', 'instructions_en', les_rec.instructions_en, 'व्यावसायिक संभाषण आणि योग्य उच्चारांवर भर द्या.');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'bn-IN', 'title', les_rec.title, 'ব্যবসায়িক যোগাযোগ ও সভা');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'bn-IN', 'instructions_en', les_rec.instructions_en, 'পেশাদার ভঙ্গিতে স্পষ্ট উচ্চারণ এবং সঠিক বিরতি বজায় রাখুন।');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'ta-IN', 'title', les_rec.title, 'வணிகத் தொடர்பு மற்றும் கூட்டங்கள்');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'ta-IN', 'instructions_en', les_rec.instructions_en, 'தொழில்முறை சூழலில் தெளிவான மற்றும் உறுதியான உச்சரிப்பை கடைபிடியுங்கள்.');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'te-IN', 'title', les_rec.title, 'వ్యాపార సంభాషణ మరియు సమావేశాలు');
      perform public._seed_pronunciation_translation('lesson', les_rec.id, 'te-IN', 'instructions_en', les_rec.instructions_en, 'వృత్తిపరమైన సంభాషణలో స్పష్టమైన ఉచ్చారణ మరియు సరైన విరామాలను పాటించండి.');
    end if;
  end loop;

  -- --------------------------------------------------------------------------
  -- Translations for Exercises (meaning_en)
  -- --------------------------------------------------------------------------
  for ex_rec in select id, meaning_en from public.pronunciation_exercises where meaning_en is not null loop
    if ex_rec.id = '00000000-0000-0000-0003-000000000001'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'किसी से मिलने पर किया जाने वाला सामान्य अभिवादन।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਕਿਸੇ ਨੂੰ ਮਿਲਣ ਵੇਲੇ ਵਰਤਿਆ ਜਾਣ ਵਾਲਾ ਸ਼ਬਦ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'भेटल्यावर केले जाणारे नमस्कार किंवा अभिवादन.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'কারো সাথে দেখা হলে শুভেচ্ছা জানানোর শব্দ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'சந்திக்கும் போது பயன்படுத்தப்படும் பொதுவான வணக்கம்.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'ఎవరినైనా కలిసినప్పుడు చెప్పే శుభాకాంక్ష.');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000002'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'अतिथि या नए व्यक्ति का आत्मीय स्वागत करना।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਕਿਸੇ ਮਹਿਮਾਨ ਦਾ ਨਿੱਘਾ ਸਵਾਗਤ ਕਰਨਾ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'पाहुण्याचे किंवा नवीन व्यक्तीचे स्वागत करणे.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'অতিথি বা নবাগতকে উষ্ণ অভ্যর্থনা জানানো।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'விருந்தினரை அன்புடன் வரவேற்றல்.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'అతిథిని ఆప్యాయంగా స్వాగతించడం.');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000003'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'सुबह के समय कुशलता पूछने का विनम्र अभिवादन।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਸਵੇਰ ਵੇਲੇ ਹਾਲ-ਚਾਲ ਪੁੱਛਣ ਵਾਲਾ ਵਾਕ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'सकाळी विचारपूस करण्यासाठी नम्र अभिवादन.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'সকালে কুশল বিনিময়ের জন্য ভদ্র বাক্য।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'காலையில் நலம் விசாரிக்கும் பண்பான வணக்கம்.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'ఉదయం కుశల ప్రశ్నలు అడిగే మర్యాదపూర్వక పలకరింపు.');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000004'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'मदद के लिए दिल से आभार व्यक्त करना।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਮਦਦ ਲਈ ਦਿਲੋਂ ਧੰਨਵਾਦ ਕਰਨਾ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'मदतीबद्दल मनःपूर्वक आभार मानणे.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'সাহায্যের জন্য আন্তরিক কৃতজ্ঞতা প্রকাশ করা।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'உதவிக்காக மனமார்ந்த நன்றி தெரிவித்தல்.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'సహాయానికి మనస్ఫూర్తిగా కృతజ్ఞతలు తెలపడం.');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000005'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'विनम्रता से कोई अनुरोध करने के लिए प्रयुक्त शब्द (कृपया)।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਨਿਮਰਤਾ ਨਾਲ ਬੇਨਤੀ ਕਰਨ ਲਈ ਵਰਤਿਆ ਜਾਣ ਵਾਲਾ ਸ਼ਬਦ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'विनंती करण्यासाठी वापरला जाणारा शब्द (कृपया).');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'অনুরোধ করার জন্য ব্যবহৃত ভদ্র শব্দ (দয়া করে)।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'தயவுசெய்து அல்லது பணிவாக கேட்க உதவும் சொல்.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'దయచేసి లేదా వినయంగా అడగడానికి ఉపయోగించే పదం.');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000006'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'किसी के कार्य या महत्व की सराहना करना।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਕਿਸੇ ਦੇ ਕੰਮ ਦੀ ਕਦਰ ਜਾਂ ਸ਼ਲਾਘਾ ਕਰਨਾ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'कोणाच्या कार्याचे किंवा गुणांचे कौतुक करणे.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'কারো কাজের প্রশংসা বা মূল্যায়ন করা।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'ஒருவரின் செயலை பாராட்டுதல் அல்லது மதித்தல்.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'ఎవరి పనినైనా మెచ్చుకోవడం లేదా అభినందించడం.');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000007'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'प्रवेश द्वार का पता पूछने का विनम्र अनुरोध।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਨੇੜਲੇ ਪ੍ਰਵੇਸ਼ ਦੁਆਰ ਦਾ ਪਤਾ ਪੁੱਛਣ ਦੀ ਬੇਨਤੀ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'जवळच्या प्रवेशद्वाराचा रस्ता विचारण्याची विनंती.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'নিকটতম প্রবেশপথ খুঁজে পেতে সাহায্যের অনুরোধ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'அருகிலுள்ள நுழைவாயிலைக் கண்டறிய உதவி கோருதல்.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'సమీప ప్రవేశ ద్వారాన్ని కనుగొనడానికి సహాయం కోరడం.');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000008'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'कक्षा की शुरुआत का एक छोटा परिच्छेद।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਕਲਾਸ ਸ਼ੁਰੂ ਕਰਨ ਦਾ ਇੱਕ ਛੋਟਾ ਪੈਰਾ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'वर्गाची सुरुवात करणारा एक छोटा परिच्छेद.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'ক্লাস শুরুর একটি সংক্ষিপ্ত অনুচ্ছেদ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'வகுப்பறை தொடக்கத்திற்கான ஒரு சிறிய பத்தி.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'తరగతి ప్రారంభానికి సంబంధించిన ఒక చిన్న గద్యం.');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000009'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'वह स्थान जहां कोई यात्रा कर रहा हो (गंतव्य)।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਉਹ ਸਥਾਨ ਜਿੱਥੇ ਪਹੁੰਚਣਾ ਹੋਵੇ (ਮੰਜ਼ਿਲ)।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'पोहोचण्याचे ठिकाण (मुक्काम/गंतव्य).');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'যে স্থানে পৌঁছাতে হবে (গন্তব্য)।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'சென்று சேர வேண்டிய இடம் (இலக்கு).');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'చేరుకోవాల్సిన ప్రదేశం (గమ్యస్థానం).');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000010'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'सीट या कमरे का पूर्व आरक्षण (बुकिंग)।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਸੀਟ ਜਾਂ ਕਮਰੇ ਦੀ ਪਹਿਲਾਂ ਤੋਂ ਬੁਕਿੰਗ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'जागेचे किंवा खोलीचे आगाऊ आरक्षण.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'আসন বা ঘরের পূর্ব সংরক্ষণ (বুকিং)।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'முன்பதிவு செய்தல்.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'ముందస్తు రిజర్వేషన్ లేదా బుకింగ్.');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000011'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'रेलवे स्टेशन पर ट्रेन का प्लेटफॉर्म नंबर पूछना।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਰੇਲਵੇ ਪਲੇਟਫਾਰਮ ਨੰਬਰ ਬਾਰੇ ਪੁੱਛਣਾ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'ट्रेन कोणत्या प्लॅटफॉर्मवरून सुटणार आहे ते विचारणे.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'ট্রেনের প্ল্যাটফর্ম নম্বর জিজ্ঞাসা করা।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'ரயில் புறப்படும் நடைமேடை எண்ணைக் கேட்டல்.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'రైలు ఏ ప్లాట్‌ఫారమ్ నుండి బయలుదేరుతుందో అడగడం.');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000012'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'ट्रेन आगमन की सार्वजनिक स्टेशन उद्घोषणा।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਸਟੇਸ਼ਨ ਉੱਤੇ ਰੇਲਗੱਡੀ ਆਉਣ ਦੀ ਅਨਾਊਂਸਮੈਂਟ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'रेल्वे स्थानकावरील प्रवाशांसाठीची उद्घोषणा.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'রেল স্টেশনে ট্রেন পৌঁছানোর ঘোষণা।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'ரயில் நிலைய பொது அறிவிப்பு.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'రైల్వే స్టేషన్‌లో ప్రయాణీకుల ప్రకటన.');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000013'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'कुछ लाभकारी करने का अनुकूल अवसर या मौका।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਕੁਝ ਚੰਗਾ ਕਰਨ ਦਾ ਸ਼ਾਨਦਾਰ ਮੌਕਾ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'प्रगतीची किंवा शिकण्याची चांगली संधी.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'কোনো ভালো কাজের সুযোগ বা সুবিধা।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'பயனுள்ளதைச் செய்வதற்கான நல்ல வாய்ப்பு.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'ఏదైనా మంచి పని చేయడానికి దొరికే చక్కని అవకాశం.');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000014'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'शारीरिक या मानसिक रूप से आरामदायक और सहज।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਆਰਾਮਦਾਇਕ ਅਤੇ ਸੁਖਾਵਾਂ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'शारीरिक व मानसिक सुख आणि आराम देणारे.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'শারীরিক ও মানসিকভাবে আরামদায়ক।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'சௌகரியமான மற்றும் வசதியான.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'సౌకర్యవంతమైన మరియు ప్రశాంతమైన.');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000015'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'व्यक्तिगत रुचियों और शौक के बारे में बताना।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਨਿੱਜੀ ਸ਼ੌਕ ਅਤੇ ਦਿਲਚਸਪੀਆਂ ਬਾਰੇ ਦੱਸਣਾ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'वैयक्तिक छंद आणि आवडींविषयी सांगणे.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'ব্যক্তিগত আগ্রহ ও শখ সম্পর্কে বলা।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'தனிப்பட்ட ஆர்வங்கள் மற்றும் பொழுதுபோக்குகளை விவரித்தல்.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'వ్యక్తిగత ఆసక్తులు మరియు అభిరుచుల గురించి చెప్పడం.');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000016'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'शब्दों को सही ढंग से बोलने की क्रिया या उच्चारण।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਸ਼ਬਦਾਂ ਨੂੰ ਸਹੀ ਤਰੀਕੇ ਨਾਲ ਬੋਲਣ ਦਾ ਢੰਗ (ਉਚਾਰਨ)।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'शब्दांचा अचूक उच्चार करण्याची पद्धत.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'শব্দ সঠিকভাবে উচ্চারণ করার ধরণ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'வார்த்தைகளை சரியாக உச்சரிக்கும் முறை.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'పదాలను సరైన పద్ధతిలో పలికే విధానం (ఉచ్చారణ).');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000017'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'किसी साझा लक्ष्य को पाने के लिए मिलकर काम करना (सहयोग)।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਸਾਂਝੇ ਟੀਚੇ ਲਈ ਮਿਲ ਕੇ ਕੰਮ ਕਰਨਾ (ਸਹਿਯੋਗ)।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'एकत्रितपणे काम करणे किंवा सहकार्य करणे.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'একসাথে কাজ করা বা যৌথ সহযোগিতা।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'ஒன்றிணைந்து செயல்படுதல் அல்லது ஒத்துழைப்பு.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'ఉమ్మడి లక్ష్యం కోసం కలిసి పనిచేయడం (సహకారం).');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000018'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'परियोजना के लक्ष्यों को पूरा करने के लिए बैठक का प्रस्ताव।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਕੰਮ ਦੀ ਸਮੀਖਿਆ ਲਈ ਮੀਟਿੰਗ ਤੈਅ ਕਰਨ ਦਾ ਪ੍ਰਸਤਾਵ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'प्रकल्पाच्या प्रगतीसाठी बैठकीचे नियोजन करणे.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'কাজের অগ্রগতি পর্যালোচনার জন্য সভার প্রস্তাব।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'திட்ட முன்னேற்றத்தை மதிப்பாய்வு செய்ய கூட்டம் ஏற்பாடு செய்தல்.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'ప్రాజెక్ట్ పురోగతిని సమీక్షించడానికి సమావేశాన్ని ప్రతిపాదించడం.');

    elsif ex_rec.id = '00000000-0000-0000-0003-000000000019'::uuid then
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'hi-IN', 'meaning_en', ex_rec.meaning_en, 'एक औपचारिक व्यावसायिक बैठक का उद्घाटन वक्तव्य।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'pa-IN', 'meaning_en', ex_rec.meaning_en, 'ਮੀਟਿੰਗ ਦੀ ਸ਼ੁਰੂਆਤ ਦਾ ਰਸਮੀ ਸੰਬੋਧਨ।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'mr-IN', 'meaning_en', ex_rec.meaning_en, 'औपचारिक व्यावसायिक बैठकीचे प्रास्ताविक भाषण.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'bn-IN', 'meaning_en', ex_rec.meaning_en, 'আনুষ্ঠানিক ব্যবসায়িক সভার উদ্বোধনী বক্তব্য।');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'ta-IN', 'meaning_en', ex_rec.meaning_en, 'முறைசார்ந்த வணிக கூட்ட தொடக்க உரை.');
      perform public._seed_pronunciation_translation('exercise', ex_rec.id, 'te-IN', 'meaning_en', ex_rec.meaning_en, 'వ్యాపార సమావేశం ప్రారంభ ప్రసంగం.');
    end if;
  end loop;

end $$;

-- Drop helper function once seed is finished
drop function if exists public._seed_pronunciation_translation(text, uuid, text, text, text, text);

-- ----------------------------------------------------------------------------
-- VERIFICATION SUMMARY
-- ----------------------------------------------------------------------------
select 'Levels seeded' as category, count(*) as count from public.pronunciation_levels
union all
select 'Topics seeded', count(*) from public.pronunciation_topics
union all
select 'Lessons seeded', count(*) from public.pronunciation_lessons
union all
select 'Exercises seeded', count(*) from public.pronunciation_exercises
union all
select 'Translations seeded', count(*) from public.pronunciation_translations;
