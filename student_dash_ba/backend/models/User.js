const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Unified User Model
 * Supports both students and teachers with role-based fields
 */
const userSchema = new mongoose.Schema({
  // Name field - supports both 'name' (teacher) and 'fullName' (student)
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  fullName: {
    type: String,
    trim: true,
    maxlength: [50, 'Full name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: function() {
      const displayName = this.fullName || this.name || this.email;
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f46e5&color=fff&size=128`;
    }
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
    required: true
  },
  // Unified profile - supports both student and teacher fields
  profile: {
    // Student fields
    phone: String,
    dateOfBirth: Date,
    grade: String,
    school: String,
    bio: String,
    // Teacher fields
    firstName: String,
    lastName: String,
    subject: String
  },
  // Unified preferences
  preferences: {
    // Student preferences
    darkMode: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    weeklyReports: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'English'
    },
    // Teacher preferences
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  // Student-specific stats (only populated for students)
  stats: {
    totalPoints: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActiveDate: {
      type: Date,
      default: Date.now
    },
    totalQuizzes: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    badgesEarned: {
      type: Number,
      default: 0
    }
  },
  // Student-specific achievements
  achievements: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    points: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // Student-specific refresh token
  refreshToken: String,
  // Teacher-specific password reset
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'stats.totalPoints': -1 });
userSchema.index({ createdAt: -1 });

// Virtual for user level based on points (student only)
userSchema.virtual('level').get(function() {
  if (this.role !== 'student' || !this.stats) return null;
  const points = this.stats.totalPoints || 0;
  if (points < 100) return 'Beginner';
  if (points < 500) return 'Intermediate';
  if (points < 1000) return 'Advanced';
  if (points < 2000) return 'Expert';
  return 'Master';
});

// Virtual for display name (supports both name and fullName)
userSchema.virtual('displayName').get(function() {
  return this.fullName || this.name || this.email;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update lastActiveDate on save (for students)
userSchema.pre('save', function(next) {
  if (this.isModified('stats.lastActiveDate') && this.role === 'student') {
    this.updateStreak();
  }
  next();
});

// Compare password method (unified)
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Match password method (alias for compatibility with teacher code)
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await this.comparePassword(enteredPassword);
};

// Generate JWT token (unified - supports both student and teacher)
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate refresh token (student-specific)
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
};

// Get signed JWT token (alias for teacher compatibility)
userSchema.methods.getSignedJwtToken = function() {
  return this.generateAuthToken();
};

// Generate and hash password token (teacher-specific)
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Update streak logic (student-specific)
userSchema.methods.updateStreak = function() {
  if (this.role !== 'student' || !this.stats) return;
  
  const today = new Date();
  const lastActive = new Date(this.stats.lastActiveDate);
  
  // Reset time to compare only dates
  today.setHours(0, 0, 0, 0);
  lastActive.setHours(0, 0, 0, 0);
  
  const diffTime = today - lastActive;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    // Consecutive day
    this.stats.currentStreak += 1;
    if (this.stats.currentStreak > this.stats.longestStreak) {
      this.stats.longestStreak = this.stats.currentStreak;
    }
  } else if (diffDays > 1) {
    // Streak broken
    this.stats.currentStreak = 1;
  }
  // If diffDays === 0, same day, no change needed
};

// Add points method (student-specific)
userSchema.methods.addPoints = function(points) {
  if (this.role !== 'student' || !this.stats) return;
  this.stats.totalPoints += points;
  this.stats.lastActiveDate = new Date();
  this.updateStreak();
};

// Add achievement method (student-specific)
userSchema.methods.addAchievement = function(achievement) {
  if (this.role !== 'student') return;
  this.achievements.push(achievement);
  this.stats.badgesEarned += 1;
  this.addPoints(achievement.points || 0);
};

module.exports = mongoose.model('User', userSchema);
