const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a student name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  avatar: String,
  classes: [{
    class: {
      type: mongoose.Schema.ObjectId,
      ref: 'Class'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    }
  }],
  profile: {
    phone: String,
    parentEmail: String,
    parentPhone: String,
    address: String,
    dateOfBirth: Date,
    grade: String
  },
  performance: {
    averageScore: { type: Number, default: 0 },
    totalAssignments: { type: Number, default: 0 },
    completedAssignments: { type: Number, default: 0 },
    attendance: { type: Number, default: 0 },
    doubtsAsked: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  },
  subjects: [{
    name: String,
    scores: [Number],
    averageScore: Number,
    weakTopics: [String],
    strongTopics: [String]
  }],
  notes: [{
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    text: String,
    type: {
      type: String,
      enum: ['positive', 'improvement', 'concern'],
      default: 'positive'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);