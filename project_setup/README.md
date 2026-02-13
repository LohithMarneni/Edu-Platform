# EduPlatform - Complete Educational Learning Management System

## 🎯 Project Overview

EduPlatform is a comprehensive educational platform with separate dashboards for students and teachers, featuring AI-powered doubt resolution, course management, and interactive learning tools.

## 🏗️ Architecture

### Student Dashboard (`student_dash_ba/`)
- **Frontend**: React + Vite + Tailwind CSS (Port 5173)
- **Backend**: Node.js + Express + MongoDB (Port 5000)
- **Features**: Course enrollment, doubt resolution, progress tracking, notes, quizzes

### Teacher Dashboard (`teacher_dash_ba/`)
- **Frontend**: React + Vite + Tailwind CSS (Port 3000)
- **Backend**: Node.js + Express + MongoDB (Port 5001)
- **Features**: Class management, assignment creation, doubt resolution, content management

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the automated setup script
setup_and_start.bat
```

### Option 2: Manual Setup

#### 1. Install Dependencies
```bash
# Student Frontend
cd student_dash_ba/project
npm install

# Student Backend
cd backend
npm install

# Teacher Frontend
cd ../../teacher_dash_ba/project
npm install

# Teacher Backend
cd backend
npm install
```

#### 2. Create Environment Files
```bash
# Run the environment setup script
node create_env_files.js
```

#### 3. Start Services
```bash
# Terminal 1: Student Backend
cd student_dash_ba/project/backend
npm run dev

# Terminal 2: Teacher Backend
cd teacher_dash_ba/project/backend
npm run dev

# Terminal 3: Student Frontend
cd student_dash_ba/project
npm run dev

# Terminal 4: Teacher Frontend
cd teacher_dash_ba/project
npm run dev
```

## 🌐 Access Points

- **Student Dashboard**: http://localhost:5173
- **Teacher Dashboard**: http://localhost:3000
- **Student API**: http://localhost:5000
- **Teacher API**: http://localhost:5001

## 🔑 Demo Credentials

### Student Dashboard
- **Email**: demo@eduplatform.com
- **Password**: demo123

### Teacher Dashboard
- **Email**: teacher@demo.com
- **Password**: demo123

## 📋 Features

### Student Features
- ✅ **Dashboard**: Progress tracking, recent activities, goals
- ✅ **Courses**: Browse and enroll in courses
- ✅ **Doubt Resolution**: AI-powered Q&A with community support
- ✅ **Notes**: Take and organize notes from doubts
- ✅ **Progress**: Track learning progress and achievements
- ✅ **Quizzes**: Take assessments and view results
- ✅ **Collections**: Organize saved content

### Teacher Features
- ✅ **Dashboard**: Class overview, tasks, schedule
- ✅ **Classes**: Create and manage classes
- ✅ **Assignments**: Create and grade assignments
- ✅ **Content**: Upload and organize educational content
- ✅ **Doubts**: Answer student questions
- ✅ **Reports**: View class performance analytics

## 🛠️ Technical Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Heroicons** - Icons
- **Chart.js** - Data visualization
- **React Hot Toast** - Notifications
- **MDEditor** - Markdown editing

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Express Rate Limit** - Rate limiting
- **Helmet** - Security

## 📁 Project Structure

```
edu_platform/
├── student_dash_ba/
│   └── project/
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── services/       # API services
│       │   └── App.jsx         # Main app component
│       └── backend/
│           ├── controllers/    # Route handlers
│           ├── models/         # Database models
│           ├── routes/         # API routes
│           ├── middleware/     # Custom middleware
│           └── server.js       # Server entry point
├── teacher_dash_ba/
│   └── project/
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── pages/          # Page components
│       │   ├── services/       # API services
│       │   └── App.jsx         # Main app component
│       └── backend/
│           ├── controllers/    # Route handlers
│           ├── models/         # Database models
│           ├── routes/         # API routes
│           ├── middleware/     # Custom middleware
│           └── server.js       # Server entry point
└── setup_and_start.bat        # Automated setup script
```

## 🔧 Configuration

### Environment Variables

#### Student Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_dashboard
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure_student_dashboard_2024
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here_student_dashboard_2024
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:5173
TEACHER_API_URL=http://localhost:5001
```

#### Teacher Backend (.env)
```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/teacher_dashboard
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure_teacher_dashboard_2024
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
JWT_REFRESH_SECRET=your_refresh_secret_key_here_teacher_dashboard_2024
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:3000
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Check if ports 3000, 5000, 5001, 5173 are available
   - Kill existing processes: `netstat -ano | findstr :PORT`

2. **MongoDB Connection Issues**
   - Ensure MongoDB is running
   - Check connection string in .env files

3. **Dependencies Installation Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and package-lock.json, then reinstall

4. **CORS Issues**
   - Verify FRONTEND_URL in backend .env files
   - Check if frontend URLs match the configured origins

### Debug Mode
- Set `NODE_ENV=development` in .env files
- Check console logs for detailed error messages
- Use browser developer tools for frontend debugging

## 📚 API Documentation

### Student API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/dashboard` - Dashboard data
- `GET /api/courses` - Get courses
- `GET /api/doubts` - Get doubts
- `POST /api/doubts` - Create doubt
- `GET /api/notes` - Get notes
- `POST /api/notes` - Create note

### Teacher API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/login` - Teacher login
- `POST /api/auth/register` - Teacher registration
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/classes` - Get classes
- `POST /api/classes` - Create class
- `GET /api/assignments` - Get assignments
- `POST /api/assignments` - Create assignment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review the console logs
3. Ensure all dependencies are installed
4. Verify environment configuration

---

**Happy Learning! 🎓**
