# Complete Project Analysis: Student Dashboard & Teacher Dashboard

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Backend Connectivity](#backend-connectivity)
3. [Database Structure](#database-structure)
4. [Student Dashboard - Complete API Reference](#student-dashboard---complete-api-reference)
5. [Teacher Dashboard - Complete API Reference](#teacher-dashboard---complete-api-reference)
6. [Frontend Components](#frontend-components)
7. [Authentication Flow](#authentication-flow)
8. [Data Models](#data-models)
9. [Integration Points](#integration-points)

---

## Architecture Overview

### System Structure
```
edu_platform/
├── student_dash_ba/          # Student-facing application
│   ├── project/
│   │   ├── backend/          # Express.js API (Port 5000)
│   │   └── src/              # React frontend (Port 5173)
│   └── MongoDB: student_dashboard
│
└── teacher_dash_ba/          # Teacher-facing application
    ├── project/
    │   ├── backend/          # Express.js API (Port 5001)
    │   └── src/              # React frontend (Port 5173/5174)
    └── MongoDB: teacher_dashboard
```

### Key Technologies
- **Backend**: Express.js, MongoDB, Mongoose
- **Frontend**: React, React Router, Tailwind CSS
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO (Teacher Dashboard only)
- **Security**: Helmet, CORS, Rate Limiting, Bcrypt

---

## Backend Connectivity

### Student Dashboard Backend
- **Port**: 5000
- **Base URL**: `http://localhost:5000/api`
- **Database**: `mongodb://localhost:27017/student_dashboard`
- **Frontend URL**: `http://localhost:5173`
- **JWT Secret**: Separate from teacher dashboard
- **Features**: 
  - Rate limiting (100 requests per 15 minutes)
  - CORS enabled
  - Compression enabled
  - Helmet security headers

### Teacher Dashboard Backend
- **Port**: 5001
- **Base URL**: `http://localhost:5001/api`
- **Database**: `mongodb://localhost:27017/teacher_dashboard`
- **Frontend URL**: `http://localhost:5173` or `http://localhost:5174`
- **JWT Secret**: Separate from student dashboard
- **Features**:
  - Rate limiting (100 requests per 15 minutes)
  - CORS enabled
  - Socket.IO for real-time updates
  - File upload support (`/uploads` static directory)

### Database Separation
- **Separate Databases**: Each dashboard uses its own MongoDB database
- **No Direct Connection**: The two backends don't directly communicate
- **Shared Data**: Students and teachers may share email addresses but are stored separately

---

## Database Structure

### Student Dashboard Database (`student_dashboard`)
Collections:
- `users` - Student accounts
- `courses` - Course catalog
- `quizzes` - Quiz questions and attempts
- `doubts` - Student questions/doubts
- `notes` - Student notes
- `collections` - Student collections
- `assessments` - Assignments/assessments
- `progress` - Course progress tracking
- `videonotes` - Video-specific notes

### Teacher Dashboard Database (`teacher_dashboard`)
Collections:
- `users` - Teacher accounts
- `classes` - Class management
- `assignments` - Assignment creation and grading
- `doubts` - Doubt resolution
- `content` - Course content management
- `students` - Student records (linked to classes)
- `tasks` - Teacher tasks/reminders

---

## Student Dashboard - Complete API Reference

### Base URL: `http://localhost:5000/api`

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new student | No |
| POST | `/auth/login` | Login student | No |
| POST | `/auth/logout` | Logout student | Yes |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/refresh` | Refresh access token | No |
| PUT | `/auth/password` | Update password | Yes |
| GET | `/auth/verify` | Verify token validity | Yes |

### 📊 Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard` | Get dashboard stats, courses, progress, recent activities | Yes |

**Response includes:**
- Stats (total courses, completed courses, lessons, progress, streaks)
- Recent activities
- Quiz attempts
- Pending doubts
- Weekly progress
- Enrolled courses with progress

### 📚 Courses (`/api/courses`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/courses` | Get all available/enrolled courses | Yes |
| GET | `/courses/subjects` | Get subjects and course mapping | Yes |
| GET | `/courses/:id` | Get single course details | Yes |
| POST | `/courses/:id/enroll` | Enroll in a course | Yes |
| PUT | `/courses/:id/progress` | Update course progress | Yes |

### ✅ Assessments (`/api/assessments`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/assessments` | Get all assessments (with filters) | Yes |
| GET | `/assessments/:id` | Get single assessment | Yes |
| POST | `/assessments/:id/submit` | Submit assessment | Yes |
| POST | `/assessments/:id/upload` | Upload file to assessment | Yes |
| DELETE | `/assessments/:id/files/:fileId` | Delete uploaded file | Yes |

### 🧪 Quizzes (`/api/quizzes`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/quizzes` | Get all quizzes (optionally filtered by courseId) | Yes |
| GET | `/quizzes/:id` | Get single quiz | Yes |
| POST | `/quizzes/:id/attempt` | Submit quiz attempt | Yes |
| GET | `/quizzes/:id/results` | Get quiz results | Yes |

### ❓ Doubts (`/api/doubts`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/doubts` | Get all doubts (with filters) | Yes |
| GET | `/doubts/:id` | Get single doubt | Yes |
| POST | `/doubts` | Create new doubt | Yes |
| PUT | `/doubts/:id` | Update doubt | Yes |
| DELETE | `/doubts/:id` | Delete doubt | Yes |
| POST | `/doubts/:id/answers` | Add answer to doubt | Yes |
| POST | `/doubts/:id/answers/:answerId/vote` | Vote on answer | Yes |
| POST | `/doubts/:id/like` | Like doubt | Yes |
| POST | `/doubts/:id/bookmark` | Bookmark doubt | Yes |
| PUT | `/doubts/:id/status` | Update doubt status | Yes |

### 📝 Notes (`/api/notes`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notes` | Get all notes (with filters) | Yes |
| GET | `/notes/:id` | Get single note | Yes |
| POST | `/notes` | Create note | Yes |
| PUT | `/notes/:id` | Update note | Yes |
| DELETE | `/notes/:id` | Delete note | Yes |

### 📹 Videos (`/api/videos`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/videos/notes` | Get all video notes | Yes |
| POST | `/videos/notes` | Create video note | Yes |
| PUT | `/videos/notes/:id` | Update video note | Yes |
| DELETE | `/videos/notes/:id` | Delete video note | Yes |

### 📁 Collections (`/api/collections`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/collections` | Get all collections | Yes |
| POST | `/collections` | Create collection | Yes |
| PUT | `/collections/:id` | Update collection | Yes |
| DELETE | `/collections/:id` | Delete collection | Yes |

### 📈 Progress (`/api/progress`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/progress` | Get progress data | Yes |
| PUT | `/progress` | Update progress | Yes |

### 👥 Users (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get users (with role filter) | Yes |
| GET | `/users/:id` | Get single user | Yes |
| PUT | `/users/:id` | Update user | Yes |

### 🏥 Health Check
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health check | No |

---

## Teacher Dashboard - Complete API Reference

### Base URL: `http://localhost:5001/api`

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new teacher | No |
| POST | `/auth/login` | Login teacher | No |
| POST | `/auth/logout` | Logout teacher | No |
| GET | `/auth/me` | Get current user | Yes |
| PUT | `/auth/profile` | Update profile | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| PUT | `/auth/reset-password/:resettoken` | Reset password | No |

### 📊 Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard/stats` | Get dashboard statistics | Yes |
| GET | `/dashboard/tasks` | Get tasks | Yes |
| POST | `/dashboard/tasks` | Create task | Yes |
| PUT | `/dashboard/tasks/:id` | Update task | Yes |
| DELETE | `/dashboard/tasks/:id` | Delete task | Yes |
| GET | `/dashboard/activity` | Get recent activity | Yes |
| GET | `/dashboard/schedule` | Get schedule | Yes |
| GET | `/dashboard/notifications` | Get notifications | Yes |

**Dashboard Stats Response includes:**
- Overview (total classes, students, pending tasks, pending doubts)
- Recent assignments
- Upcoming deadlines
- Class list with stats

### 🏫 Classes (`/api/classes`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/classes` | Get all classes | Yes |
| POST | `/classes` | Create class | Yes |
| GET | `/classes/:id` | Get single class | Yes |
| PUT | `/classes/:id` | Update class | Yes |
| DELETE | `/classes/:id` | Delete class | Yes |
| GET | `/classes/:id/stats` | Get class statistics | Yes |
| GET | `/classes/:id/students` | Get class students | Yes |
| POST | `/classes/:id/students` | Add student to class | Yes |
| DELETE | `/classes/:id/students/:studentId` | Remove student | Yes |
| POST | `/classes/:id/generate-code` | Generate class code | Yes |
| GET | `/classes/:id/code` | Get class code | Yes |
| POST | `/classes/join` | Join class by code | Yes |
| GET | `/classes/student/:studentId` | Get student's classes | Yes |

### 📝 Assignments (`/api/assignments`)
**Teacher Routes (Protected):**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/assignments` | Get all assignments | Yes |
| POST | `/assignments` | Create assignment | Yes |
| GET | `/assignments/:id` | Get single assignment | Yes |
| PUT | `/assignments/:id` | Update assignment | Yes |
| DELETE | `/assignments/:id` | Delete assignment | Yes |
| PUT | `/assignments/:id/publish` | Publish assignment | Yes |
| GET | `/assignments/:id/submissions` | Get submissions | Yes |
| PUT | `/assignments/:id/submissions/:submissionId/grade` | Grade submission | Yes |
| GET | `/assignments/:id/stats` | Get assignment statistics | Yes |

**Student Routes (No Auth - Email Verified):**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/assignments/student/:studentEmail` | Get student assignments | No |
| GET | `/assignments/student/:studentEmail/:assignmentId` | Get student assignment | No |
| POST | `/assignments/:assignmentId/submit` | Submit assignment | No |

### ❓ Doubts (`/api/doubts`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/doubts` | Get all doubts (with filters) | Yes |
| GET | `/doubts/:id` | Get single doubt | Yes |
| POST | `/doubts` | Create doubt | Yes |
| PUT | `/doubts/:id` | Update doubt | Yes |
| DELETE | `/doubts/:id` | Delete doubt | Yes |
| POST | `/doubts/:id/respond` | Respond to doubt | Yes |
| PUT | `/doubts/:id/resolve` | Resolve doubt | Yes |
| GET | `/doubts/stats/overview` | Get doubt statistics | Yes |
| POST | `/doubts/:id/ai-suggestion` | Generate AI suggestion | Yes |

### 📚 Content (`/api/content`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/content` | Get all content (with filters) | Yes |
| GET | `/content/:id` | Get single content item | Yes |
| POST | `/content` | Create content | Yes |
| PUT | `/content/:id` | Update content | Yes |
| DELETE | `/content/:id` | Delete content | Yes |
| GET | `/content/chapters/:classId` | Get chapters for class | Yes |

### 👥 Users (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get users | Yes |
| GET | `/users/:id` | Get single user | Yes |
| PUT | `/users/:id` | Update user | Yes |

### 🏥 Health Check
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health check | No |

### 🔌 Socket.IO Events (Teacher Dashboard)
**Connection Events:**
- `authenticate` - Authenticate socket connection with JWT token
- `authenticated` - Response confirming authentication

**Class Events:**
- `class_update` - Broadcast class updates
- `class_updated` - Receive class updates
- `student_joined` - Student joined class
- `student_list_updated` - Student list updated

**Doubt Events:**
- `doubt_submitted` - New doubt submitted
- `new_doubt` - Receive new doubt notification

---

## Frontend Components

### Student Dashboard Frontend (`student_dash_ba/project/src`)

#### Main App (`App.jsx`)
- Routes configuration
- Authentication state management
- Layout wrapper

#### Components:
1. **Login.jsx** - Student authentication
2. **Dashboard.jsx** - Main dashboard with stats, courses, progress
3. **Sidebar.jsx** - Navigation sidebar
4. **Courses.jsx** - Course listing and enrollment
5. **VideoPlayer.jsx** - Video lesson player
6. **Assignments.jsx** - Assignment listing
7. **AssignmentDetail.jsx** - Assignment detail and submission
8. **Progress.jsx** - Progress tracking
9. **DoubtResolution.jsx** - Doubt Q&A interface
10. **MyCollection.jsx** - Personal collections
11. **Quiz.jsx** - Quiz taking interface
12. **Profile.jsx** - User profile management

#### Routes:
- `/` - Dashboard
- `/profile` - Profile
- `/courses` - Courses
- `/courses/topic/:topicId/video` - Video player
- `/assignments` - Assignments
- `/assignment/:assignmentId` - Assignment detail
- `/progress` - Progress
- `/doubts` - Doubts
- `/collection` - Collections
- `/quiz` - Quiz

### Teacher Dashboard Frontend (`teacher_dash_ba/project/src`)

#### Main App (`App.jsx`)
- Routes configuration
- Authentication state management
- Layout wrapper

#### Pages:
1. **Dashboard.jsx** - Teacher dashboard with stats, tasks, schedule
2. **Classes.jsx** - Class management
3. **ClassDetail.jsx** - Individual class details
4. **Assignments.jsx** - Assignment management
5. **Content.jsx** - Content management
6. **Doubts.jsx** - Doubt resolution interface
7. **Settings.jsx** - Settings page

#### Components:
1. **LoginPage.jsx** - Teacher authentication
2. **Layout.jsx** - Main layout wrapper

#### Routes:
- `/` or `/dashboard` - Dashboard
- `/classes` - Classes list
- `/classes/:classId/*` - Class detail (nested routes)
- `/assignments` - Assignments
- `/content` - Content
- `/doubts` - Doubts
- `/settings` - Settings

---

## Authentication Flow

### Student Dashboard Authentication

1. **Registration/Login**:
   - POST `/api/auth/register` or `/api/auth/login`
   - Server returns JWT token
   - Frontend stores token in `localStorage`

2. **Protected Routes**:
   - Frontend sends token in `Authorization: Bearer <token>` header
   - Backend middleware (`protect`) verifies token
   - If valid, adds user to `req.user`
   - If invalid, returns 401

3. **Token Storage**:
   - Token stored in `localStorage.getItem('token')`
   - User data stored in `localStorage.getItem('user')`

4. **Token Refresh**:
   - POST `/api/auth/refresh` with refresh token
   - Returns new access token

### Teacher Dashboard Authentication

1. **Registration/Login**:
   - POST `/api/auth/register` or `/api/auth/login`
   - Server returns JWT token
   - Frontend stores token in `localStorage`

2. **Protected Routes**:
   - Frontend sends token in `Authorization: Bearer <token>` header
   - Backend middleware (`protect`) verifies token
   - If valid, adds user to `req.user`
   - If invalid, returns 401

3. **Socket.IO Authentication**:
   - Client emits `authenticate` event with token
   - Server verifies token and joins user to room
   - Server emits `authenticated` event

---

## Data Models

### Student Dashboard Models

#### User Model
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  role: ['student', 'teacher', 'admin'],
  avatar: String,
  profile: {
    phone, dateOfBirth, grade, school, bio
  },
  preferences: {
    darkMode, emailNotifications, pushNotifications, weeklyReports, language
  },
  stats: {
    totalPoints, currentStreak, longestStreak, lastActiveDate,
    totalQuizzes, averageScore, badgesEarned
  },
  achievements: Array,
  isActive: Boolean,
  lastLogin: Date,
  refreshToken: String
}
```

#### Course Model
```javascript
{
  name: String,
  description: String,
  category: ['mathematics', 'physics', 'chemistry', 'biology', 'english', 'history', 'computer-science'],
  level: ['beginner', 'intermediate', 'advanced'],
  modules: [{
    name, description, topics: [{
      name, description, duration, videoUrl, thumbnail,
      content: { notes, resources, keyPoints },
      difficulty, order, isCompleted
    }],
    order, estimatedDuration
  }],
  instructor: ObjectId (ref: User),
  totalLessons: Number,
  enrollmentCount: Number,
  rating: { average, count }
}
```

#### Assessment Model
```javascript
{
  title: String,
  description: String,
  instructions: String,
  course: ObjectId (ref: Course),
  instructor: ObjectId (ref: User),
  subject: String,
  points: Number,
  dueDate: Date,
  attachments: Array,
  submissions: [{
    student: ObjectId (ref: User),
    files: Array,
    status: ['draft', 'submitted', 'graded'],
    submittedAt: Date,
    grade: Number,
    feedback: String
  }],
  type: ['assignment', 'quiz', 'project']
}
```

### Teacher Dashboard Models

#### User Model (Teacher)
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['teacher', 'admin'],
  profile: {
    firstName, lastName, phone, subject, bio, avatar
  },
  preferences: {
    theme: ['light', 'dark', 'system'],
    language, notifications: { email, push, sms }
  },
  isActive: Boolean,
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}
```

#### Class Model
```javascript
{
  name: String,
  subject: String,
  grade: String,
  description: String,
  teacher: ObjectId (ref: User),
  students: [ObjectId (ref: Student)],
  studentCount: Number,
  schedule: {
    days: Array,
    time: String,
    room: String
  },
  settings: {
    allowLateSubmissions, autoGrading, notificationsEnabled
  },
  stats: {
    totalAssignments, totalContent, averageScore, engagement
  },
  classCode: String (unique),
  codeExpiry: Date
}
```

#### Assignment Model
```javascript
{
  title: String,
  description: String,
  type: ['Assignment', 'Quiz', 'Homework', 'Project', 'Exam'],
  assignmentType: ['text', 'upload', 'quiz'],
  class: ObjectId (ref: Class),
  teacher: ObjectId (ref: User),
  dueDate: Date,
  totalMarks: Number,
  status: ['draft', 'active', 'completed', 'archived'],
  instructions: String,
  attachments: Array,
  questions: [{
    question, type, options, correctAnswer, points
  }],
  submissions: [{
    student: ObjectId (ref: Student),
    submittedAt: Date,
    content: String,
    attachments: Array,
    score: Number,
    feedback: String,
    isLate: Boolean,
    gradedAt: Date,
    gradedBy: ObjectId (ref: User)
  }],
  settings: {
    allowLateSubmissions, showScoreImmediately, randomizeQuestions, timeLimit
  },
  stats: {
    totalSubmissions, averageScore, highestScore, lowestScore
  }
}
```

---

## Integration Points

### Cross-System Communication

1. **Email-Based Assignment Submission**:
   - Teacher creates assignment in teacher dashboard
   - Assignment accessible via `/api/assignments/student/:studentEmail`
   - Student submits via student dashboard
   - No direct API communication between systems

2. **Shared Concepts**:
   - Both systems use JWT authentication (separate secrets)
   - Both use MongoDB (separate databases)
   - Both use Express.js with similar middleware

3. **Potential Integration Points**:
   - Student dashboard could call teacher API for assignment details
   - Teacher dashboard could call student API for student progress
   - Currently: Independent systems with email as linking mechanism

### API Service Configuration

#### Student Dashboard API Service
- Base URL: `http://localhost:5000/api`
- All requests include `Authorization: Bearer <token>` header
- Automatic token refresh on 401 errors
- Error handling with toast notifications

#### Teacher Dashboard API Service
- Base URL: `http://localhost:5001/api`
- All requests include `Authorization: Bearer <token>` header
- Console logging for debugging
- Error handling with error messages

---

## Security Features

### Both Systems
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation middleware
- ✅ Protected routes with authentication middleware

### Student Dashboard Specific
- ✅ Refresh token support
- ✅ Sensitive operation rate limiting
- ✅ Token verification endpoint

### Teacher Dashboard Specific
- ✅ Socket.IO authentication
- ✅ Password reset functionality
- ✅ File upload handling

---

## Environment Variables

### Student Dashboard (`.env`)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_dashboard
JWT_SECRET=<secret>
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=<refresh_secret>
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:5173
TEACHER_API_URL=http://localhost:5001
```

### Teacher Dashboard (`.env`)
```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/teacher_dashboard
JWT_SECRET=<secret>
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
JWT_REFRESH_SECRET=<refresh_secret>
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:3000
```

---

## Summary

### Student Dashboard
- **Purpose**: Student learning platform
- **Key Features**: Courses, Quizzes, Assessments, Doubts, Notes, Collections, Progress Tracking
- **Port**: 5000 (backend), 5173 (frontend)
- **Database**: `student_dashboard`
- **Total API Endpoints**: ~50+

### Teacher Dashboard
- **Purpose**: Teacher management platform
- **Key Features**: Classes, Assignments, Content, Doubt Resolution, Dashboard Analytics
- **Port**: 5001 (backend), 5173/5174 (frontend)
- **Database**: `teacher_dashboard`
- **Total API Endpoints**: ~40+
- **Real-time**: Socket.IO support

### Key Differences
1. **Separate Databases**: No shared data storage
2. **Separate Authentication**: Different JWT secrets
3. **Different Ports**: Independent servers
4. **Different Features**: Student focuses on learning, Teacher focuses on management
5. **Real-time**: Only teacher dashboard has Socket.IO

### Integration Status
- **Current**: Independent systems
- **Linking Mechanism**: Email addresses
- **Future Potential**: Shared authentication, unified database, cross-system APIs

---

**Analysis Complete** ✅

This document provides a comprehensive overview of both systems, their APIs, components, and connectivity. All endpoints, models, and integration points have been documented.

