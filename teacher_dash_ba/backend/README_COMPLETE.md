# Teacher Dashboard Backend - Complete Guide

## 🎯 Complete Backend Implementation

This document provides complete information about the teacher backend implementation with all features, real-time updates, and student connectivity.

---

## ✨ Features Implemented

### 🔐 Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected routes with middleware
- ✅ Role-based access control (teacher/admin)
- ✅ Token refresh mechanism
- ✅ Password reset functionality

### 📚 Class Management
- ✅ Create, update, delete classes
- ✅ Generate unique 6-character class codes
- ✅ 30-day expiry for class codes
- ✅ Real-time student joining notifications
- ✅ Student list management
- ✅ Class statistics and analytics

### 👨‍🎓 Student Management
- ✅ Auto-create students on class join
- ✅ Manual student addition
- ✅ Remove students from classes
- ✅ Student performance tracking
- ✅ Real-time student updates via Socket.IO

### 📝 Assignment System
- ✅ Create assignments with multiple types
- ✅ File upload support
- ✅ Grade assignments
- ✅ Track submissions
- ✅ Due date management
- ✅ Late submission handling

### ❓ Doubt Resolution
- ✅ Students submit doubts
- ✅ Teachers respond to doubts
- ✅ Priority management
- ✅ Real-time doubt notifications
- ✅ Resolve/close doubts
- ✅ Voting system for answers

### 📄 Content Management
- ✅ Upload educational content
- ✅ Multiple content types (video, PDF, link, etc.)
- ✅ Organize by chapters and topics
- ✅ Track views and interactions
- ✅ Share content with classes

### 📊 Dashboard Analytics
- ✅ Real-time statistics
- ✅ Class performance metrics
- ✅ Task management
- ✅ Recent activity tracking
- ✅ Schedule management

### 🔄 Real-Time Features (Socket.IO)
- ✅ Student joining notifications
- ✅ Assignment submission alerts
- ✅ Doubt submission alerts
- ✅ Live student count updates
- ✅ Class code generation notifications

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd teacher_dash_ba/project/backend
npm install
```

### 2. Create Environment File

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/teacher_dashboard
JWT_SECRET=teacher_secret_key_2024_very_long_and_secure_make_it_random_and_complex
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
JWT_REFRESH_SECRET=teacher_refresh_secret_key_2024_very_long_and_secure
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:3000
STUDENT_API_URL=http://localhost:5000
```

### 3. Seed Database

```bash
node seed_data.js
```

This will create:
- 3 teachers with credentials
- 3 classes with class codes
- 3 students enrolled in classes
- 2 assignments
- 2 doubts
- 2 content items
- 2 tasks

### 4. Start the Server

```bash
npm run dev
```

The server will start on port **5001** with Socket.IO enabled for real-time updates.

---

## 📡 API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new teacher
```json
{
  "name": "Teacher Name",
  "email": "teacher@school.edu",
  "password": "password123",
  "role": "teacher"
}
```

#### POST `/api/auth/login`
Login
```json
{
  "email": "teacher@school.edu",
  "password": "password123"
}
```

#### GET `/api/auth/me`
Get current teacher information
- **Auth**: Bearer token required

### Classes

#### GET `/api/classes`
Get all classes for teacher
- **Auth**: Required
- **Response**: List of all classes with students

#### GET `/api/classes/:id`
Get single class details
- **Auth**: Required
- **Response**: Class with populated students, assignments, doubts, content

#### POST `/api/classes`
Create a new class
```json
{
  "name": "Algebra I",
  "subject": "Mathematics",
  "grade": "9th Grade",
  "description": "Introduction to algebra",
  "schedule": {
    "days": ["Monday", "Wednesday", "Friday"],
    "time": "10:00 AM",
    "room": "Room 101"
  }
}
```

#### PUT `/api/classes/:id`
Update class information

#### DELETE `/api/classes/:id`
Soft delete class (sets isActive to false)

#### POST `/api/classes/:id/generate-code`
Generate a new class code
- **Response**: Returns 6-character alphanumeric code with 30-day expiry

#### GET `/api/classes/:id/code`
Get current valid class code
- **Response**: Returns code if valid, error if expired

#### GET `/api/classes/:id/students`
Get all students in a class

#### POST `/api/classes/:id/students`
Add student to class
```json
{
  "name": "Student Name",
  "email": "student@email.com"
}
```

#### DELETE `/api/classes/:id/students/:studentId`
Remove student from class

#### GET `/api/classes/:id/stats`
Get class statistics
- **Response**: Student count, assignments, doubts, scores

#### POST `/api/classes/join`
Join class by code (called from student backend)
```json
{
  "classCode": "ABC123"
}
```

### Assignments

#### GET `/api/assignments`
Get all assignments for teacher

#### GET `/api/assignments/:id`
Get single assignment with submissions

#### POST `/api/assignments`
Create assignment
```json
{
  "title": "Math Homework",
  "description": "Complete problems 1-10",
  "type": "Assignment",
  "assignmentType": "text",
  "class": "classId",
  "dueDate": "2024-12-31",
  "totalMarks": 100
}
```

#### PUT `/api/assignments/:id`
Update assignment

#### DELETE `/api/assignments/:id`
Delete assignment

### Doubts

#### GET `/api/doubts`
Get all doubts

#### GET `/api/doubts/:id`
Get single doubt with responses

#### POST `/api/doubts/:id/respond`
Respond to doubt
```json
{
  "message": "Response text"
}
```

### Content

#### GET `/api/content`
Get all content

#### POST `/api/content`
Upload content
```json
{
  "title": "Lecture Video",
  "description": "Introduction video",
  "type": "video",
  "class": "classId",
  "subject": "Mathematics"
}
```

### Dashboard

#### GET `/api/dashboard/stats`
Get dashboard statistics
- **Response**: Total classes, students, assignments, pending doubts

#### GET `/api/dashboard/tasks`
Get teacher tasks

---

## 🔗 Student-Teacher Integration

### Class Code System

The system enables students to join teacher classes using unique codes:

1. **Teacher generates code** via `/api/classes/:id/generate-code`
2. **Code is displayed** to teacher (6-character alphanumeric)
3. **Student uses code** to join via student dashboard
4. **Real-time notification** sent to teacher when student joins
5. **Student appears** in teacher's class list automatically

### Real-Time Updates

Socket.IO enables real-time communication:

**Events Emitted:**
- `student_joined_class` - When student joins via code
- `student_added_to_class` - When teacher adds student manually
- `new_doubt` - When student submits a doubt
- `class_updated` - When class information changes

**Events Listened:**
- `authenticate` - Socket authentication
- `class_update` - Class modification triggers
- `doubt_submitted` - Doubt submission
- `student_joined` - Student join events

---

## 🧪 Test Credentials

### Teachers

```
Email: sarah.johnson@school.edu
Password: password123

Email: michael.chen@school.edu
Password: password123

Email: emily.davis@school.edu
Password: password123
```

### Test Class Codes (after seeding)

Generate class codes using:
```bash
POST /api/classes/:classId/generate-code
```

These codes are valid for 30 days and can be used by students to join classes.

---

## 🎛️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5001 |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017/teacher_dashboard` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | Token expiration | 7d |
| `FRONTEND_URL` | Frontend origin | `http://localhost:3000` |
| `STUDENT_API_URL` | Student backend URL | `http://localhost:5000` |

### Socket.IO Configuration

Socket.IO is configured with CORS support for:
- Frontend: `http://localhost:3000`
- Student Dashboard: `http://localhost:5173`

---

## 🔧 Real-Time Socket.IO Usage

### Connecting to Server

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5001');

socket.on('connect', () => {
  console.log('Connected to server');
  
  // Authenticate
  socket.emit('authenticate', localStorage.getItem('token'));
});

socket.on('authenticated', ({ success }) => {
  if (success) {
    console.log('Authenticated with socket server');
  }
});
```

### Listening for Events

```javascript
// Student joined class
socket.on('student_joined_class', (data) => {
  console.log('New student joined:', data.student);
  // Update UI with new student
});

// New doubt submitted
socket.on('new_doubt', (data) => {
  console.log('New doubt:', data);
  // Show notification
});
```

---

## 📊 Database Schema

### Collections

1. **users** - Teacher accounts
2. **classes** - Class information with codes
3. **students** - Student information
4. **assignments** - Assignment details
5. **content** - Educational content
6. **doubts** - Student questions
7. **tasks** - Teacher tasks

---

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5001

# Kill process
taskkill /PID <PID> /F
```

### MongoDB Connection Failed

```bash
# Start MongoDB
mongod

# Or check if MongoDB service is running
# Windows: Check Services
# Linux: systemctl status mongod
```

### Socket.IO Not Working

1. Check CORS settings in server.js
2. Verify Socket.IO client connection
3. Check authentication token
4. Review browser console for errors

---

## 🎓 Complete Integration Flow

```
Teacher Side                    Student Side
-----------                     -----------
1. Create Class                 
   ↓
2. Generate Code    ←─────────  4. Enter Code
   ↓
3. Wait for Join    ←─────────  5. Submit Code
   ↓                              ↓
6. Student Added                 6. Enrolled
   ↓                              ↓
7. Real-time Update ─────────→  8. Access Class
```

---

## 📝 Code Structure

```
backend/
├── controllers/
│   ├── auth.js          # Authentication
│   ├── classes.js        # Class management
│   ├── assignments.js    # Assignments
│   ├── doubts.js         # Doubt resolution
│   ├── content.js        # Content management
│   ├── dashboard.js      # Dashboard stats
│   └── users.js          # User management
├── models/
│   ├── User.js           # Teacher model
│   ├── Class.js          # Class model
│   ├── Student.js        # Student model
│   ├── Assignment.js     # Assignment model
│   ├── Doubt.js          # Doubt model
│   ├── Content.js         # Content model
│   └── Task.js           # Task model
├── routes/
│   ├── auth.js           # Auth routes
│   ├── classes.js        # Class routes
│   ├── assignments.js    # Assignment routes
│   ├── doubts.js         # Doubt routes
│   ├── content.js         # Content routes
│   ├── dashboard.js      # Dashboard routes
│   └── users.js          # User routes
├── middleware/
│   ├── auth.js           # Authentication middleware
│   ├── errorHandler.js   # Error handling
│   └── validation.js     # Input validation
├── server.js             # Main server with Socket.IO
└── seed_data.js          # Database seeding script
```

---

## 🎯 Next Steps

1. ✅ Create environment file
2. ✅ Run seed script
3. ✅ Start server
4. ✅ Test API endpoints
5. ✅ Test Socket.IO connections
6. ✅ Connect with frontend
7. ✅ Test real-time features
8. ✅ Deploy to production

---

## 📞 Support

For issues or questions:
1. Check logs in console
2. Review environment configuration
3. Verify database connection
4. Test API endpoints with Postman
5. Check Socket.IO connections in browser

---

**Complete Teacher Backend** - Ready for Production! 🚀


