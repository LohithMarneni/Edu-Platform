const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 10
  },
  dueDate: {
    type: Date,
    required: true
  },
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    files: [{
      name: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    status: {
      type: String,
      enum: ['draft', 'submitted', 'graded'],
      default: 'draft'
    },
    submittedAt: Date,
    grade: Number,
    feedback: String,
    gradedAt: Date
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    enum: ['assignment', 'quiz', 'project'],
    default: 'assignment'
  }
}, {
  timestamps: true
});

// Index for better query performance
assessmentSchema.index({ course: 1, isActive: 1 });
assessmentSchema.index({ instructor: 1, isActive: 1 });
assessmentSchema.index({ subject: 1, isActive: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
