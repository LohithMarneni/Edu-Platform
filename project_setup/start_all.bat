@echo off
echo Starting EduPlatform - All Services
echo ====================================

echo.
echo Step 1: Starting Teacher Backend (Port 5001)...
start "Teacher Backend" cmd /k "cd teacher_dash_ba\project\backend && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo Step 2: Starting Student Backend (Port 5000)...
start "Student Backend" cmd /k "cd student_dash_ba\project\backend && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo Step 3: Starting Teacher Frontend (Port 3000)...
start "Teacher Frontend" cmd /k "cd teacher_dash_ba\project && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo Step 4: Starting Student Frontend (Port 5173)...
start "Student Frontend" cmd /k "cd student_dash_ba\project && npm run dev"

echo.
echo ====================================
echo All services are starting...
echo.
echo Teacher Dashboard: http://localhost:3000
echo Student Dashboard: http://localhost:5173
echo Teacher API: http://localhost:5001
echo Student API: http://localhost:5000
echo.
echo Make sure MongoDB is running before using the applications!
echo ====================================
pause

