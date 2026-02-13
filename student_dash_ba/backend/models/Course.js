const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  duration: String,
  videoUrl: String,
  thumbnail: String,
  content: {
    notes: String,
    resources: [String],
    keyPoints: [String]
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  order: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  // Unique identifier from Content collection (subtopic.id)
  subtopicId: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

const moduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  topics: [topicSchema],
  order: {
    type: Number,
    default: 0
  },
  estimatedDuration: String,
  // Unique identifier from Content collection (chapter.id)
  chapterId: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  icon: {
    type: String,
    default: '📚'
  },
  color: {
    type: String,
    default: 'bg-blue-50'
  },
  iconColor: {
    type: String,
    default: 'text-blue-500'
  },
  borderColor: {
    type: String,
    default: 'border-blue-200'
  },
  category: {
    type: String,
    required: true,
    enum: ['mathematics', 'physics', 'chemistry', 'biology', 'english', 'history', 'computer-science']
  },
  // Link to teacher's class for synchronization
  classId: {
    type: String,
    index: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  modules: [moduleSchema],
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  estimatedDuration: String,
  prerequisites: [String],
  learningOutcomes: [String],
  tags: [String],
  isPublished: {
    type: Boolean,
    default: true
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ name: 'text', description: 'text' });
courseSchema.index({ 'rating.average': -1 });

// Virtual for total topics count
courseSchema.virtual('totalTopics').get(function() {
  return Array.isArray(this.modules) ? this.modules.reduce((total, module) => total + (module.topics?.length || 0), 0) : 0;
});

// Update totalLessons before saving
courseSchema.pre('save', function(next) {
  this.totalLessons = this.totalTopics;
  next();
});

module.exports = mongoose.model('Course', courseSchema);