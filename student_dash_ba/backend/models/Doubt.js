const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  answeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answerType: {
    type: String,
    enum: ['ai', 'teacher', 'student'],
    required: true
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  votes: {
    upvotes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    downvotes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  attachments: [{
    type: String,
    url: String,
    filename: String
  }],
  hasVideo: {
    type: Boolean,
    default: false
  },
  videoUrl: String
}, {
  timestamps: true
});

const doubtSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Doubt title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Doubt description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  subject: {
    type: String,
    required: true,
    enum: ['mathematics', 'physics', 'chemistry', 'biology', 'english', 'history', 'computer-science']
  },
  topic: String,
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  askedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignmentType: {
    type: String,
    enum: ['ai', 'faculty', 'community'],
    default: 'ai'
  },
  answers: [answerSchema],
  status: {
    type: String,
    enum: ['open', 'answered', 'closed', 'resolved'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [String],
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'video']
    },
    url: String,
    filename: String,
    size: Number
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarkedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  relatedDoubts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doubt'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
doubtSchema.index({ askedBy: 1, createdAt: -1 });
doubtSchema.index({ subject: 1, status: 1 });
doubtSchema.index({ tags: 1 });
doubtSchema.index({ title: 'text', description: 'text' });
doubtSchema.index({ views: -1 });

// Virtual for total answers count
doubtSchema.virtual('totalAnswers').get(function() {
  return this.answers.length;
});

// Virtual for total likes count
doubtSchema.virtual('totalLikes').get(function() {
  return this.likes.length;
});

// Virtual for answer score (upvotes - downvotes)
answerSchema.virtual('score').get(function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Increment views when doubt is accessed
doubtSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Add like to doubt
doubtSchema.methods.addLike = function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  if (!existingLike) {
    this.likes.push({ user: userId });
  }
  return this.save();
};

// Remove like from doubt
doubtSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  return this.save();
};

// Add bookmark
doubtSchema.methods.addBookmark = function(userId) {
  if (!this.bookmarkedBy.includes(userId)) {
    this.bookmarkedBy.push(userId);
  }
  return this.save();
};

// Remove bookmark
doubtSchema.methods.removeBookmark = function(userId) {
  this.bookmarkedBy = this.bookmarkedBy.filter(id => id.toString() !== userId.toString());
  return this.save();
};

module.exports = mongoose.model('Doubt', doubtSchema);