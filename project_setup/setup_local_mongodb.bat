@echo off
echo Setting up EduPlatform with Local MongoDB
echo ==========================================

echo.
echo Step 1: Checking MongoDB installation...
mongosh --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB not found. Please install MongoDB first.
    echo Download from: https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)
echo ✅ MongoDB found

echo.
echo Step 2: Starting MongoDB service...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB service might already be running or needs manual start
    echo Please run: net start MongoDB
)
echo ✅ MongoDB service started

echo.
echo Step 3: Installing required dependencies...
npm install mongodb bcryptjs
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo Step 4: Creating database collections...
node create_collections.js
if %errorlevel% neq 0 (
    echo ❌ Failed to create collections
    pause
    exit /b 1
)
echo ✅ Collections created

echo.
echo Step 5: Seeding sample data...
node seed_sample_data.js
if %errorlevel% neq 0 (
    echo ❌ Failed to seed data
    pause
    exit /b 1
)
echo ✅ Sample data seeded

echo.
echo Step 6: Creating environment files...

echo Creating teacher backend .env file...
(
echo NODE_ENV=development
echo PORT=5001
echo MONGODB_URI=mongodb://localhost:27017/teacher_dashboard
echo JWT_SECRET=teacher_secret_key_2024_very_long_and_secure
echo JWT_EXPIRE=7d
echo JWT_REFRESH_SECRET=teacher_refresh_secret_2024
echo RATE_LIMIT_WINDOW=15
echo RATE_LIMIT_MAX_REQUESTS=100
echo FRONTEND_URL=http://localhost:3000
) > teacher_dash_ba\project\backend\.env

echo Creating student backend .env file...
(
echo NODE_ENV=development
echo PORT=5000
echo MONGODB_URI=mongodb://localhost:27017/student_dashboard
echo JWT_SECRET=student_secret_key_2024_very_long_and_secure
echo JWT_EXPIRE=7d
echo JWT_REFRESH_SECRET=student_refresh_secret_2024
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX_REQUESTS=100
echo FRONTEND_URL=http://localhost:5173
echo TEACHER_API_URL=http://localhost:5001
) > student_dash_ba\project\backend\.env

echo ✅ Environment files created

echo.
echo ==========================================
echo 🎉 Setup completed successfully!
echo.
echo 📊 Databases created:
echo    - teacher_dashboard (Port 27017)
echo    - student_dashboard (Port 27017)
echo.
echo 🔑 Test Credentials:
echo    Teachers:
echo      - sarah.johnson@school.edu / password123
echo      - michael.chen@school.edu / password123
echo    Students:
echo      - alice.johnson@student.edu / password123
echo      - bob.smith@student.edu / password123
echo.
echo 🚀 Next steps:
echo    1. Start teacher backend: cd teacher_dash_ba\project\backend && npm run dev
echo    2. Start student backend: cd student_dash_ba\project\backend && npm run dev
echo    3. Start teacher frontend: cd teacher_dash_ba\project && npm run dev
echo    4. Start student frontend: cd student_dash_ba\project && npm run dev
echo.
echo ==========================================
pause
