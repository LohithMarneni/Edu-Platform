const fs = require('fs');
const path = require('path');

console.log('🔧 Creating environment files...');

// Teacher backend .env
const teacherEnvContent = `NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/teacher_dashboard
JWT_SECRET=teacher_secret_key_2024_very_long_and_secure
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=teacher_refresh_secret_2024
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:3000`;

// Student backend .env
const studentEnvContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_dashboard
JWT_SECRET=student_secret_key_2024_very_long_and_secure
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=student_refresh_secret_2024
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:5173
TEACHER_API_URL=http://localhost:5001`;

try {
  // Create teacher backend .env
  const teacherEnvPath = path.join('teacher_dash_ba', 'project', 'backend', '.env');
  fs.writeFileSync(teacherEnvPath, teacherEnvContent);
  console.log('✅ Created teacher backend .env file');

  // Create student backend .env
  const studentEnvPath = path.join('student_dash_ba', 'project', 'backend', '.env');
  fs.writeFileSync(studentEnvPath, studentEnvContent);
  console.log('✅ Created student backend .env file');

  console.log('🎉 Environment files created successfully!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Start MongoDB: mongod');
  console.log('2. Start teacher backend: cd teacher_dash_ba/project/backend && npm run dev');
  console.log('3. Start student backend: cd student_dash_ba/project/backend && npm run dev');
  console.log('4. Start teacher frontend: cd teacher_dash_ba/project && npm run dev');
  console.log('5. Start student frontend: cd student_dash_ba/project && npm run dev');

} catch (error) {
  console.error('❌ Error creating environment files:', error);
}
