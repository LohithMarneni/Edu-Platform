# 🚀 Backend Setup Guide - EduPlatform

## ✅ What's Been Updated

I've successfully updated both backends to connect to your local MongoDB databases and retrieve data. Here's what was implemented:

### **Teacher Backend Updates:**
- ✅ Updated `server.js` with proper MongoDB connection
- ✅ Enhanced error handling and logging
- ✅ Connected to `teacher_dashboard` database
- ✅ All existing controllers work with the database

### **Student Backend Updates:**
- ✅ Updated `server.js` with proper MongoDB connection  
- ✅ Created missing controllers:
  - `controllers/auth.js` - Authentication (login, register, logout)
  - `controllers/courses.js` - Course management and enrollment
  - `controllers/dashboard.js` - Student dashboard data
  - `controllers/quizzes.js` - Quiz system
- ✅ Updated routes to use new controllers
- ✅ Connected to `student_dashboard` database

### **Environment Files:**
- ✅ Created `.env` files for both backends
- ✅ Proper MongoDB URIs configured
- ✅ JWT secrets and other settings configured

## 📋 Prerequisites

### **1. Install MongoDB**

**Windows:**
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer
3. **Important**: Check "Install MongoDB as a Windows Service"
4. Add MongoDB to your PATH:
   - Add `C:\Program Files\MongoDB\Server\7.0\bin` to your PATH
   - Or run: `set PATH=%PATH%;C:\Program Files\MongoDB\Server\7.0\bin`

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Linux:**
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### **2. Start MongoDB**

**Windows:**
```cmd
# Start MongoDB service
net start MongoDB

# Or start manually
mongod --dbpath C:\data\db
```

**Mac:**
```bash
brew services start mongodb/brew/mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

## 🚀 Starting the Backends

### **Step 1: Start Teacher Backend**
```bash
cd teacher_dash_ba/project/backend
npm install
npm run dev
# or
node server.js
```

**Expected Output:**
```
✅ Teacher Backend - MongoDB Connected: localhost
📊 Database: teacher_dashboard
🚀 Server running on port 5001 in development mode
```

### **Step 2: Start Student Backend**
```bash
cd student_dash_ba/project/backend
npm install
npm run dev
# or
node server.js
```

**Expected Output:**
```
✅ Student Backend - Connected to MongoDB successfully
📊 Database: student_dashboard
🚀 Server running on port 5000 in development mode
```

## 🧪 Testing the Backends

### **Test Teacher Backend:**
```bash
# Health check
curl http://localhost:5001/api/health

# Expected response:
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-XX...",
  "environment": "development"
}
```

### **Test Student Backend:**
```bash
# Health check
curl http://localhost:5000/api/health

# Expected response:
{
  "success": true,
  "message": "EduPlatform API is running successfully!",
  "timestamp": "2024-01-XX...",
  "environment": "development"
}
```

## 📊 Database Collections Created

### **Teacher Database (`teacher_dashboard`):**
- `users` - Teachers and admins
- `classes` - Class management with class codes
- `students` - Student records
- `assignments` - Assignments and quizzes
- `content` - Educational content
- `doubts` - Doubt resolution system
- `tasks` - Teacher tasks

### **Student Database (`student_dashboard`):**
- `users` - Students
- `courses` - Learning content
- `quizzes` - Assessment system
- `quizattempts` - Student performance
- `courseprogresses` - Learning progress
- `dailyactivities` - Activity tracking
- `weeklygoals` - Goal setting
- `usercollections` - Personal knowledge base
- `doubts` - Student questions
- `videonotes` - Learning notes

## 🔑 Test Credentials

### **Teachers:**
- **Dr. Sarah Johnson**: sarah.johnson@school.edu / password123
- **Prof. Michael Chen**: michael.chen@school.edu / password123

### **Students:**
- **Alice Johnson**: alice.johnson@student.edu / password123
- **Bob Smith**: bob.smith@student.edu / password123

## 🎯 API Endpoints

### **Teacher Backend (Port 5001):**
- `POST /api/auth/login` - Teacher login
- `GET /api/classes` - Get teacher's classes
- `POST /api/classes/:id/generate-code` - Generate class code
- `GET /api/classes/:id/code` - Get class code
- `POST /api/classes/join` - Student join by code

### **Student Backend (Port 5000):**
- `POST /api/auth/login` - Student login
- `GET /api/courses` - Get available courses
- `GET /api/dashboard` - Get student dashboard
- `POST /api/quizzes/:id/attempt` - Submit quiz
- `GET /api/classes/join` - Join class by code

## 🔧 Troubleshooting

### **MongoDB Connection Issues:**
1. **MongoDB not running**: Start MongoDB service
2. **Port 27017 in use**: Check if MongoDB is already running
3. **Permission denied**: Run as administrator (Windows)

### **Backend Connection Issues:**
1. **Port already in use**: Change PORT in .env files
2. **Database not found**: Run the database setup scripts
3. **Authentication failed**: Check JWT secrets in .env files

### **Common Commands:**
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ismaster')"

# List databases
mongosh --eval "show dbs"

# Check if collections exist
mongosh teacher_dashboard --eval "show collections"
mongosh student_dashboard --eval "show collections"
```

## 🎉 Next Steps

1. **Start MongoDB** (if not already running)
2. **Start Teacher Backend** (Port 5001)
3. **Start Student Backend** (Port 5000)
4. **Start Frontends** (Ports 3000 and 5173)
5. **Test the class code functionality**:
   - Login as teacher → Create class → Generate code
   - Login as student → Join class by code

Your backends are now fully connected to the MongoDB databases and ready to retrieve data! 🚀

