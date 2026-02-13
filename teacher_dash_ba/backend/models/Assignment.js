const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an assignment title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  type: {
    type: String,
    enum: ['Assignment', 'Quiz', 'Homework', 'Project', 'Exam'],
    default: 'Assignment'
  },
  assignmentType: {
    type: String,
    enum: ['text', 'upload', 'quiz'],
    default: 'text'
  },
  class: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
    required: true
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Please add total marks'],
    min: [1, 'Total marks must be at least 1']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  instructions: {
    type: String,
    maxlength: [2000, 'Instructions cannot be more than 2000 characters']
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  }],
  questions: [{
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
      default: 'multiple-choice'
    },
    options: [String],
    correctAnswer: String,
    points: {
      type: Number,
      default: 1
    }
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    content: String,
    attachments: [{
      filename: String,
      originalName: String,
      path: String
    }],
    score: Number,
    feedback: String,
    isLate: {
      type: Boolean,
      default: false
    },
    gradedAt: Date,
    gradedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }],
  settings: {
    allowLateSubmissions: {
      type: Boolean,
      default: true
    },
    showScoreImmediately: {
      type: Boolean,
      default: false
    },
    randomizeQuestions: {
      type: Boolean,
      default: false
    },
    timeLimit: Number // in minutes
  },
  stats: {
    totalSubmissions: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    lowestScore: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Calculate stats before saving
assignmentSchema.pre('save', function(next) {
  if (this.submissions && this.submissions.length > 0) {
    const gradedSubmissions = this.submissions.filter(sub => sub.score !== undefined);
    
    if (gradedSubmissions.length > 0) {
      const scores = gradedSubmissions.map(sub => sub.score);
      this.stats.totalSubmissions = this.submissions.length;
      this.stats.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      this.stats.highestScore = Math.max(...scores);
      this.stats.lowestScore = Math.min(...scores);
    }
  }
  next();
});

module.exports = mongoose.model('Assignment', assignmentSchema);