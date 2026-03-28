const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }], // exactly 2–4 options
  correctAnswer: { type: Number, required: true, min: 0, max: 3 }, // 0=A,1=B,2=C,3=D
  explanation: { type: String, default: '' },
  points: { type: Number, default: 1 }
});

const standaloneQuizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  description: { type: String, default: '' },
  questions: [questionSchema],
  // How many questions to show each student (randomly selected from the full pool).
  // 0 or >= questions.length means show all.
  questionsToShow: { type: Number, default: 0 },
  timeLimitMinutes: { type: Number, default: 30 }, // 0 = no limit
  isPublished: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
}, { timestamps: true });

module.exports = mongoose.model('StandaloneQuiz', standaloneQuizSchema);
