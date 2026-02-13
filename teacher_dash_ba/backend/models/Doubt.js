const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a doubt title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  question: {
    type: String,
    required: [true, 'Please add a question'],
    maxlength: [2000, 'Question cannot be more than 2000 characters']
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    trim: true
  },
  student: {
    name: {
      type: String,
      required: true
    },
    email: String,
    avatar: String
  },
  class: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
    required: true
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'answered', 'resolved', 'closed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['concept', 'homework', 'assignment', 'exam', 'general'],
    default: 'general'
  },
  tags: [String],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  }],
  responses: [{
    author: {
      type: String,
      required: true
    },
    authorType: {
      type: String,
      enum: ['teacher', 'student', 'ai'],
      default: 'teacher'
    },
    message: {
      type: String,
      required: true,
      maxlength: [2000, 'Response cannot be more than 2000 characters']
    },
    attachments: [{
      filename: String,
      originalName: String,
      path: String
    }],
    isHelpful: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiSuggestion: {
    suggestion: String,
    confidence: Number,
    generatedAt: Date
  },
  views: {
    type: Number,
    default: 0
  },
  upvotes: {
    type: Number,
    default: 0
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Update status when response is added
doubtSchema.pre('save', function(next) {
  if (this.responses && this.responses.length > 0 && this.status === 'pending') {
    this.status = 'answered';
  }
  next();
});

// Index for better search performance
doubtSchema.index({ subject: 'text', question: 'text', tags: 'text' });

module.exports = mongoose.model('Doubt', doubtSchema);