const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 10
  },
  tags: [String],
  timeLimit: {
    type: Number,
    default: 30 // seconds
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  subject: {
    type: String,
    required: true
  },
  topic: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  questions: [questionSchema],
  duration: {
    type: Number,
    default: 30 // minutes
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  passingScore: {
    type: Number,
    default: 60 // percentage
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  attempts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: [String],
    score: {
      type: Number,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number,
      default: 0
    }
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String],
  category: String
}, {
  timestamps: true
});

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    selectedAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number, // seconds
    points: Number
  }],
  score: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  totalQuestions: Number,
  correctAnswers: Number,
  timeSpent: Number, // total time in seconds
  status: {
    type: String,
    enum: ['completed', 'abandoned', 'timeout'],
    default: 'completed'
  },
  mode: {
    type: String,
    enum: ['solo', 'friend', 'random'],
    default: 'solo'
  },
  opponent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  result: {
    type: String,
    enum: ['pass', 'fail', 'win', 'loss', 'tie'],
    required: true
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  bookmarkedQuestions: [mongoose.Schema.Types.ObjectId],
  notes: String
}, {
  timestamps: true
});

// Indexes
quizSchema.index({ subject: 1, difficulty: 1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ tags: 1 });

quizAttemptSchema.index({ user: 1, createdAt: -1 });
quizAttemptSchema.index({ quiz: 1 });
quizAttemptSchema.index({ user: 1, quiz: 1 });

// Calculate total points before saving quiz
quizSchema.pre('save', function(next) {
  this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
  next();
});

// Calculate XP earned for quiz attempt
quizAttemptSchema.pre('save', function(next) {
  if (this.isNew) {
    let baseXP = this.correctAnswers * 10;
    
    // Bonus XP for high scores
    if (this.percentage >= 90) baseXP += 50;
    else if (this.percentage >= 80) baseXP += 30;
    else if (this.percentage >= 70) baseXP += 20;
    
    // Bonus XP for completing quiz quickly
    const avgTimePerQuestion = this.timeSpent / this.totalQuestions;
    if (avgTimePerQuestion < 15) baseXP += 25; // Fast completion bonus
    
    // Bonus XP for multiplayer wins
    if (this.mode !== 'solo' && this.result === 'win') baseXP += 100;
    
    this.xpEarned = baseXP;
  }
  next();
});

const Quiz = mongoose.model('Quiz', quizSchema);
const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = { Quiz, QuizAttempt };