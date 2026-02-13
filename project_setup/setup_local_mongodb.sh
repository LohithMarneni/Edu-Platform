#!/bin/bash

echo "Setting up EduPlatform with Local MongoDB"
echo "=========================================="

echo ""
echo "Step 1: Checking MongoDB installation..."
if ! command -v mongosh &> /dev/null; then
    echo "❌ MongoDB not found. Please install MongoDB first."
    echo "Mac: brew install mongodb-community"
    echo "Linux: Follow instructions at https://docs.mongodb.com/manual/installation/"
    exit 1
fi
echo "✅ MongoDB found"

echo ""
echo "Step 2: Starting MongoDB service..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac
    brew services start mongodb/brew/mongodb-community
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    sudo systemctl start mongod
    sudo systemctl enable mongod
fi
echo "✅ MongoDB service started"

echo ""
echo "Step 3: Installing required dependencies..."
npm install mongodb bcryptjs
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"

echo ""
echo "Step 4: Creating database collections..."
node create_collections.js
if [ $? -ne 0 ]; then
    echo "❌ Failed to create collections"
    exit 1
fi
echo "✅ Collections created"

echo ""
echo "Step 5: Seeding sample data..."
node seed_sample_data.js
if [ $? -ne 0 ]; then
    echo "❌ Failed to seed data"
    exit 1
fi
echo "✅ Sample data seeded"

echo ""
echo "Step 6: Creating environment files..."

echo "Creating teacher backend .env file..."
cat > teacher_dash_ba/project/backend/.env << EOF
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/teacher_dashboard
JWT_SECRET=teacher_secret_key_2024_very_long_and_secure
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=teacher_refresh_secret_2024
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:3000
EOF

echo "Creating student backend .env file..."
cat > student_dash_ba/project/backend/.env << EOF
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
EOF

echo "✅ Environment files created"

echo ""
echo "=========================================="
echo "🎉 Setup completed successfully!"
echo ""
echo "📊 Databases created:"
echo "   - teacher_dashboard (Port 27017)"
echo "   - student_dashboard (Port 27017)"
echo ""
echo "🔑 Test Credentials:"
echo "   Teachers:"
echo "     - sarah.johnson@school.edu / password123"
echo "     - michael.chen@school.edu / password123"
echo "   Students:"
echo "     - alice.johnson@student.edu / password123"
echo "     - bob.smith@student.edu / password123"
echo ""
echo "🚀 Next steps:"
echo "   1. Start teacher backend: cd teacher_dash_ba/project/backend && npm run dev"
echo "   2. Start student backend: cd student_dash_ba/project/backend && npm run dev"
echo "   3. Start teacher frontend: cd teacher_dash_ba/project && npm run dev"
echo "   4. Start student frontend: cd student_dash_ba/project && npm run dev"
echo ""
echo "=========================================="
