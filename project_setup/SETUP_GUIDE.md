# EduPlatform Setup Guide

This guide will help you set up the complete EduPlatform with MongoDB, frontend, and backend connections.

## Prerequisites

1. **Node.js** (v16 or higher) - Download from [nodejs.org](https://nodejs.org/)
2. **MongoDB** - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
3. **Git** (optional) - For version control

## Step 1: Install MongoDB

### Windows:
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Make sure to install MongoDB as a Windows Service
4. MongoDB will be available at `mongodb://localhost:27017`

### Alternative: Use MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

## Step 2: Environment Configuration

### Teacher Dashboard Backend
Create `.env` file in `teacher_dash_ba/project/backend/`:

```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/teacher_dashboard
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:3000
```

### Student Dashboard Backend
Create `.env` file in `student_dash_ba/project/backend/`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_dashboard
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:5173
TEACHER_API_URL=http://localhost:5001
```

## Step 3: Install Dependencies

### Install Backend Dependencies

```bash
# Teacher Dashboard Backend
cd teacher_dash_ba/project/backend
npm install

# Student Dashboard Backend
cd ../../../student_dash_ba/project/backend
npm install
```

### Install Frontend Dependencies

```bash
# Teacher Dashboard Frontend
cd ../../teacher_dash_ba/project
npm install

# Student Dashboard Frontend
cd ../student_dash_ba/project
npm install
```

## Step 4: Start MongoDB

### Windows (if installed locally):
1. Open Command Prompt as Administrator
2. Run: `net start MongoDB`
3. Or use MongoDB Compass to start the service

### Alternative: Use MongoDB Atlas
- No local installation needed, just use the connection string from Atlas

## Step 5: Start the Applications

### Terminal 1: Teacher Backend
```bash
cd teacher_dash_ba/project/backend
npm run dev
```

### Terminal 2: Student Backend
```bash
cd student_dash_ba/project/backend
npm run dev
```

### Terminal 3: Teacher Frontend
```bash
cd teacher_dash_ba/project
npm run dev
```

### Terminal 4: Student Frontend
```bash
cd student_dash_ba/project
npm run dev
```

## Step 6: Access the Applications

- **Teacher Dashboard**: http://localhost:3000
- **Student Dashboard**: http://localhost:5173
- **Teacher API**: http://localhost:5001
- **Student API**: http://localhost:5000

## Step 7: Test the Setup

1. Open both frontend applications
2. Try to register/login
3. Test the class code functionality:
   - In teacher dashboard: Create a class and generate a class code
   - In student dashboard: Use the class code to join the class

## Troubleshooting

### MongoDB Connection Issues:
1. Make sure MongoDB is running
2. Check the connection string in `.env` files
3. For local MongoDB: `mongodb://localhost:27017/database_name`
4. For Atlas: Use the full connection string from Atlas

### Port Conflicts:
- Teacher Backend: Port 5001
- Student Backend: Port 5000
- Teacher Frontend: Port 3000
- Student Frontend: Port 5173

### CORS Issues:
- Make sure the frontend URLs in backend `.env` files match your frontend ports

## Development Scripts

### Backend Scripts:
```bash
npm run dev    # Start with nodemon (auto-restart)
npm start      # Start normally
npm test       # Run tests
```

### Frontend Scripts:
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

## Database Structure

The application uses two separate databases:
- `teacher_dashboard` - For teacher-related data
- `student_dashboard` - For student-related data

Both can use the same MongoDB instance with different database names.

## Next Steps

1. Create your first teacher account
2. Create a class
3. Generate a class code
4. Create a student account
5. Join the class using the code
6. Test all functionality

## Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify MongoDB is running
3. Check that all ports are available
4. Ensure all dependencies are installed
