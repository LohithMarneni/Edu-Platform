const mongoose = require('mongoose');

const standaloneQuizSubmissionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'StandaloneQuiz', required: true },
  studentEmail: { type: String, required: true, lowercase: true, trim: true },
  studentName: { type: String, required: true, trim: true },
  answers: [{ type: Number }], // chosen option index per shown question
  questionIndices: [{ type: Number }], // which question indices from the pool were shown
  score: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  timeTakenSeconds: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
});

// one submission per student per quiz
standaloneQuizSubmissionSchema.index({ quiz: 1, studentEmail: 1 }, { unique: true });

module.exports = mongoose.model('StandaloneQuizSubmission', standaloneQuizSubmissionSchema);
