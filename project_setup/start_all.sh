#!/bin/bash

echo "Starting EduPlatform - All Services"
echo "===================================="

echo ""
echo "Step 1: Starting Teacher Backend (Port 5001)..."
gnome-terminal -- bash -c "cd teacher_dash_ba/project/backend && npm run dev; exec bash" &

sleep 3

echo ""
echo "Step 2: Starting Student Backend (Port 5000)..."
gnome-terminal -- bash -c "cd student_dash_ba/project/backend && npm run dev; exec bash" &

sleep 3

echo ""
echo "Step 3: Starting Teacher Frontend (Port 3000)..."
gnome-terminal -- bash -c "cd teacher_dash_ba/project && npm run dev; exec bash" &

sleep 3

echo ""
echo "Step 4: Starting Student Frontend (Port 5173)..."
gnome-terminal -- bash -c "cd student_dash_ba/project && npm run dev; exec bash" &

echo ""
echo "===================================="
echo "All services are starting..."
echo ""
echo "Teacher Dashboard: http://localhost:3000"
echo "Student Dashboard: http://localhost:5173"
echo "Teacher API: http://localhost:5001"
echo "Student API: http://localhost:5000"
echo ""
echo "Make sure MongoDB is running before using the applications!"
echo "===================================="

