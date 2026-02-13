const { Quiz } = require('../models/Quiz');
const { CourseProgress } = require('../models/Progress');

// @desc    Get all quizzes for a course
// @route   GET /api/quizzes
// @access  Private
exports.getQuizzes = async (req, res, next) => {
  try {
    const { subject, difficulty, courseId } = req.query;
    
    let query = { isPublished: true };
    if (subject) {
      query.subject = subject;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (courseId) {
      query.course = courseId;
    }

    const quizzes = await Quiz.find(query)
      .populate('course', 'name category')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Return basic quiz data without complex attempt processing for now
    const quizzesWithAttempts = quizzes.map(quiz => {
      return {
        ...quiz.toObject(),
        userAttempt: null,
        totalAttempts: 0,
        averageScore: 0
      };
    });

    res.status(200).json({
      success: true,
      count: quizzesWithAttempts.length,
      data: quizzesWithAttempts
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting quizzes',
      error: error.message
    });
  }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('course', 'name category')
      .populate('createdBy', 'name email');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Get user's attempt data
    const userAttempt = quiz.attempts && Array.isArray(quiz.attempts) 
      ? quiz.attempts.find(attempt => 
          attempt && attempt.user && attempt.user.toString() === req.user._id.toString()
        )
      : null;

    res.status(200).json({
      success: true,
      data: {
        ...quiz.toObject(),
        userAttempt: userAttempt || null,
        totalAttempts: quiz.attempts.length
      }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting quiz',
      error: error.message
    });
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/attempt
// @access  Private
exports.submitQuizAttempt = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Create attempt record
    const attempt = {
      user: req.user._id,
      answers: answers,
      score: score,
      completedAt: new Date(),
      timeSpent: req.body.timeSpent || 0
    };

    // Add attempt to quiz
    quiz.attempts.push(attempt);
    await quiz.save();

    // Update course progress if this is a course quiz
    if (quiz.course) {
      await updateCourseProgress(req.user._id, quiz.course, score);
    }

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        attempt: attempt,
        score: score,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        passed: score >= quiz.passingScore
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting quiz',
      error: error.message
    });
  }
};

// @desc    Get quiz results
// @route   GET /api/quizzes/:id/results
// @access  Private
exports.getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const userAttempt = quiz.attempts && Array.isArray(quiz.attempts)
      ? quiz.attempts.find(attempt => 
          attempt && attempt.user && attempt.user.toString() === req.user._id.toString()
        )
      : null;

    if (!userAttempt) {
      return res.status(404).json({
        success: false,
        message: 'No attempt found for this quiz'
      });
    }

    // Get detailed results
    const results = quiz.questions.map((question, index) => {
      const userAnswer = userAttempt.answers[index];
      const isCorrect = userAnswer === question.correctAnswer;

      return {
        question: question.question,
        options: question.options,
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation
      };
    });

    res.status(200).json({
      success: true,
      data: {
        attempt: userAttempt,
        results: results,
        score: userAttempt.score,
        passed: userAttempt.score >= quiz.passingScore
      }
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting quiz results',
      error: error.message
    });
  }
};

// Helper function to update course progress
async function updateCourseProgress(userId, courseId, score) {
  try {
    const progress = await CourseProgress.findOne({
      user: userId,
      course: courseId
    });

    if (progress) {
      // Update quiz scores
      if (!progress.quizScores) {
        progress.quizScores = [];
      }
      
      progress.quizScores.push({
        score: score,
        completedAt: new Date()
      });

      // Update overall progress
      progress.lastAccessed = new Date();
      await progress.save();
    }
  } catch (error) {
    console.error('Update course progress error:', error);
  }
}
