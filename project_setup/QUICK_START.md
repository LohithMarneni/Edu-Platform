# Quick Start Guide - EduPlatform

## 🚀 Step-by-Step Setup

### 1. Install MongoDB
**Option A: Local Installation**
- Download from: https://www.mongodb.com/try/download/community
- Install and start MongoDB service
- Default connection: `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
- Go to: https://www.mongodb.com/atlas
- Create free account and cluster
- Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/`)

### 2. Install Node.js
- Download from: https://nodejs.org/
- Install Node.js (v16 or higher)

### 3. Create Environment Files

**Teacher Backend** (`teacher_dash_ba/project/backend/.env`):
```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/teacher_dashboard
JWT_SECRET=teacher_secret_key_2024_very_long_and_secure
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=teacher_refresh_secret_2024
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:3000
```

**Student Backend** (`student_dash_ba/project/backend/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_dashboard
JWT_SECRET=student_secret_key_2024_very_long_and_secure
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=student_refresh_secret_2024
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:5173
TEACHER_API_URL=http://localhost:5001
```

### 4. Install Dependencies

Open 4 separate terminal windows and run:

**Terminal 1 - Teacher Backend:**
```bash
cd teacher_dash_ba/project/backend
npm install
```

**Terminal 2 - Student Backend:**
```bash
cd student_dash_ba/project/backend
npm install
```

**Terminal 3 - Teacher Frontend:**
```bash
cd teacher_dash_ba/project
npm install
```

**Terminal 4 - Student Frontend:**
```bash
cd student_dash_ba/project
npm install
```

### 5. Start MongoDB
**Windows:**
```bash
net start MongoDB
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 6. Start All Services

**Option A: Use the startup script**
- Windows: Double-click `start_all.bat`
- Mac/Linux: Run `chmod +x start_all.sh && ./start_all.sh`

**Option B: Manual start (4 terminals)**

**Terminal 1 - Teacher Backend:**
```bash
cd teacher_dash_ba/project/backend
npm run dev
```

**Terminal 2 - Student Backend:**
```bash
cd student_dash_ba/project/backend
npm run dev
```

**Terminal 3 - Teacher Frontend:**
```bash
cd teacher_dash_ba/project
npm run dev
```

**Terminal 4 - Student Frontend:**
```bash
cd student_dash_ba/project
npm run dev
```

### 7. Access Applications

- **Teacher Dashboard**: http://localhost:3000
- **Student Dashboard**: http://localhost:5173
- **Teacher API**: http://localhost:5001/api/health
- **Student API**: http://localhost:5000/api/health

### 8. Test the Class Code Feature

1. **Teacher Side:**
   - Open http://localhost:3000
   - Register/Login as teacher
   - Create a class
   - Click "Display Class Code" to generate a code

2. **Student Side:**
   - Open http://localhost:5173
   - Register/Login as student
   - Click "Join Class by Code"
   - Enter the class code from teacher

## 🔧 Troubleshooting

### MongoDB Issues:
- **Windows**: Check if MongoDB service is running in Services
- **Connection Error**: Verify MongoDB is running on port 27017
- **Atlas**: Use full connection string with username/password

### Port Conflicts:
- Teacher Backend: 5001
- Student Backend: 5000
- Teacher Frontend: 3000
- Student Frontend: 5173

### CORS Errors:
- Check that frontend URLs in backend `.env` files match your ports
- Make sure both frontend and backend are running

### Dependencies Issues:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📁 Project Structure

```
edu_platform/
├── teacher_dash_ba/
│   ├── project/
│   │   ├── backend/          # Teacher API (Port 5001)
│   │   └── src/             # Teacher Frontend (Port 3000)
├── student_dash_ba/
│   ├── project/
│   │   ├── backend/         # Student API (Port 5000)
│   │   └── src/             # Student Frontend (Port 5173)
├── start_all.bat           # Windows startup script
├── start_all.sh            # Mac/Linux startup script
└── SETUP_GUIDE.md          # Detailed setup guide
```

## 🎯 Next Steps

1. Create teacher account
2. Create a class
3. Generate class code
4. Create student account
5. Join class with code
6. Test all features

## 📞 Support

If you encounter issues:
1. Check console logs for errors
2. Verify MongoDB is running
3. Ensure all ports are available
4. Check environment variables
5. Restart all services

