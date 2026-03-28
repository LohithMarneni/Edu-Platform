import React, { useState, useEffect } from 'react';
import { Plus, Trophy, Clock, BookOpen, Users, Trash2, ToggleLeft, ToggleRight, ArrowLeft, RefreshCw } from 'lucide-react';

const TEACHER_BASE = 'http://localhost:5001/api';

const JSON_TEMPLATE = `[
  {
    "text": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Rome"],
    "correctAnswer": 2,
    "explanation": "Paris is the capital and largest city of France.",
    "points": 1
  },
  {
    "text": "Which planet is closest to the Sun?",
    "options": ["Venus", "Mercury", "Earth", "Mars"],
    "correctAnswer": 1,
    "explanation": "Mercury is the closest planet to the Sun.",
    "points": 1
  }
]`;

const TeacherQuiz = () => {
  const [view, setView] = useState('list'); // 'list' | 'create' | 'results'
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Teacher classes for dropdown
  const [classes, setClasses] = useState([]);

  // Form state
  const [form, setForm] = useState({
    title: '', classId: '', description: '', timeLimitMinutes: 30, questionsToShow: 0, isPublished: false
  });
  const [jsonInput, setJsonInput] = useState(JSON_TEMPLATE);
  const [jsonError, setJsonError] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState([]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const authHeader = () => {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${TEACHER_BASE}/standalone-quizzes`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) setQuizzes(data.data || []);
    } catch { showToast('Failed to load quizzes', 'error'); }
    finally { setLoading(false); }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${TEACHER_BASE}/classes`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) setClasses(data.data || []);
    } catch {}
  };

  useEffect(() => { fetchQuizzes(); fetchClasses(); }, []);

  const validateJson = (raw) => {
    setJsonError('');
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) { setJsonError('Must be a JSON array of questions'); return; }
      for (let i = 0; i < parsed.length; i++) {
        const q = parsed[i];
        if (!q.text?.trim()) { setJsonError(`Q${i+1}: "text" is required`); return; }
        if (!Array.isArray(q.options) || q.options.length < 2) { setJsonError(`Q${i+1}: "options" must be array with ≥2 items`); return; }
        if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
          setJsonError(`Q${i+1}: "correctAnswer" must be a valid option index (0–${q.options.length-1})`); return;
        }
      }
      setParsedQuestions(parsed);
      return parsed;
    } catch (e) { setJsonError('Invalid JSON: ' + e.message); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.classId) { showToast('Please select a class', 'error'); return; }
    const questions = validateJson(jsonInput);
    if (!questions || jsonError) return;
    if (questions.length === 0) { setJsonError('Add at least 1 question'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${TEACHER_BASE}/standalone-quizzes`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ ...form, questions })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Quiz created! 🎉');
        setForm({ title: '', classId: '', description: '', timeLimitMinutes: 30, questionsToShow: 0, isPublished: false });
        setJsonInput(JSON_TEMPLATE);
        setView('list');
        await fetchQuizzes();
      } else {
        showToast(data.message || 'Failed to create', 'error');
      }
    } catch { showToast('Error creating quiz', 'error'); }
    finally { setSaving(false); }
  };

  const handleTogglePublish = async (quiz) => {
    try {
      const res = await fetch(`${TEACHER_BASE}/standalone-quizzes/${quiz._id}`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ isPublished: !quiz.isPublished })
      });
      const data = await res.json();
      if (data.success) {
        setQuizzes(prev => prev.map(q => q._id === quiz._id ? data.data : q));
        showToast(data.data.isPublished ? 'Quiz published — students can now take it!' : 'Quiz unpublished');
      }
    } catch { showToast('Toggle failed', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz and all submissions? This cannot be undone.')) return;
    try {
      const res = await fetch(`${TEACHER_BASE}/standalone-quizzes/${id}`, { method: 'DELETE', headers: authHeader() });
      const data = await res.json();
      if (data.success) { setQuizzes(prev => prev.filter(q => q._id !== id)); showToast('Quiz deleted'); }
    } catch { showToast('Delete failed', 'error'); }
  };

  const handleViewResults = async (quiz) => {
    setSelectedQuiz(quiz);
    setView('results');
    try {
      const res = await fetch(`${TEACHER_BASE}/standalone-quizzes/${quiz._id}/results`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) setResults(data.data || []);
    } catch { showToast('Failed to load results', 'error'); }
  };

  const formatTime = (s) => {
    if (!s && s !== 0) return '—';
    const m = Math.floor(s / 60), sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const rankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // ── RESULTS VIEW ──
  if (view === 'results' && selectedQuiz) {
    return (
      <div className="max-w-5xl mx-auto">
        {toast && <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>{toast.msg}</div>}
        <button onClick={() => { setView('list'); setResults([]); }} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Quizzes
        </button>

        {/* Quiz Info */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
          <h1 className="text-2xl font-bold mb-1">{selectedQuiz.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-violet-200">
            <span>📚 {selectedQuiz.subject}</span>
            <span>❓ {selectedQuiz.questions?.length} questions</span>
            <span>⏱ {selectedQuiz.timeLimitMinutes === 0 ? 'No limit' : `${selectedQuiz.timeLimitMinutes} min limit`}</span>
            <span>👥 {results.length} submissions</span>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Scoreboard</h2>
            <span className="text-sm text-gray-500">Ranked by score, then by time taken</span>
          </div>
          {results.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No submissions yet. Share this quiz with your students!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Student</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-2 text-center">%</div>
                <div className="col-span-2 text-center">Time</div>
                <div className="col-span-1 text-center">Date</div>
              </div>
              {results.map((sub) => (
                <div key={sub._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors ${sub.rank <= 3 ? 'bg-gradient-to-r from-yellow-50/30 to-transparent' : ''}`}>
                  <div className="col-span-1 text-xl font-bold">{rankMedal(sub.rank)}</div>
                  <div className="col-span-4">
                    <p className="font-semibold text-gray-900">{sub.studentName}</p>
                    <p className="text-xs text-gray-400">{sub.studentEmail}</p>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-lg font-bold text-gray-900">{sub.score}</span>
                    <span className="text-gray-400 text-sm">/{sub.totalPoints}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${sub.percentage >= 80 ? 'bg-emerald-100 text-emerald-700' : sub.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {sub.percentage}%
                    </span>
                  </div>
                  <div className="col-span-2 text-center text-sm text-gray-600">{formatTime(sub.timeTakenSeconds)}</div>
                  <div className="col-span-1 text-xs text-gray-400 text-center">{new Date(sub.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── CREATE VIEW ──
  if (view === 'create') {
    return (
      <div className="max-w-4xl mx-auto">
        {toast && <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>{toast.msg}</div>}
        <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Quizzes
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
            <h1 className="text-2xl font-bold">Create New Quiz</h1>
            <p className="text-violet-200 text-sm mt-1">Design a quiz for your students with MCQ questions</p>
          </div>

          <form onSubmit={handleCreate} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quiz Title <span className="text-red-500">*</span></label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required
                  placeholder="e.g. Physics Chapter 5 – Forces"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Class <span className="text-red-500">*</span></label>
                <select value={form.classId} onChange={e => setForm(f => ({...f, classId: e.target.value}))} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 text-sm bg-white">
                  <option value="">— Select a class —</option>
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>{c.name} {c.subject ? `(${c.subject})` : ''} {c.grade ? `• ${c.grade}` : ''}</option>
                  ))}
                </select>
                {classes.length === 0 && <p className="text-xs text-amber-600 mt-1">No classes found. Create a class first.</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2}
                  placeholder="Brief description of this quiz..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 text-sm resize-none" />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Time Limit (minutes, 0 = no limit)</label>
                  <input type="number" min="0" value={form.timeLimitMinutes} onChange={e => setForm(f => ({...f, timeLimitMinutes: +e.target.value}))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Questions to show per student</label>
                  <input type="number" min="0" value={form.questionsToShow} onChange={e => setForm(f => ({...f, questionsToShow: +e.target.value}))}
                    placeholder="0 = show all"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 text-sm" />
                  {(() => {
                    const pool = parsedQuestions.length;
                    const qts = form.questionsToShow;
                    if (pool === 0) return <p className="text-xs text-gray-400 mt-1">Add questions first to see the preview.</p>;
                    if (qts === 0 || qts >= pool) return <p className="text-xs text-emerald-600 mt-1">✅ Students will see all {pool} questions.</p>;
                    return <p className="text-xs text-violet-600 mt-1">🎲 Students will see {qts} random questions from a pool of {pool}.</p>;
                  })()}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">Publish immediately?</span>
                  <button type="button" onClick={() => setForm(f => ({...f, isPublished: !f.isPublished}))} className="flex items-center gap-1.5">
                    {form.isPublished ? <ToggleRight className="w-8 h-8 text-violet-600" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
                    <span className={`text-sm font-medium ${form.isPublished ? 'text-violet-600' : 'text-gray-500'}`}>{form.isPublished ? 'Yes' : 'No'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* JSON Questions Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Questions (JSON format) <span className="text-red-500">*</span></label>
                <button type="button" onClick={() => validateJson(jsonInput)} className="text-xs bg-violet-50 text-violet-700 px-3 py-1 rounded-full hover:bg-violet-100 font-medium">
                  Validate JSON
                </button>
              </div>

              {/* Format guide */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3 text-xs text-blue-800">
                <p className="font-bold mb-1">📋 JSON Structure Guide:</p>
                <p>Each question must have: <code className="bg-blue-100 px-1 rounded">text</code>, <code className="bg-blue-100 px-1 rounded">options</code> (array of 2–4 strings), <code className="bg-blue-100 px-1 rounded">correctAnswer</code> (index 0–3), optional <code className="bg-blue-100 px-1 rounded">explanation</code> and <code className="bg-blue-100 px-1 rounded">points</code> (default 1).</p>
              </div>

              <textarea value={jsonInput} onChange={e => { setJsonInput(e.target.value); setJsonError(''); setParsedQuestions([]); }} rows={18}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 text-xs font-mono resize-y"
                spellCheck={false} />

              {jsonError && <p className="mt-2 text-red-600 text-xs font-medium">{jsonError}</p>}
              {parsedQuestions.length > 0 && !jsonError && (
                <p className="mt-2 text-emerald-600 text-xs font-medium">✅ {parsedQuestions.length} question{parsedQuestions.length !== 1 ? 's' : ''} validated successfully</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setView('list')} className="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-medium text-sm">Cancel</button>
              <button type="submit" disabled={saving || !!jsonError}
                className="flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-xl hover:bg-violet-700 disabled:opacity-50 font-semibold text-sm">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Quiz
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──
  const totalSubmissions = quizzes.reduce((a, q) => a + (q.submissionCount || 0), 0);
  const published = quizzes.filter(q => q.isPublished).length;

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
          <p className="text-gray-500 text-sm mt-0.5">Create subject quizzes and view student scoreboard</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchQuizzes} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => setView('create')} className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl hover:bg-violet-700 font-semibold text-sm shadow-sm">
            <Plus className="w-4 h-4" /> Create Quiz
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Quizzes', value: quizzes.length, icon: '🧩', color: 'violet' },
          { label: 'Published', value: published, icon: '✅', color: 'emerald' },
          { label: 'Total Submissions', value: totalSubmissions, icon: '📊', color: 'blue' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quiz List */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" /></div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <div className="text-5xl mb-4">🧩</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No quizzes yet</h3>
          <p className="text-gray-500 mb-5">Create your first quiz and publish it for students to take.</p>
          <button onClick={() => setView('create')} className="inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl hover:bg-violet-700 font-semibold text-sm">
            <Plus className="w-4 h-4" /> Create First Quiz
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map(q => (
            <div key={q._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="p-5 flex items-center gap-5">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${q.isPublished ? 'bg-violet-100' : 'bg-gray-100'}`}>
                  🧩
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{q.title}</h3>
                    <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${q.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {q.isPublished ? '✅ Published' : '📝 Draft'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{q.subject}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {q.questions?.length || 0} total</span>
                    {q.questionsToShow > 0 && q.questionsToShow < (q.questions?.length || 0) && (
                      <span className="flex items-center gap-1 text-violet-600">🎲 {q.questionsToShow} shown/student</span>
                    )}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {q.timeLimitMinutes === 0 ? 'No limit' : `${q.timeLimitMinutes} min`}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {q.submissionCount || 0} submissions</span>
                    <span>{new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleTogglePublish(q)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${q.isPublished ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                    {q.isPublished ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                    {q.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => handleViewResults(q)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-lg text-xs font-medium">
                    <Trophy className="w-3.5 h-3.5" /> Results
                  </button>
                  <button onClick={() => handleDelete(q._id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherQuiz;
