const StandaloneQuiz = require('../models/StandaloneQuiz');
const StandaloneQuizSubmission = require('../models/StandaloneQuizSubmission');
const Class = require('../models/Class');

// Fisher-Yates shuffle → pick n random indices from array
function randomIndices(total, n) {
  const indices = Array.from({ length: total }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return n >= total ? indices : indices.slice(0, n);
}

// ──────────────────────────────────────────
//  TEACHER ENDPOINTS
// ──────────────────────────────────────────

exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await StandaloneQuiz.find({ createdBy: req.user.id })
      .populate('classId', 'name subject grade')
      .sort({ createdAt: -1 });
    const withCounts = await Promise.all(quizzes.map(async q => {
      const count = await StandaloneQuizSubmission.countDocuments({ quiz: q._id });
      return { ...q.toObject(), submissionCount: count };
    }));
    res.json({ success: true, count: withCounts.length, data: withCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const quiz = await StandaloneQuiz.findOne({ _id: req.params.id, createdBy: req.user.id })
      .populate('classId', 'name subject grade');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    const submissionCount = await StandaloneQuizSubmission.countDocuments({ quiz: quiz._id });
    res.json({ success: true, data: { ...quiz.toObject(), submissionCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getQuizResults = async (req, res) => {
  try {
    const quiz = await StandaloneQuiz.findOne({ _id: req.params.id, createdBy: req.user.id })
      .populate('classId', 'name subject grade');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    const submissions = await StandaloneQuizSubmission.find({ quiz: quiz._id })
      .sort({ score: -1, timeTakenSeconds: 1 });
    const ranked = submissions.map((s, idx) => ({ ...s.toObject(), rank: idx + 1 }));
    res.json({ success: true, quiz, data: ranked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const { title, classId, description, questions, timeLimitMinutes, questionsToShow, isPublished } = req.body;

    if (!title || !classId || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'title, classId, and questions are required' });
    }

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    const subject = cls.subject || cls.name;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text || !q.text.trim()) return res.status(400).json({ success: false, message: `Question ${i + 1} is missing text` });
      if (!Array.isArray(q.options) || q.options.length < 2) return res.status(400).json({ success: false, message: `Question ${i + 1} needs at least 2 options` });
      if (q.correctAnswer === undefined || q.correctAnswer === null) return res.status(400).json({ success: false, message: `Question ${i + 1} is missing correctAnswer` });
    }

    const qts = questionsToShow && questionsToShow > 0 ? Math.min(questionsToShow, questions.length) : 0;

    const quiz = await StandaloneQuiz.create({
      title, subject, classId, description, questions,
      questionsToShow: qts,
      timeLimitMinutes: timeLimitMinutes !== undefined ? timeLimitMinutes : 30,
      isPublished: isPublished !== undefined ? isPublished : false,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: quiz, message: 'Quiz created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await StandaloneQuiz.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.json({ success: true, data: quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await StandaloneQuiz.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    await StandaloneQuizSubmission.deleteMany({ quiz: req.params.id });
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────
//  STUDENT PUBLIC ENDPOINTS (no auth)
// ──────────────────────────────────────────

exports.studentGetQuizzes = async (req, res) => {
  try {
    const quizzes = await StandaloneQuiz.find({ isPublished: true })
      .select('title subject description timeLimitMinutes questionsToShow questions createdAt')
      .sort({ createdAt: -1 });
    const safe = quizzes.map(q => ({
      _id: q._id,
      title: q.title,
      subject: q.subject,
      description: q.description,
      timeLimitMinutes: q.timeLimitMinutes,
      totalQuestions: q.questions.length,
      questionsToShow: q.questionsToShow > 0 ? Math.min(q.questionsToShow, q.questions.length) : q.questions.length,
      createdAt: q.createdAt
    }));
    res.json({ success: true, count: safe.length, data: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Each student gets a randomly selected subset (questionsToShow) of questions.
// _questionIndices is sent to the client and must be echoed back on submit.
exports.studentGetQuiz = async (req, res) => {
  try {
    const quiz = await StandaloneQuiz.findOne({ _id: req.params.id, isPublished: true });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const { email } = req.query;
    let existingSubmission = null;
    if (email) {
      existingSubmission = await StandaloneQuizSubmission.findOne({ quiz: quiz._id, studentEmail: email.toLowerCase() });
    }

    // Already submitted → return full quiz with answers for review
    if (existingSubmission) {
      return res.json({ success: true, data: quiz.toObject(), submission: existingSubmission });
    }

    const totalQ = quiz.questions.length;
    const n = quiz.questionsToShow > 0 ? Math.min(quiz.questionsToShow, totalQ) : totalQ;
    const selectedIndices = randomIndices(totalQ, n);

    const sessionQuestions = selectedIndices.map(i => {
      const q = quiz.questions[i].toObject();
      const { correctAnswer, explanation, ...rest } = q;
      return rest;
    });

    const quizData = quiz.toObject();
    quizData.questions = sessionQuestions;
    quizData._questionIndices = selectedIndices; // echoed back on submit for grading

    res.json({ success: true, data: quizData, submission: null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.studentSubmitQuiz = async (req, res) => {
  try {
    const { studentEmail, studentName, answers, questionIndices, timeTakenSeconds } = req.body;
    if (!studentEmail || !studentName || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'studentEmail, studentName, and answers are required' });
    }

    const quiz = await StandaloneQuiz.findOne({ _id: req.params.id, isPublished: true });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found or not published' });

    const existing = await StandaloneQuizSubmission.findOne({ quiz: quiz._id, studentEmail: studentEmail.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already submitted this quiz', submission: existing });
    }

    const totalQ = quiz.questions.length;
    const n = quiz.questionsToShow > 0 ? Math.min(quiz.questionsToShow, totalQ) : totalQ;
    let indices = Array.isArray(questionIndices) && questionIndices.length === answers.length
      ? questionIndices
      : Array.from({ length: n }, (_, i) => i);

    let score = 0, totalPoints = 0;
    indices.forEach((qIdx, answerPos) => {
      const q = quiz.questions[qIdx];
      if (!q) return;
      totalPoints += q.points || 1;
      if (answers[answerPos] !== undefined && answers[answerPos] !== null && answers[answerPos] === q.correctAnswer) {
        score += q.points || 1;
      }
    });
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    const submission = await StandaloneQuizSubmission.create({
      quiz: quiz._id,
      studentEmail: studentEmail.toLowerCase(),
      studentName,
      answers,
      questionIndices: indices,
      score, totalPoints, percentage,
      timeTakenSeconds: timeTakenSeconds || 0
    });

    res.status(201).json({
      success: true,
      data: submission,
      quiz: quiz.toObject(),
      message: `Quiz submitted! You scored ${score}/${totalPoints} (${percentage}%)`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.studentGetScoreboard = async (req, res) => {
  try {
    const quiz = await StandaloneQuiz.findOne({ _id: req.params.id, isPublished: true })
      .select('title subject timeLimitMinutes questionsToShow');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    const submissions = await StandaloneQuizSubmission.find({ quiz: quiz._id })
      .sort({ score: -1, timeTakenSeconds: 1 }).lean();
    const ranked = submissions.map((s, i) => ({ ...s, rank: i + 1 }));
    res.json({ success: true, quiz, data: ranked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
