# MongoDB Local Setup Guide

## Prerequisites
- MongoDB installed locally (version 4.4 or higher)
- Node.js installed (version 16 or higher)
- npm or yarn package manager

## Step 1: Install MongoDB Locally

### Windows
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. **Important**: Check "Install MongoDB as a Windows Service"
5. Install MongoDB Compass (optional GUI tool)

### Mac
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org
```

## Step 2: Start MongoDB

### Windows
```cmd
# Open Command Prompt as Administrator
net start MongoDB
```

### Mac
```bash
brew services start mongodb/brew/mongodb-community
```

### Linux
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Step 3: Verify MongoDB is Running

Open a new terminal and test the connection:
```bash
mongosh mongodb://localhost:27017
```

If successful, you'll see the MongoDB shell. Type `exit` to quit.

## Step 4: Install Required Dependencies

```bash
# Install MongoDB driver and bcrypt
npm install mongodb bcryptjs
```

## Step 5: Create Database Collections

Run the collection creation script:
```bash
node create_collections.js
```

This will create:
- **teacher_dashboard** database with collections: users, classes, students, assignments, content, doubts, tasks
- **student_dashboard** database with collections: users, courses, quizzes, quizattempts, courseprogresses, dailyactivities, weeklygoals, usercollections, doubts, videonotes

## Step 6: Seed Sample Data

Run the data seeding script:
```bash
node seed_sample_data.js
```

This will populate the databases with sample data for testing.

## Step 7: Verify Setup

### Check Databases
```bash
# Connect to MongoDB
mongosh

# List databases
show dbs

# Use teacher database
use teacher_dashboard
show collections

# Use student database
use student_dashboard
show collections
```

### Test Sample Data
```bash
# Check teacher users
db.users.find().pretty()

# Check classes
db.classes.find().pretty()

# Check student users
use student_dashboard
db.users.find().pretty()

# Check courses
db.courses.find().pretty()
```

## Step 8: Update Environment Files

### Teacher Backend (.env)
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

### Student Backend (.env)
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

## Step 9: Test the Applications

1. Start the teacher backend:
```bash
cd teacher_dash_ba/project/backend
npm run dev
```

2. Start the student backend:
```bash
cd student_dash_ba/project/backend
npm run dev
```

3. Test the APIs:
- Teacher API: http://localhost:5001/api/health
- Student API: http://localhost:5000/api/health

## Database Structure

### Teacher Dashboard Database
```
teacher_dashboard/
├── users (teachers/admins)
├── classes (class management)
├── students (student records)
├── assignments (assignments/quizzes)
├── content (educational content)
├── doubts (doubt resolution)
└── tasks (teacher tasks)
```

### Student Dashboard Database
```
student_dashboard/
├── users (students)
├── courses (learning content)
├── quizzes (assessment system)
├── quizattempts (student performance)
├── courseprogresses (learning progress)
├── dailyactivities (activity tracking)
├── weeklygoals (goal setting)
├── usercollections (personal knowledge base)
├── doubts (student questions)
└── videonotes (learning notes)
```

## Sample Data Created

### Teachers
- **Dr. Sarah Johnson** (sarah.johnson@school.edu / password123)
- **Prof. Michael Chen** (michael.chen@school.edu / password123)

### Students
- **Alice Johnson** (alice.johnson@student.edu / password123)
- **Bob Smith** (bob.smith@student.edu / password123)

### Classes
- **Advanced Mathematics** (Class Code: MATH12)
- **Physics Fundamentals** (Class Code: PHYS11)

### Courses
- **Advanced Mathematics** (Calculus and Algebra)
- **Physics Fundamentals** (Mechanics and Thermodynamics)

## Troubleshooting

### MongoDB Won't Start
```bash
# Windows - Check service status
sc query MongoDB

# Windows - Start service
net start MongoDB

# Mac/Linux - Check status
sudo systemctl status mongod

# Mac/Linux - Start service
sudo systemctl start mongod
```

### Port 27017 Already in Use
```bash
# Find what's using the port
netstat -ano | findstr :27017

# Kill the process (Windows)
taskkill /f /im mongod.exe
```

### Permission Denied
- **Windows**: Run Command Prompt as Administrator
- **Mac/Linux**: Use `sudo` for service commands

### Connection Issues
- Verify MongoDB is running on port 27017
- Check firewall settings
- Ensure MongoDB service is enabled

## Next Steps

1. Start both backend servers
2. Start both frontend applications
3. Test the class code functionality:
   - Login as teacher and create a class
   - Generate a class code
   - Login as student and join using the code
4. Explore all features and functionality

Your local MongoDB setup is now complete with sample data for testing!
