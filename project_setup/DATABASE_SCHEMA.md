# EduPlatform Database Schema

## Overview
The EduPlatform uses **two separate databases** to maintain clear separation between teacher and student functionalities:

- **Teacher Database**: `teacher_dashboard` (Port 5001)
- **Student Database**: `student_dashboard` (Port 5000)

## Database Architecture

```
MongoDB Instance
├── teacher_dashboard (Database)
│   ├── users (Collection)
│   ├── classes (Collection)
│   ├── students (Collection)
│   ├── assignments (Collection)
│   ├── content (Collection)
│   ├── doubts (Collection)
│   └── tasks (Collection)
│
└── student_dashboard (Database)
    ├── users (Collection)
    ├── courses (Collection)
    ├── quizzes (Collection)
    ├── quizattempts (Collection)
    ├── doubts (Collection)
    ├── progress (Collection)
    ├── collections (Collection)
    └── videonotes (Collection)
```

## Teacher Dashboard Schema

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required, max: 50),
  email: String (required, unique, lowercase),
  password: String (required, min: 6, hashed),
  role: String (enum: ['teacher', 'admin'], default: 'teacher'),
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    subject: String,
    bio: String,
    avatar: String
  },
  preferences: {
    theme: String (enum: ['light', 'dark', 'system']),
    language: String (default: 'en'),
    notifications: {
      email: Boolean,
      push: Boolean,
      sms: Boolean
    }
  },
  isActive: Boolean (default: true),
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Classes Collection
```javascript
{
  _id: ObjectId,
  name: String (required, max: 100),
  subject: String (required),
  grade: String (required),
  description: String (max: 500),
  teacher: ObjectId (ref: 'User', required),
  students: [ObjectId] (ref: 'Student'),
  studentCount: Number (default: 0),
  schedule: {
    days: [String] (enum: ['Monday', 'Tuesday', ...]),
    time: String,
    room: String
  },
  settings: {
    allowLateSubmissions: Boolean,
    autoGrading: Boolean,
    notificationsEnabled: Boolean
  },
  stats: {
    totalAssignments: Number,
    totalContent: Number,
    averageScore: Number,
    engagement: Number
  },
  isActive: Boolean (default: true),
  classCode: String (unique, 6-char alphanumeric),
  codeExpiry: Date (30 days from generation),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Students Collection
```javascript
{
  _id: ObjectId,
  name: String (required, max: 100),
  email: String (required, unique, lowercase),
  studentId: String (required, unique),
  avatar: String,
  classes: [{
    class: ObjectId (ref: 'Class'),
    joinedAt: Date,
    status: String (enum: ['active', 'inactive', 'suspended'])
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
    averageScore: Number,
    totalAssignments: Number,
    completedAssignments: Number,
    attendance: Number,
    doubtsAsked: Number,
    lastActive: Date
  },
  subjects: [{
    name: String,
    scores: [Number],
    averageScore: Number,
    weakTopics: [String],
    strongTopics: [String]
  }],
  notes: [{
    teacher: ObjectId (ref: 'User'),
    text: String,
    type: String (enum: ['positive', 'improvement', 'concern']),
    date: Date
  }],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Assignments Collection
```javascript
{
  _id: ObjectId,
  title: String (required, max: 200),
  description: String (required, max: 1000),
  type: String (enum: ['Assignment', 'Quiz', 'Homework', 'Project', 'Exam']),
  assignmentType: String (enum: ['text', 'upload', 'quiz']),
  class: ObjectId (ref: 'Class', required),
  teacher: ObjectId (ref: 'User', required),
  dueDate: Date (required),
  totalMarks: Number (required, min: 1),
  status: String (enum: ['draft', 'active', 'completed', 'archived']),
  instructions: String (max: 2000),
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  }],
  questions: [{
    question: String,
    type: String (enum: ['multiple-choice', 'true-false', 'short-answer', 'essay']),
    options: [String],
    correctAnswer: String,
    points: Number
  }],
  submissions: [{
    student: ObjectId (ref: 'Student'),
    submittedAt: Date,
    content: String,
    attachments: [Object],
    score: Number,
    feedback: String,
    isLate: Boolean,
    gradedAt: Date,
    gradedBy: ObjectId (ref: 'User')
  }],
  settings: {
    allowLateSubmissions: Boolean,
    showScoreImmediately: Boolean,
    randomizeQuestions: Boolean,
    timeLimit: Number
  },
  stats: {
    totalSubmissions: Number,
    averageScore: Number,
    highestScore: Number,
    lowestScore: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Content Collection
```javascript
{
  _id: ObjectId,
  title: String (required, max: 200),
  description: String (max: 1000),
  type: String (enum: ['video', 'pdf', 'quiz', 'link', 'image', 'audio', 'presentation', 'assignment']),
  class: ObjectId (ref: 'Class', required),
  teacher: ObjectId (ref: 'User', required),
  subject: String (required),
  chapter: {
    id: String,
    name: String,
    description: String
  },
  subtopic: {
    id: String,
    title: String,
    duration: String
  },
  file: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    url: String
  },
  link: {
    url: String,
    title: String,
    description: String
  },
  metadata: {
    duration: String,
    pages: Number,
    fileSize: String,
    resolution: String,
    format: String
  },
  tags: [String],
  status: String (enum: ['draft', 'published', 'archived']),
  visibility: String (enum: ['public', 'class-only', 'private']),
  stats: {
    views: Number,
    downloads: Number,
    likes: Number,
    shares: Number
  },
  interactions: [{
    student: ObjectId (ref: 'Student'),
    action: String (enum: ['view', 'download', 'like', 'share', 'comment']),
    timestamp: Date,
    data: Mixed
  }],
  comments: [{
    author: String,
    message: String,
    createdAt: Date
  }],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Doubts Collection (Teacher)
```javascript
{
  _id: ObjectId,
  title: String (required, max: 200),
  question: String (required, max: 2000),
  subject: String (required),
  student: {
    name: String (required),
    email: String,
    avatar: String
  },
  class: ObjectId (ref: 'Class', required),
  teacher: ObjectId (ref: 'User'),
  status: String (enum: ['pending', 'answered', 'resolved', 'closed']),
  priority: String (enum: ['low', 'medium', 'high', 'urgent']),
  category: String (enum: ['concept', 'homework', 'assignment', 'exam', 'general']),
  tags: [String],
  attachments: [Object],
  responses: [{
    author: String (required),
    authorType: String (enum: ['teacher', 'student', 'ai']),
    message: String (required, max: 2000),
    attachments: [Object],
    isHelpful: Boolean,
    createdAt: Date
  }],
  aiSuggestion: {
    suggestion: String,
    confidence: Number,
    generatedAt: Date
  },
  views: Number (default: 0),
  upvotes: Number (default: 0),
  isResolved: Boolean (default: false),
  resolvedAt: Date,
  resolvedBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Tasks Collection
```javascript
{
  _id: ObjectId,
  title: String (required, max: 200),
  description: String (max: 500),
  teacher: ObjectId (ref: 'User', required),
  priority: String (enum: ['low', 'medium', 'high']),
  status: String (enum: ['pending', 'in-progress', 'completed']),
  dueDate: Date (required),
  dueTime: String,
  subject: String (default: 'General'),
  category: String (enum: ['grading', 'planning', 'admin', 'teaching', 'meeting', 'other']),
  relatedClass: ObjectId (ref: 'Class'),
  relatedAssignment: ObjectId (ref: 'Assignment'),
  completedAt: Date,
  notes: String,
  isRecurring: Boolean (default: false),
  recurringPattern: String (enum: ['daily', 'weekly', 'monthly']),
  createdAt: Date,
  updatedAt: Date
}
```

## Student Dashboard Schema

### 1. Users Collection (Student)
```javascript
{
  _id: ObjectId,
  fullName: String (required, max: 50),
  email: String (required, unique, lowercase),
  password: String (required, min: 6, hashed),
  avatar: String (auto-generated),
  role: String (enum: ['student', 'teacher', 'admin'], default: 'student'),
  profile: {
    phone: String,
    dateOfBirth: Date,
    grade: String,
    school: String,
    bio: String
  },
  preferences: {
    darkMode: Boolean,
    emailNotifications: Boolean,
    pushNotifications: Boolean,
    weeklyReports: Boolean,
    language: String (default: 'English')
  },
  stats: {
    totalPoints: Number (default: 0),
    currentStreak: Number (default: 0),
    longestStreak: Number (default: 0),
    lastActiveDate: Date,
    totalQuizzes: Number (default: 0),
    averageScore: Number (default: 0),
    badgesEarned: Number (default: 0)
  },
  achievements: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: Date,
    points: Number
  }],
  isActive: Boolean (default: true),
  lastLogin: Date,
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Courses Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String (required),
  icon: String (default: '📚'),
  color: String (default: 'bg-blue-50'),
  iconColor: String (default: 'text-blue-500'),
  borderColor: String (default: 'border-blue-200'),
  category: String (required, enum: ['mathematics', 'physics', 'chemistry', 'biology', 'english', 'history', 'computer-science']),
  level: String (enum: ['beginner', 'intermediate', 'advanced']),
  modules: [{
    name: String (required),
    description: String,
    topics: [{
      name: String (required),
      description: String,
      duration: String,
      videoUrl: String,
      thumbnail: String,
      content: {
        notes: String,
        resources: [String],
        keyPoints: [String]
      },
      difficulty: String (enum: ['beginner', 'intermediate', 'advanced']),
      order: Number,
      isCompleted: Boolean
    }],
    order: Number,
    estimatedDuration: String
  }],
  instructor: ObjectId (ref: 'User'),
  totalLessons: Number (default: 0),
  estimatedDuration: String,
  prerequisites: [String],
  learningOutcomes: [String],
  tags: [String],
  isPublished: Boolean (default: true),
  enrollmentCount: Number (default: 0),
  rating: {
    average: Number (default: 0),
    count: Number (default: 0)
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Quizzes Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  subject: String (required),
  topic: String,
  difficulty: String (enum: ['easy', 'medium', 'hard']),
  questions: [{
    question: String (required),
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String (required),
    explanation: String (required),
    difficulty: String (enum: ['easy', 'medium', 'hard']),
    points: Number (default: 10),
    tags: [String],
    timeLimit: Number (default: 30)
  }],
  duration: Number (default: 30),
  totalPoints: Number (default: 0),
  passingScore: Number (default: 60),
  attempts: Number (default: 3),
  isPublished: Boolean (default: true),
  createdBy: ObjectId (ref: 'User', required),
  tags: [String],
  category: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. QuizAttempts Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  quiz: ObjectId (ref: 'Quiz', required),
  answers: [{
    questionId: ObjectId,
    selectedAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number,
    points: Number
  }],
  score: Number (required),
  percentage: Number (required),
  totalQuestions: Number,
  correctAnswers: Number,
  timeSpent: Number,
  status: String (enum: ['completed', 'abandoned', 'timeout']),
  mode: String (enum: ['solo', 'friend', 'random']),
  opponent: ObjectId (ref: 'User'),
  result: String (enum: ['pass', 'fail', 'win', 'loss', 'tie']),
  xpEarned: Number (default: 0),
  bookmarkedQuestions: [ObjectId],
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Progress Collections
```javascript
// CourseProgress
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  course: ObjectId (ref: 'Course', required),
  courseName: String,
  modules: [{
    moduleId: ObjectId (required),
    moduleName: String,
    topics: [{
      topicId: ObjectId (required),
      topicName: String,
      progress: Number (0-100),
      timeSpent: Number,
      lastAccessed: Date,
      isCompleted: Boolean,
      notes: String,
      bookmarked: Boolean
    }],
    overallProgress: Number (0-100),
    completedTopics: Number,
    totalTopics: Number
  }],
  overallProgress: Number (0-100),
  completedLessons: Number,
  totalLessons: Number,
  timeSpent: Number,
  lastAccessed: Date,
  startedAt: Date,
  completedAt: Date,
  isCompleted: Boolean,
  certificateEarned: Boolean,
  grade: String,
  achievements: [Object],
  createdAt: Date,
  updatedAt: Date
}

// DailyActivity
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  date: Date (required),
  activities: {
    videosWatched: Number,
    quizzesTaken: Number,
    doubtsAsked: Number,
    doubtsAnswered: Number,
    timeSpent: Number,
    pointsEarned: Number,
    topicsCompleted: Number
  },
  subjects: [{
    name: String,
    timeSpent: Number,
    activitiesCount: Number
  }],
  createdAt: Date,
  updatedAt: Date
}

// WeeklyGoal
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  week: {
    start: Date,
    end: Date
  },
  goals: [{
    id: Number,
    title: String,
    description: String,
    targetValue: Number,
    currentValue: Number,
    unit: String,
    category: String,
    isCompleted: Boolean,
    completedAt: Date,
    points: Number
  }],
  overallProgress: Number,
  pointsEarned: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Collections Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required, unique),
  subjects: [{
    subjectId: String,
    subjectName: String,
    icon: String,
    color: String,
    lessons: [{
      lessonId: ObjectId (required),
      lessonName: String,
      progress: Number,
      content: {
        'ai-notes': [Object],
        'user-notes': [Object],
        'ai-videos': [Object],
        'important-doubts': [Object],
        'custom-folders': [Object]
      },
      totalItems: Number,
      lastUpdated: Date
    }],
    totalItems: Number
  }],
  recentItems: [{
    item: Object,
    accessedAt: Date
  }],
  favorites: [Object],
  sharedCollections: [Object],
  settings: {
    autoOrganize: Boolean,
    defaultPrivacy: String,
    notifications: Object
  },
  stats: {
    totalItems: Number,
    totalFolders: Number,
    totalShares: Number,
    storageUsed: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Doubts Collection (Student)
```javascript
{
  _id: ObjectId,
  title: String (required, max: 200),
  description: String (required, max: 2000),
  subject: String (required, enum: ['mathematics', 'physics', 'chemistry', 'biology', 'english', 'history', 'computer-science']),
  topic: String,
  difficulty: String (enum: ['easy', 'medium', 'hard']),
  askedBy: ObjectId (ref: 'User', required),
  answers: [{
    content: String (required),
    answeredBy: ObjectId (ref: 'User', required),
    answerType: String (enum: ['ai', 'teacher', 'student'], required),
    isAccepted: Boolean,
    votes: {
      upvotes: [Object],
      downvotes: [Object]
    },
    attachments: [Object],
    hasVideo: Boolean,
    videoUrl: String,
    createdAt: Date,
    updatedAt: Date
  }],
  status: String (enum: ['open', 'answered', 'closed', 'resolved']),
  priority: String (enum: ['low', 'medium', 'high', 'urgent']),
  tags: [String],
  attachments: [Object],
  views: Number (default: 0),
  likes: [Object],
  bookmarkedBy: [ObjectId],
  isPublic: Boolean (default: true),
  aiGenerated: Boolean (default: false),
  relatedDoubts: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### 8. VideoNotes Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  videoId: String (required),
  topicId: ObjectId (required),
  timestamp: Number (required, in seconds),
  content: String (required, max: 1000),
  formattedTime: String (required, e.g., "5:30"),
  tags: [String],
  isBookmarked: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## Key Features

### Class Code System
- **6-character alphanumeric codes** for class joining
- **30-day expiration** for security
- **Unique codes** per class
- **Automatic generation** and validation

### Progress Tracking
- **Hierarchical progress** (topic → module → course)
- **Time tracking** for learning activities
- **Achievement system** with points and badges
- **Daily and weekly goals**

### Content Management
- **Multiple content types** (video, PDF, quiz, link, etc.)
- **File attachments** with metadata
- **Search and filtering** capabilities
- **Interaction tracking** (views, downloads, likes)

### Doubt Resolution
- **Multi-tier system** (student → teacher → AI)
- **Priority and categorization**
- **Voting and bookmarking**
- **AI suggestions** for common questions

### Collections System
- **Personal knowledge base**
- **AI-generated content** organization
- **Custom folders** and sharing
- **Cross-platform synchronization**

## Database Relationships

### Teacher Dashboard
- **User** → **Class** (1:many)
- **Class** → **Student** (many:many)
- **Class** → **Assignment** (1:many)
- **Class** → **Content** (1:many)
- **Class** → **Doubt** (1:many)

### Student Dashboard
- **User** → **Course** (many:many via Progress)
- **User** → **Quiz** (many:many via QuizAttempt)
- **User** → **Doubt** (1:many)
- **User** → **Collection** (1:1)
- **User** → **VideoNote** (1:many)

## Indexes and Performance

### Teacher Database Indexes
- `users.email` (unique)
- `classes.teacher` + `classes.createdAt`
- `students.email` (unique)
- `assignments.class` + `assignments.dueDate`
- `content.class` + `content.type`
- `doubts.class` + `doubts.status`

### Student Database Indexes
- `users.email` (unique)
- `courses.category` + `courses.level`
- `quizzes.subject` + `quizzes.difficulty`
- `quizattempts.user` + `quizattempts.createdAt`
- `progress.user` + `progress.course` (unique)
- `doubts.askedBy` + `doubts.createdAt`

This schema supports a comprehensive educational platform with advanced features like AI integration, progress tracking, content management, and collaborative learning tools.

