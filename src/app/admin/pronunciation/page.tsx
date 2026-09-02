'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, BarChart3, Check, ChevronRight, Globe2, Loader2, Mic2, Plus, RefreshCw, Save, Send, Trash2 } from 'lucide-react';

type Level = { id: string; title: string; description: string | null; sort_order: number };
type Topic = { id: string; level_id: string; title: string; description: string | null; sort_order: number };
type Exercise = { id?: string; type: 'word' | 'sentence' | 'passage'; english_text: string; meaning_en: string; example_en: string; segments: string[]; difficulty: number; sort_order: number };
type Lesson = { id: string; topic_id: string; title: string; instructions_en: string; status: 'draft' | 'published' | 'archived'; required_locales: string[]; sort_order: number; pronunciation_exercises: Exercise[] };
type Translation = { id: string; entity_type: string; entity_id: string; locale: string; field_name: string; translated_text: string; status: string };
type Metrics = { summary: { attempts: number; active_learners: number; average_score: number; retry_rate: number } };

const locales = [
  ['hi-IN', 'Hindi'], ['pa-IN', 'Punjabi'], ['mr-IN', 'Marathi'],
  ['bn-IN', 'Bengali'], ['ta-IN', 'Tamil'], ['te-IN', 'Telugu'],
] as const;

const blankExercise = (order: number): Exercise => ({
  type: 'word', english_text: '', meaning_en: '', example_en: '', segments: [], difficulty: 1, sort_order: order,
});

export default function PronunciationAdminPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<Level[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [editor, setEditor] = useState<Partial<Lesson> | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [levelTitle, setLevelTitle] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ error?: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace('/admin/login');
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'super_admin') return router.replace('/admin');
      const [levelsResponse, topicsResponse, lessonsResponse, metricsResponse] = await Promise.all([
        api('/api/super/pronunciation/levels'),
        api('/api/super/pronunciation/topics'),
        api('/api/super/pronunciation/lessons'),
        api('/api/super/pronunciation/metrics'),
      ]);
      setLevels(levelsResponse.levels || []);
      setTopics(topicsResponse.topics || []);
      setLessons(lessonsResponse.lessons || []);
      setMetrics(metricsResponse);
      setSelectedLevel((current) => current || levelsResponse.levels?.[0]?.id || '');
    } catch (error) {
      setMessage({ error: true, text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const task = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(task);
  }, [load]);

  const visibleTopics = useMemo(() => topics.filter((topic) => topic.level_id === selectedLevel), [topics, selectedLevel]);
  const activeTopic = visibleTopics.some((topic) => topic.id === selectedTopic) ? selectedTopic : visibleTopics[0]?.id || '';
  const visibleLessons = useMemo(() => lessons.filter((lesson) => lesson.topic_id === activeTopic), [lessons, activeTopic]);

  async function createLevel() {
    if (!levelTitle.trim()) return;
    await action(async () => {
      const result = await api('/api/super/pronunciation/levels', { method: 'POST', body: JSON.stringify({ title: levelTitle, sort_order: levels.length + 1 }) });
      setLevels((items) => [...items, result.level]);
      setSelectedLevel(result.level.id);
      setLevelTitle('');
    }, 'Level created');
  }

  async function createTopic() {
    if (!topicTitle.trim() || !selectedLevel) return;
    await action(async () => {
      const result = await api('/api/super/pronunciation/topics', { method: 'POST', body: JSON.stringify({ level_id: selectedLevel, title: topicTitle, sort_order: visibleTopics.length + 1 }) });
      setTopics((items) => [...items, result.topic]);
      setSelectedTopic(result.topic.id);
      setTopicTitle('');
    }, 'Topic created');
  }

  function newLesson() {
    if (!activeTopic) return;
    setTranslations([]);
    setEditor({
      topic_id: activeTopic, title: '', instructions_en: '', status: 'draft',
      required_locales: locales.map(([locale]) => locale), sort_order: visibleLessons.length + 1,
      pronunciation_exercises: [blankExercise(1)],
    });
  }

  function editLesson(lesson: Lesson) {
    setTranslations([]);
    const exercises = (lesson.pronunciation_exercises || []).map((exercise) => ({
      ...exercise,
      meaning_en: exercise.meaning_en || '',
      example_en: exercise.example_en || '',
      segments: Array.isArray(exercise.segments) ? exercise.segments : [],
    }));
    setEditor({
      ...lesson,
      pronunciation_exercises: exercises.length > 0 ? exercises : [blankExercise(1)],
    });
    if (lesson.id) void loadTranslations(lesson.id);
  }

  async function saveLesson() {
    if (!editor) return;
    await action(async () => {
      const updating = Boolean(editor.id);
      const exercises = editor.pronunciation_exercises || [];
      const payload = {
        ...editor,
        exercises,
      };
      const result = await api('/api/super/pronunciation/lessons', {
        method: updating ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      await load();
      if (!updating && result.lesson) editLesson(result.lesson);
    }, 'Lesson saved as draft');
  }

  async function generateTranslations() {
    if (!editor?.id) return setMessage({ error: true, text: 'Save the lesson before generating translations.' });
    await action(async () => {
      const result = await api(`/api/super/pronunciation/lessons/${editor.id}/translations`, {
        method: 'POST', body: JSON.stringify({ locales: editor.required_locales }),
      });
      if (result.failures?.length) throw new Error(result.failures.map((failure: { locale: string; error: string }) => `${failure.locale}: ${failure.error}`).join('; '));
      await loadTranslations(editor.id!);
    }, 'Translations generated and ready for review');
  }

  async function loadTranslations(id: string) {
    const result = await api(`/api/super/pronunciation/lessons/${id}/translations`);
    setTranslations(result.translations || []);
  }

  async function approveTranslation(translation: Translation) {
    if (!editor?.id) return;
    await action(async () => {
      await api(`/api/super/pronunciation/lessons/${editor.id}/translations`, {
        method: 'PUT', body: JSON.stringify({ translations: [{ id: translation.id, translated_text: translation.translated_text, approved: true }] }),
      });
      setTranslations((items) => items.map((item) => item.id === translation.id ? { ...item, status: 'approved' } : item));
    }, 'Translation approved');
  }

  async function approveAllTranslations() {
    if (!editor?.id || translations.length === 0) return;
    await action(async () => {
      await api(`/api/super/pronunciation/lessons/${editor.id}/translations`, {
        method: 'PUT',
        body: JSON.stringify({
          translations: translations.map((t) => ({ id: t.id, translated_text: t.translated_text, approved: true })),
        }),
      });
      setTranslations((items) => items.map((item) => ({ ...item, status: 'approved' })));
    }, 'All translations approved');
  }

  async function publishLesson() {
    if (!editor?.id) return;
    await action(async () => {
      await api(`/api/super/pronunciation/lessons/${editor.id}/publish`, { method: 'POST' });
      setEditor((value) => value ? { ...value, status: 'published' } : value);
      await load();
    }, 'Lesson published');
  }

  async function unpublishLesson() {
    if (!editor?.id) return;
    await action(async () => {
      await api(`/api/super/pronunciation/lessons/${editor.id}/publish`, { method: 'DELETE' });
      setEditor((value) => value ? { ...value, status: 'draft' } : value);
      await load();
    }, 'Lesson returned to draft');
  }

  async function deleteLesson(id: string) {
    if (!window.confirm('Delete this draft lesson and its exercises?')) return;
    await action(async () => {
      await api(`/api/super/pronunciation/lessons?id=${id}`, { method: 'DELETE' });
      setEditor(null);
      await load();
    }, 'Lesson deleted');
  }

  async function action(operation: () => Promise<void>, success: string) {
    setBusy(true); setMessage(null);
    try { await operation(); setMessage({ text: success }); }
    catch (error) { setMessage({ error: true, text: errorMessage(error) }); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="min-h-screen grid place-items-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100" aria-label="Back to admin"><ArrowLeft className="w-5 h-5" /></Link>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white grid place-items-center"><Mic2 className="w-5 h-5" /></div>
            <div><h1 className="font-extrabold text-lg">Pronunciation Studio</h1><p className="text-xs text-slate-500">Create, translate, review, and publish lessons</p></div>
          </div>
          <button onClick={load} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50" aria-label="Refresh"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-6 space-y-6">
        {message && <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${message.error ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>{message.text}</div>}
        {metrics && <section className="grid sm:grid-cols-4 gap-3">
          <Metric label="Attempts" value={metrics.summary.attempts} />
          <Metric label="Active learners" value={metrics.summary.active_learners} />
          <Metric label="Average score" value={`${metrics.summary.average_score}%`} />
          <Metric label="Retry rate" value={`${metrics.summary.retry_rate}%`} />
        </section>}

        <section className="grid lg:grid-cols-[240px_260px_1fr] gap-5 items-start">
          <Panel title="Levels">
            <InlineCreate value={levelTitle} onChange={setLevelTitle} onCreate={createLevel} placeholder="New level" />
            {levels.map((level) => <Selection key={level.id} active={selectedLevel === level.id} label={level.title} onClick={() => setSelectedLevel(level.id)} />)}
          </Panel>
          <Panel title="Topics">
            <InlineCreate value={topicTitle} onChange={setTopicTitle} onCreate={createTopic} placeholder="New topic" disabled={!selectedLevel} />
            {visibleTopics.map((topic) => <Selection key={topic.id} active={activeTopic === topic.id} label={topic.title} onClick={() => setSelectedTopic(topic.id)} />)}
          </Panel>
          <Panel title="Lessons" action={<button disabled={!activeTopic} onClick={newLesson} className="text-xs font-bold text-blue-600 disabled:opacity-40 flex items-center gap-1"><Plus className="w-4 h-4" /> Add lesson</button>}>
            {visibleLessons.length === 0 && <p className="text-sm text-slate-400 py-8 text-center">No lessons in this topic.</p>}
            {visibleLessons.map((lesson) => <button key={lesson.id} onClick={() => editLesson(lesson)} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-300 text-left">
              <span><span className="font-bold text-sm block">{lesson.title}</span><span className={`text-[10px] uppercase font-bold ${lesson.status === 'published' ? 'text-emerald-600' : 'text-amber-600'}`}>{lesson.status}</span></span><ChevronRight className="w-4 h-4 text-slate-400" />
            </button>)}
          </Panel>
        </section>

        {editor && <LessonEditor editor={editor} setEditor={setEditor} translations={translations} setTranslations={setTranslations} busy={busy}
          onSave={saveLesson} onGenerate={generateTranslations} onLoadTranslations={() => editor.id && loadTranslations(editor.id)}
          onApprove={approveTranslation} onApproveAll={approveAllTranslations} onPublish={publishLesson} onUnpublish={unpublishLesson}
          onDelete={() => editor.id && deleteLesson(editor.id)} />}
      </div>
    </main>
  );
}

function LessonEditor({ editor, setEditor, translations, setTranslations, busy, onSave, onGenerate, onLoadTranslations, onApprove, onApproveAll, onPublish, onUnpublish, onDelete }: {
  editor: Partial<Lesson>; setEditor: (value: Partial<Lesson>) => void; translations: Translation[]; setTranslations: (value: Translation[]) => void;
  busy: boolean; onSave: () => void; onGenerate: () => void; onLoadTranslations: () => void; onApprove: (value: Translation) => void;
  onApproveAll: () => void; onPublish: () => void; onUnpublish: () => void; onDelete: () => void;
}) {
  const exercises = editor.pronunciation_exercises || [];
  const updateExercise = (index: number, patch: Partial<Exercise>) => setEditor({ ...editor, pronunciation_exercises: exercises.map((exercise, position) => position === index ? { ...exercise, ...patch } : exercise) });
  const approvedCount = translations.filter((t) => t.status === 'approved').length;
  const allApproved = translations.length > 0 && approvedCount === translations.length;

  return <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
    <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-extrabold">{editor.id ? 'Edit lesson' : 'New lesson'}</h2><p className="text-xs text-slate-500">Published edits return the lesson to draft and stale its translations.</p></div>
      <div className="flex gap-2"><Action icon={<Save />} label="Save draft" onClick={onSave} disabled={busy} />{editor.id && (editor.status === 'published' ? <Action label="Unpublish" onClick={onUnpublish} disabled={busy} /> : <Action icon={<Send />} label="Publish" onClick={onPublish} disabled={busy} />)}</div>
    </div>
    <div className="grid md:grid-cols-2 gap-4"><Field label="Lesson title"><input value={editor.title || ''} onChange={(event) => setEditor({ ...editor, title: event.target.value })} className="input" /></Field><Field label="Student instructions (English)"><input value={editor.instructions_en || ''} onChange={(event) => setEditor({ ...editor, instructions_en: event.target.value })} className="input" /></Field></div>
    <Field label="Required regional languages"><div className="flex flex-wrap gap-2">{locales.map(([locale, label]) => <label key={locale} className="flex items-center gap-2 border rounded-lg px-3 py-2 text-xs font-semibold"><input type="checkbox" checked={(editor.required_locales || []).includes(locale)} onChange={(event) => setEditor({ ...editor, required_locales: event.target.checked ? [...(editor.required_locales || []), locale] : (editor.required_locales || []).filter((item) => item !== locale) })} />{label}</label>)}</div></Field>
    <div className="space-y-3"><div className="flex justify-between"><h3 className="font-extrabold">Exercises</h3><button onClick={() => setEditor({ ...editor, pronunciation_exercises: [...exercises, blankExercise(exercises.length + 1)] })} className="text-xs text-blue-600 font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> Add exercise</button></div>
      {exercises.map((exercise, index) => <div key={exercise.id || index} className="rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex justify-between"><select value={exercise.type} onChange={(event) => updateExercise(index, { type: event.target.value as Exercise['type'] })} className="input max-w-40"><option value="word">Word</option><option value="sentence">Sentence</option><option value="passage">Passage</option></select><button disabled={exercises.length === 1} onClick={() => setEditor({ ...editor, pronunciation_exercises: exercises.filter((_, position) => position !== index) })} className="text-rose-600 disabled:opacity-30"><Trash2 className="w-4 h-4" /></button></div>
        <textarea value={exercise.english_text} onChange={(event) => updateExercise(index, { english_text: event.target.value })} placeholder="English target text" className="input min-h-20" />
        <div className="grid md:grid-cols-2 gap-3"><input value={exercise.meaning_en} onChange={(event) => updateExercise(index, { meaning_en: event.target.value })} placeholder="English meaning for translation" className="input" /><input value={exercise.example_en} onChange={(event) => updateExercise(index, { example_en: event.target.value })} placeholder="English example" className="input" /></div>
        {exercise.type === 'passage' && <textarea value={exercise.segments.join('\n')} onChange={(event) => updateExercise(index, { segments: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })} placeholder="Recognition segments, one per line" className="input min-h-20" />}
      </div>)}
    </div>
    {editor.id && <div className="border-t pt-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Action icon={<Globe2 />} label="Generate translations" onClick={onGenerate} disabled={busy} />
          <Action icon={<RefreshCw />} label="Load review queue" onClick={onLoadTranslations} disabled={busy} />
          {translations.length > 0 && <Action icon={<Check />} label="Approve all" onClick={onApproveAll} disabled={busy} />}
        </div>
        {translations.length > 0 && (
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${allApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {approvedCount} / {translations.length} Approved
          </span>
        )}
      </div>
      {translations.map((translation, index) => <div key={translation.id} className="grid md:grid-cols-[140px_1fr_auto] gap-3 items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50">
        <div className="space-y-0.5">
          <span className="text-xs font-bold block">{translation.locale}</span>
          <span className="text-[11px] text-slate-500 block truncate">{translation.entity_type}.{translation.field_name}</span>
          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${translation.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{translation.status}</span>
        </div>
        <textarea value={translation.translated_text} onChange={(event) => setTranslations(translations.map((item, position) => position === index ? { ...item, translated_text: event.target.value } : item))} className="input min-h-16 bg-white" />
        <button onClick={() => onApprove(translation)} className={`p-2.5 rounded-xl border transition-colors ${translation.status === 'approved' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-300'}`} title={translation.status === 'approved' ? 'Approved' : 'Click to approve'}>
          <Check className="w-5 h-5" />
        </button>
      </div>)}
    </div>}
    {editor.id && editor.status !== 'published' && <div className="border-t pt-5"><button onClick={onDelete} className="text-xs font-bold text-rose-600 flex items-center gap-1"><Trash2 className="w-4 h-4" /> Delete draft lesson</button></div>}
  </section>;
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) { return <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm"><div className="flex justify-between items-center"><h2 className="font-extrabold">{title}</h2>{action}</div>{children}</div>; }
function Selection({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) { return <button onClick={onClick} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${active ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}>{label}</button>; }
function InlineCreate({ value, onChange, onCreate, placeholder, disabled }: { value: string; onChange: (value: string) => void; onCreate: () => void; placeholder: string; disabled?: boolean }) { return <div className="flex gap-2"><input disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && onCreate()} placeholder={placeholder} className="input min-w-0" /><button disabled={disabled} onClick={onCreate} className="p-2 rounded-lg bg-blue-600 text-white disabled:opacity-40"><Plus className="w-4 h-4" /></button></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="space-y-1.5 block"><span className="text-xs font-bold text-slate-600">{label}</span>{children}</label>; }
function Metric({ label, value }: { label: string; value: string | number }) { return <div className="bg-white border border-slate-200 rounded-xl p-4"><BarChart3 className="w-4 h-4 text-blue-600 mb-3" /><p className="text-2xl font-extrabold">{value}</p><p className="text-xs text-slate-500">{label}</p></div>; }
function Action({ icon, label, onClick, disabled }: { icon?: React.ReactElement; label: string; onClick: () => void; disabled?: boolean }) { return <button disabled={disabled} onClick={onClick} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">{icon && <span className="[&>svg]:w-4 [&>svg]:h-4">{icon}</span>}{label}</button>; }

async function api(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ? `${payload.error}${payload.missing ? `: ${payload.missing.join(', ')}` : ''}` : `Request failed (${response.status})`);
  return payload;
}
function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'Something went wrong'; }
