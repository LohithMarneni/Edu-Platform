# EduPlatform Backend API

A complete, production-ready backend for the EduPlatform educational learning management system built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Complete Authentication System** - JWT-based auth with refresh tokens
- **User Management** - Profiles, preferences, progress tracking
- **Course Management** - Structured courses with modules and topics
- **Quiz System** - Interactive quizzes with multiple modes (solo, multiplayer, random)
- **Doubt Resolution** - AI-powered Q&A system with community features
- **Progress Tracking** - Detailed analytics and learning progress
- **Collections** - Personal learning library with organization features
- **Dashboard** - Comprehensive overview with recommendations
- **Real-time Features** - Live leaderboards and notifications
- **Security** - Rate limiting, input validation, CORS protection

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone and setup the backend:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/eduplatform
   
   # JWT Secrets
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex
   JWT_REFRESH_SECRET=your-refresh-token-secret-here
   
   # Server
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

3. **Start MongoDB:**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

4. **Run the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔗 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `POST /logout` - User logout
- `GET /me` - Get current user
- `PUT /password` - Update password

### Dashboard (`/api/dashboard`)
- `GET /` - Get dashboard data
- `GET /notifications` - Get user notifications
- `GET /daily-challenge` - Get daily challenge quiz

### Courses (`/api/courses`)
- `GET /` - Get all courses
- `GET /:id` - Get course by ID
- `POST /` - Create course (Teacher/Admin)
- `PUT /:id` - Update course (Teacher/Admin)
- `DELETE /:id` - Delete course (Teacher/Admin)

### Quizzes (`/api/quizzes`)
- `GET /` - Get all quizzes
- `GET /:id` - Get quiz by ID
- `POST /:id/attempt` - Submit quiz attempt
- `GET /attempts/:id` - Get attempt details
- `GET /history` - Get user's quiz history
- `GET /random` - Get random quiz

### Doubts (`/api/doubts`)
- `GET /` - Get all doubts
- `POST /` - Create new doubt
- `GET /:id` - Get doubt by ID
- `POST /:id/answers` - Add answer to doubt
- `PUT /:id/like` - Like/unlike doubt
- `PUT /:id/bookmark` - Bookmark doubt

### Progress (`/api/progress`)
- `GET /courses` - Get course progress
- `PUT /courses/:id` - Update course progress
- `GET /activity` - Get activity data
- `GET /goals` - Get weekly goals
- `POST /goals` - Create weekly goal

### Collections (`/api/collections`)
- `GET /` - Get user collection
- `POST /items` - Add item to collection
- `PUT /items/:id` - Update collection item
- `DELETE /items/:id` - Delete collection item
- `POST /folders` - Create custom folder

### Users (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /leaderboard` - Get leaderboard
- `GET /achievements` - Get user achievements

## 📊 Sample API Responses

### Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "fullName": "John Doe",
      "email": "john@example.com",
      "avatar": "https://ui-avatars.com/api/?name=John+Doe",
      "role": "student",
      "level": "Intermediate",
      "stats": {
        "totalPoints": 1250,
        "currentStreak": 7,
        "totalQuizzes": 45,
        "averageScore": 85
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Dashboard Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "fullName": "John Doe",
      "level": "Intermediate",
      "stats": {
        "totalPoints": 1250,
        "currentStreak": 7
      },
      "rank": 3
    },
    "stats": {
      "totalCourses": 6,
      "enrolledCourses": 4,
      "completedCourses": 2,
      "averageProgress": 68
    },
    "recentActivity": {
      "quizzes": [...],
      "doubts": [...],
      "videos": [...]
    },
    "recommendations": [...],
    "leaderboard": [...]
  }
}
```

### Quiz Attempt Response
```json
{
  "success": true,
  "data": {
    "attempt": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "score": 85,
      "percentage": 85,
      "correctAnswers": 17,
      "totalQuestions": 20,
      "result": "pass",
      "xpEarned": 120
    },
    "review": {
      "questions": [
        {
          "question": "What is Newton's first law?",
          "correctAnswer": "An object at rest stays at rest...",
          "explanation": "This is known as the law of inertia...",
          "userAnswer": "An object at rest stays at rest...",
          "isCorrect": true,
          "points": 5,
          "earnedPoints": 5
        }
      ]
    }
  }
}
```

## 🔒 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password Hashing** using bcryptjs
- **Rate Limiting** to prevent abuse
- **Input Validation** using express-validator
- **CORS Protection** for cross-origin requests
- **Helmet** for security headers
- **MongoDB Injection** protection

## 📈 Performance Optimizations

- **Database Indexing** for faster queries
- **Pagination** for large datasets
- **Compression** middleware for responses
- **Connection Pooling** for MongoDB
- **Caching** strategies for frequently accessed data

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Database Schema

### Users Collection
- Authentication and profile data
- Learning statistics and achievements
- Preferences and settings

### Courses Collection
- Course structure with modules and topics
- Learning materials and resources
- Progress tracking

### Quizzes Collection
- Quiz questions and answers
- Difficulty levels and categories
- Attempt tracking and scoring

### Doubts Collection
- Question and answer system
- Community interactions
- AI-generated responses

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use MongoDB Atlas or production MongoDB
3. Configure proper JWT secrets
4. Set up SSL/TLS certificates
5. Use PM2 for process management

### Docker Deployment
```bash
# Build Docker image
docker build -t eduplatform-backend .

# Run with Docker Compose
docker-compose up -d
```

## 🤝 Integration with Frontend

The backend is designed to work seamlessly with the React frontend. Key integration points:

1. **Authentication Flow**: JWT tokens for secure API access
2. **Real-time Updates**: WebSocket support for live features
3. **File Uploads**: Multer integration for media files
4. **Error Handling**: Consistent error responses
5. **CORS Configuration**: Proper cross-origin setup

### Frontend API Integration Example
```javascript
// API client setup
const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 📞 Support

For questions or issues:
- Check the API documentation
- Review error logs in the console
- Ensure MongoDB is running
- Verify environment variables are set correctly

## 🔄 Updates

The backend is designed to be easily extensible. To add new features:
1. Create new models in `/models`
2. Add routes in `/routes`
3. Implement controllers with proper validation
4. Update API documentation

---

**Ready to power your educational platform! 🎓✨**