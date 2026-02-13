const mongoose = require('mongoose');

const topicProgressSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  topicName: String,
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number,
    default: 0 // in minutes
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  notes: String,
  bookmarked: {
    type: Boolean,
    default: false
  }
});

const moduleProgressSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  moduleName: String,
  topics: [topicProgressSchema],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedTopics: {
    type: Number,
    default: 0
  },
  totalTopics: {
    type: Number,
    default: 0
  }
});

const courseProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseName: String,
  modules: [moduleProgressSchema],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedLessons: {
    type: Number,
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0 // total time in minutes
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  isCompleted: {
    type: Boolean,
    default: false
  },
  certificateEarned: {
    type: Boolean,
    default: false
  },
  grade: String,
  achievements: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const dailyActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  activities: {
    videosWatched: {
      type: Number,
      default: 0
    },
    quizzesTaken: {
      type: Number,
      default: 0
    },
    doubtsAsked: {
      type: Number,
      default: 0
    },
    doubtsAnswered: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0 // in minutes
    },
    pointsEarned: {
      type: Number,
      default: 0
    },
    topicsCompleted: {
      type: Number,
      default: 0
    }
  },
  subjects: [{
    name: String,
    timeSpent: Number,
    activitiesCount: Number
  }]
}, {
  timestamps: true
});

const weeklyGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  week: {
    start: Date,
    end: Date
  },
  goals: [{
    id: Number,
    title: String,
    description: String,
    targetValue: Number,
    currentValue: {
      type: Number,
      default: 0
    },
    unit: String, // 'topics', 'quizzes', 'hours', etc.
    category: String, // 'learning', 'practice', 'social'
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    points: {
      type: Number,
      default: 50
    }
  }],
  overallProgress: {
    type: Number,
    default: 0
  },
  pointsEarned: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });
courseProgressSchema.index({ user: 1, lastAccessed: -1 });
courseProgressSchema.index({ overallProgress: -1 });

dailyActivitySchema.index({ user: 1, date: -1 }, { unique: true });
dailyActivitySchema.index({ date: -1 });

weeklyGoalSchema.index({ user: 1, 'week.start': -1 });

// Calculate overall progress for course
courseProgressSchema.methods.calculateProgress = function() {
  if (this.modules.length === 0) return 0;
  
  const totalProgress = this.modules.reduce((sum, module) => sum + module.overallProgress, 0);
  this.overallProgress = Math.round(totalProgress / this.modules.length);
  
  // Update completed lessons count
  this.completedLessons = this.modules.reduce((sum, module) => sum + module.completedTopics, 0);
  
  // Check if course is completed
  if (this.overallProgress === 100) {
    this.isCompleted = true;
    this.completedAt = new Date();
  }
  
  return this.overallProgress;
};

// Calculate module progress
moduleProgressSchema.methods.calculateProgress = function() {
  if (this.topics.length === 0) return 0;
  
  const totalProgress = this.topics.reduce((sum, topic) => sum + topic.progress, 0);
  this.overallProgress = Math.round(totalProgress / this.topics.length);
  this.completedTopics = this.topics.filter(topic => topic.isCompleted).length;
  this.totalTopics = this.topics.length;
  
  return this.overallProgress;
};

// Update topic progress
topicProgressSchema.methods.updateProgress = function(progressValue, timeSpent = 0) {
  this.progress = Math.min(100, Math.max(0, progressValue));
  this.timeSpent += timeSpent;
  this.lastAccessed = new Date();
  
  if (this.progress === 100) {
    this.isCompleted = true;
  }
};

// Static method to get user's weekly activity
dailyActivitySchema.statics.getWeeklyActivity = async function(userId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dayOfWeek: '$date' },
        totalTimeSpent: { $sum: '$activities.timeSpent' },
        totalActivities: { 
          $sum: { 
            $add: [
              '$activities.videosWatched',
              '$activities.quizzesTaken',
              '$activities.doubtsAsked'
            ]
          }
        },
        totalPoints: { $sum: '$activities.pointsEarned' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);
const DailyActivity = mongoose.model('DailyActivity', dailyActivitySchema);
const WeeklyGoal = mongoose.model('WeeklyGoal', weeklyGoalSchema);

module.exports = {
  CourseProgress,
  DailyActivity,
  WeeklyGoal
};