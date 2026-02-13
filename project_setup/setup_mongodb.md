# MongoDB Setup Guide

## Option 1: Local MongoDB Installation

### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB as a Windows Service
5. Install MongoDB Compass (optional GUI tool)
6. Start MongoDB service:
   ```cmd
   net start MongoDB
   ```

### Mac:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### Linux (Ubuntu/Debian):
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Option 2: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new project
4. Create a free cluster (M0 Sandbox)
5. Create a database user
6. Whitelist your IP address (0.0.0.0/0 for all IPs)
7. Get your connection string

### Connection String Format:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

## Test MongoDB Connection

### Using MongoDB Compass:
1. Download from: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017` (local) or your Atlas connection string

### Using Command Line:
```bash
# Local MongoDB
mongosh mongodb://localhost:27017

# Atlas MongoDB
mongosh "mongodb+srv://username:password@cluster.mongodb.net/"
```

## Environment Configuration

### For Local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/teacher_dashboard
MONGODB_URI=mongodb://localhost:27017/student_dashboard
```

### For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/teacher_dashboard
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student_dashboard
```

## Verify MongoDB is Running

### Windows:
```cmd
# Check if service is running
sc query MongoDB

# Start service if not running
net start MongoDB
```

### Mac/Linux:
```bash
# Check if process is running
ps aux | grep mongod

# Check service status
sudo systemctl status mongod
```

## Common Issues

### Port 27017 already in use:
- Check if MongoDB is already running
- Kill existing process: `taskkill /f /im mongod.exe` (Windows)
- Or change MongoDB port in configuration

### Authentication failed:
- For Atlas: Check username/password
- For local: Make sure authentication is disabled for development

### Connection timeout:
- Check firewall settings
- Verify IP whitelist in Atlas
- Ensure MongoDB service is running

