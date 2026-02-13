const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a class name'],
    trim: true,
    maxlength: [100, 'Class name cannot be more than 100 characters']
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    trim: true
  },
  grade: {
    type: String,
    required: [true, 'Please add a grade'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  studentCount: {
    type: Number,
    default: 0
  },
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    time: String,
    room: String
  },
  settings: {
    allowLateSubmissions: {
      type: Boolean,
      default: true
    },
    autoGrading: {
      type: Boolean,
      default: false
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalAssignments: { type: Number, default: 0 },
    totalContent: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  classCode: {
    type: String,
    unique: true,
    sparse: true
  },
  codeExpiry: {
    type: Date,
    default: function() {
      // Code expires in 30 days
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for assignments
classSchema.virtual('assignments', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'class',
  justOne: false
});

// Virtual for doubts
classSchema.virtual('doubts', {
  ref: 'Doubt',
  localField: '_id',
  foreignField: 'class',
  justOne: false
});

// Virtual for content
classSchema.virtual('content', {
  ref: 'Content',
  localField: '_id',
  foreignField: 'class',
  justOne: false
});

// Method to generate class code
classSchema.methods.generateClassCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  this.classCode = result;
  this.codeExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  return result;
};

// Method to check if class code is valid
classSchema.methods.isCodeValid = function() {
  return this.classCode && new Date() < this.codeExpiry;
};

module.exports = mongoose.model('Class', classSchema);