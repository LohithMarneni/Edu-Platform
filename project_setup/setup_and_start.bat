@echo off
echo ========================================
echo EduPlatform Complete Setup and Start
echo ========================================
echo.

echo [1/6] Installing Student Frontend Dependencies...
cd student_dash_ba\project
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install student frontend dependencies
    pause
    exit /b 1
)
echo ✓ Student frontend dependencies installed
echo.

echo [2/6] Installing Student Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install student backend dependencies
    pause
    exit /b 1
)
echo ✓ Student backend dependencies installed
echo.

echo [3/6] Installing Teacher Frontend Dependencies...
cd ..\..\teacher_dash_ba\project
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install teacher frontend dependencies
    pause
    exit /b 1
)
echo ✓ Teacher frontend dependencies installed
echo.

echo [4/6] Installing Teacher Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install teacher backend dependencies
    pause
    exit /b 1
)
echo ✓ Teacher backend dependencies installed
echo.

echo [5/6] Creating Environment Files...
cd ..\..\..
call create_env_files.js
if %errorlevel% neq 0 (
    echo ERROR: Failed to create environment files
    pause
    exit /b 1
)
echo ✓ Environment files created
echo.

echo [6/6] Starting All Services...
echo.
echo Starting Student Backend (Port 5000)...
start "Student Backend" cmd /k "cd student_dash_ba\project\backend && npm run dev"

echo Starting Teacher Backend (Port 5001)...
start "Teacher Backend" cmd /k "cd teacher_dash_ba\project\backend && npm run dev"

echo Starting Student Frontend (Port 5173)...
start "Student Frontend" cmd /k "cd student_dash_ba\project && npm run dev"

echo Starting Teacher Frontend (Port 3000)...
start "Teacher Frontend" cmd /k "cd teacher_dash_ba\project && npm run dev"

echo.
echo ========================================
echo All services are starting up!
echo ========================================
echo.
echo Student Dashboard: http://localhost:5173
echo Teacher Dashboard: http://localhost:3000
echo Student API: http://localhost:5000
echo Teacher API: http://localhost:5001
echo.
echo Please wait for all services to start up completely.
echo Check the terminal windows for any errors.
echo.
pause
