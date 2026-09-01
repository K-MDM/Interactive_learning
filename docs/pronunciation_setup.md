# Pronunciation MVP Deployment

## 1. Apply the database migration

Run `supabase_migration_pronunciation.sql` against the same Supabase project used by `keeelai-platform`.

The migration creates:

- Levels, topics, lessons, exercises, translations, and attempts tables.
- Content, translation, and exercise enums.
- Query indexes and restrictive row-level security policies.
- `purge_expired_pronunciation_transcripts()` for the 90-day transcript policy.

Apply the migration before deploying the backend. The API routes expect all of these tables and columns to exist.

## 2. Configure translation

Set this server-only environment variable in every backend environment:

```text
GOOGLE_TRANSLATE_API_KEY=<Google Cloud Translation API key>
```

Do not prefix this variable with `NEXT_PUBLIC_`. Restrict the key to the Cloud Translation API and the backend's deployment environment where supported.

Translation generation is initiated by a super admin. Generated translations remain `pending_review` until explicitly approved. Publishing fails when a required translation is missing, stale, or unapproved.

## 3. Schedule transcript cleanup

Run the following database function at least once per day using Supabase Cron or the deployment's database scheduler:

```sql
select public.purge_expired_pronunciation_transcripts();
```

This removes transcript text and word-level details after 90 days while preserving numeric progress records.

## 4. Author content

1. Sign in as a `super_admin`.
2. Open `/admin/pronunciation`.
3. Create a level and topic.
4. Create a lesson with at least one word, sentence, or passage exercise.
5. Save the draft.
6. Generate translations.
7. Review and approve every required translation.
8. Publish the lesson.

Publishing automatically marks the lesson's parent topic and level as published. Editing source content returns the lesson to draft and marks affected translations stale.

## 5. Client release checks

- Web: serve the app over HTTPS because browser microphone access requires a secure context outside localhost.
- Android: verify microphone permission and an installed speech-recognition service.
- iOS: verify microphone and speech-recognition permission prompts.
- Test licence-JWT and Supabase-authenticated student flows separately.
- Confirm cached lessons remain readable when disconnected.
- Confirm disconnected attempt submissions enter the encrypted local retry queue and synchronize after reconnecting.

