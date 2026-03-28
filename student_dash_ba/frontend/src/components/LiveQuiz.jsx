import React, { useState, useEffect, useRef } from 'react';
import {
  TrophyIcon, ClockIcon, AcademicCapIcon, CheckCircleIcon, XCircleIcon,
  ArrowLeftIcon, PlayIcon, UsersIcon, ChevronRightIcon, LightBulbIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const TEACHER_BASE = 'http://localhost:5001/api';

const getStudent = () => {
  try { const u = JSON.parse(localStorage.getItem('user') || '{}'); return { email: (u.email || '').toLowerCase(), name: u.name || u.fullName || u.email?.split('@')[0] || 'Student' }; }
  catch { return { email: '', name: 'Student' }; }
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const LiveQuiz = () => {
  const [view, setView] = useState('list'); // 'list' | 'intro' | 'quiz' | 'results' | 'scoreboard'
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizDetail, setQuizDetail] = useState(null); // with questions (no answers)
  const [quizIndices, setQuizIndices] = useState([]); // random question indices from server
  const [submission, setSubmission] = useState(null); // after submit
  const [scoreboard, setScoreboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Quiz-taking state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]); // chosen option index per question
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const timerRef = useRef(null);

  const student = getStudent();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (view === 'quiz' && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      }), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [view, quizDetail]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${TEACHER_BASE}/student-quizzes`);
      const data = await res.json();
      if (data.success) setQuizzes(data.data || []);
    } catch { toast.error('Failed to load quizzes'); }
    finally { setLoading(false); }
  };

  const handleStartQuiz = async (quiz) => {
    setSelectedQuiz(quiz);
    setView('intro');
    // Fetch full quiz with questions (answers hidden)
    try {
      const url = `${TEACHER_BASE}/student-quizzes/${quiz._id}${student.email ? `?email=${encodeURIComponent(student.email)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.submission) {
        // Already submitted
        setSubmission(data.submission);
        await fetchScoreboard(quiz._id);
        setView('results');
        return;
      }
      if (data.success) {
        setQuizDetail(data.data);
        setQuizIndices(data.data._questionIndices || []);
      }
    } catch { toast.error('Failed to load quiz'); }
  };

  const beginQuiz = () => {
    setCurrentQ(0);
    setAnswers(new Array(quizDetail.questions.length).fill(null));
    setSelected(null);
    setConfirmed(false);
    setStartTime(Date.now());
    if (quizDetail.timeLimitMinutes > 0) {
      setTimeLeft(quizDetail.timeLimitMinutes * 60);
    } else {
      setTimeLeft(0);
    }
    setView('quiz');
  };

  const handleSelectOption = (idx) => {
    if (confirmed) return;
    setSelected(idx);
  };

  const handleConfirm = () => {
    if (selected === null) { toast.error('Please select an answer first'); return; }
    const updated = [...answers];
    updated[currentQ] = selected;
    setAnswers(updated);
    setConfirmed(true);
  };

  const handleNext = () => {
    if (currentQ + 1 < quizDetail.questions.length) {
      setCurrentQ(currentQ + 1);
      setSelected(answers[currentQ + 1] ?? null);
      setConfirmed(answers[currentQ + 1] !== null);
    } else {
      handleSubmit(false);
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    clearInterval(timerRef.current);
    const finalAnswers = [...answers];
    if (!autoSubmit && selected !== null) finalAnswers[currentQ] = selected;

    const timeTakenSeconds = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    setSubmitting(true);
    try {
      const res = await fetch(`${TEACHER_BASE}/student-quizzes/${selectedQuiz._id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: student.email,
          studentName: student.name,
          answers: finalAnswers,
          questionIndices: quizIndices.length > 0 ? quizIndices : undefined,
          timeTakenSeconds
        })
      });
      const data = await res.json();
      if (data.success || data.submission) {
        const sub = data.data || data.submission;
        setSubmission(sub);
        setQuizDetail(data.quiz || quizDetail); // now has correct answers
        await fetchScoreboard(selectedQuiz._id);
        setView('results');
      } else {
        toast.error(data.message || 'Submission failed');
      }
    } catch { toast.error('Error submitting quiz'); }
    finally { setSubmitting(false); }
  };

  const fetchScoreboard = async (quizId) => {
    try {
      const res = await fetch(`${TEACHER_BASE}/student-quizzes/${quizId}/scoreboard`);
      const data = await res.json();
      if (data.success) setScoreboard(data.data || []);
    } catch {}
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const rankMedal = (r) => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`;

  // ── LIST ─────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <AcademicCapIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Live Quizzes</h1>
          <p className="text-gray-500 mt-1">Take quizzes published by your teachers and see where you rank!</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" /></div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
            <div className="text-5xl mb-4">🧩</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No quizzes available yet</h3>
            <p className="text-gray-500">Your teacher hasn't published any quizzes yet. Check back later!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map(q => (
              <div key={q._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all cursor-pointer"
                onClick={() => handleStartQuiz(q)}>
                <div className="p-5 flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-2xl flex-shrink-0">🧩</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{q.title}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{q.subject}</span>
                      <span className="flex items-center gap-1"><AcademicCapIcon className="w-3 h-3" />
                        {q.questionsToShow && q.questionsToShow < q.totalQuestions
                          ? <>{q.questionsToShow} of {q.totalQuestions} questions (random)</>  
                          : <>{q.questionsToShow || q.totalQuestions || 0} questions</> }
                      </span>
                      <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {q.timeLimitMinutes === 0 ? 'No time limit' : `${q.timeLimitMinutes} min`}</span>
                    </div>
                    {q.description && <p className="text-xs text-gray-400 mt-1">{q.description}</p>}
                  </div>
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors">
                      <PlayIcon className="w-4 h-4" /> Start
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── INTRO (quiz loaded, show details before starting) ─────────
  if (view === 'intro' && quizDetail) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 font-medium text-sm">
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </button>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white text-center">
            <div className="text-4xl mb-4">🧩</div>
            <h1 className="text-2xl font-bold mb-2">{quizDetail.title}</h1>
            <p className="text-violet-200 text-sm">{quizDetail.subject}</p>
          </div>
          <div className="p-6 space-y-4">
            {quizDetail.description && <p className="text-gray-600 text-sm text-center">{quizDetail.description}</p>}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Questions', value: quizDetail.questions?.length, icon: '❓' },
                { label: 'Time Limit', value: quizDetail.timeLimitMinutes === 0 ? 'None' : `${quizDetail.timeLimitMinutes} min`, icon: '⏱' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">📌 Instructions:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Select one answer per question and confirm it before moving on.</li>
                <li>You can only submit the quiz once — answers cannot be changed after confirmation.</li>
                {quizDetail.timeLimitMinutes > 0 && <li>The quiz will auto-submit when the timer runs out.</li>}
              </ul>
            </div>
            <button onClick={beginQuiz} className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700 transition-colors">
              <PlayIcon className="w-5 h-5" /> Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ TAKING ───────────────────────────────────────────────
  if (view === 'quiz' && quizDetail) {
    const q = quizDetail.questions[currentQ];
    const progress = ((currentQ) / quizDetail.questions.length) * 100;
    const timeRunning = quizDetail.timeLimitMinutes > 0;
    const timerDanger = timeLeft < 60 && timeRunning;

    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-2 bg-violet-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm text-gray-500 font-medium flex-shrink-0">{currentQ + 1}/{quizDetail.questions.length}</span>
          {timeRunning && (
            <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${timerDanger ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-600'}`}>
              <ClockIcon className="w-4 h-4" /> {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-3">Question {currentQ + 1}</p>
          <h2 className="text-lg font-bold text-gray-900 mb-6">{q.text}</h2>

          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <button key={idx} onClick={() => handleSelectOption(idx)} disabled={confirmed}
                className={`w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all font-medium text-sm ${
                  confirmed ? 'cursor-default' : 'cursor-pointer hover:border-violet-400 hover:bg-violet-50'
                } ${
                  selected === idx && !confirmed ? 'border-violet-500 bg-violet-50 text-violet-900' :
                  confirmed && selected === idx ? 'border-violet-500 bg-violet-50 text-violet-900' :
                  'border-gray-200 text-gray-700'
                }`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  selected === idx ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>{OPTION_LETTERS[idx]}</span>
                {opt}
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <span className="text-xs text-gray-400">Select an answer then confirm</span>
            {!confirmed ? (
              <button onClick={handleConfirm} disabled={selected === null}
                className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700 disabled:opacity-40">
                Confirm Answer
              </button>
            ) : (
              <button onClick={handleNext} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700">
                {currentQ + 1 < quizDetail.questions.length ? 'Next Question →' : (submitting ? 'Submitting...' : 'Submit Quiz 🎯')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────
  if (view === 'results' && submission) {
    const myRank = scoreboard.findIndex(s => s.studentEmail === student.email) + 1;
    // Get correct answers from quizDetail (returned after submission)
    const questions = quizDetail?.questions || selectedQuiz?.questions || [];

    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Score Card */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-8 text-white text-center mb-6 shadow-xl">
          <div className="text-6xl mb-4">
            {submission.percentage >= 80 ? '🏆' : submission.percentage >= 60 ? '✅' : '💪'}
          </div>
          <h1 className="text-3xl font-bold mb-2">{submission.score}/{submission.totalPoints} correct</h1>
          <p className="text-violet-200 text-lg">{submission.percentage}% score</p>
          {myRank > 0 && <p className="text-violet-300 text-sm mt-2">{rankMedal(myRank)} You ranked #{myRank} out of {scoreboard.length} students</p>}
        </div>

        {/* Answer Review */}
        {questions.length > 0 && questions[0].correctAnswer !== undefined && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Answer Review</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {questions.map((q, i) => {
                const userAnswer = submission.answers[i];
                const isCorrect = userAnswer === q.correctAnswer;
                return (
                  <div key={i} className="p-4">
                    <div className="flex items-start gap-3 mb-2">
                      {isCorrect ? <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /> : <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                      <p className="text-sm font-medium text-gray-900">{i+1}. {q.text}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 ml-8 text-xs">
                      {q.options.map((opt, idx) => (
                        <div key={idx} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                          idx === q.correctAnswer ? 'bg-emerald-50 text-emerald-700 font-semibold' :
                          idx === userAnswer && !isCorrect ? 'bg-red-50 text-red-700' :
                          'text-gray-500'
                        }`}>
                          <span className="font-bold">{OPTION_LETTERS[idx]}.</span> {opt}
                          {idx === q.correctAnswer && ' ✓'}
                          {idx === userAnswer && !isCorrect && ' ✗'}
                        </div>
                      ))}
                    </div>
                    {q.explanation && <p className="ml-8 mt-2 text-xs text-gray-500 italic"><LightBulbIcon className="w-3 h-3 inline mr-1" />{q.explanation}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scoreboard */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-yellow-500" />
            <h2 className="font-bold text-gray-900">Scoreboard</h2>
          </div>
          {scoreboard.length === 0 ? (
            <p className="p-8 text-center text-gray-400 text-sm">Loading...</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {scoreboard.map((s, i) => (
                <div key={s._id} className={`flex items-center gap-4 px-5 py-3.5 ${s.studentEmail === student.email ? 'bg-violet-50 border-l-4 border-violet-500' : ''}`}>
                  <span className="text-xl w-8 text-center">{rankMedal(s.rank)}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${s.studentEmail === student.email ? 'text-violet-900' : 'text-gray-900'}`}>
                      {s.studentName} {s.studentEmail === student.email && '(You)'}
                    </p>
                  </div>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${s.percentage >= 80 ? 'bg-emerald-100 text-emerald-700' : s.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{s.percentage}%</span>
                  <span className="text-xs text-gray-400">{Math.floor(s.timeTakenSeconds / 60)}m {s.timeTakenSeconds % 60}s</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <button onClick={() => { setView('list'); fetchQuizzes(); }} className="flex items-center gap-2 text-violet-600 hover:text-violet-800 font-medium text-sm">
            <ArrowLeftIcon className="w-4 h-4" /> Back to Quiz List
          </button>
        </div>
      </div>
    );
  }

  // Loading state for intro before quizDetail arrives
  return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
    </div>
  );
};

export default LiveQuiz;
