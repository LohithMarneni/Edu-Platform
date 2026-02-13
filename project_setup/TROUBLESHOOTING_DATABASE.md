# Troubleshooting: Database Not Showing in MongoDB

## 🚨 Problem: Database `education_portal` not visible in MongoDB Compass

## ✅ Quick Fix: Run Database Creation Script

I've created a simple script to force-create the database. Run this:

```bash
node create_database.js
```

This will:
1. Connect to MongoDB
2. Create the `education_portal` database
3. Insert a test document
4. Show you all collections
5. Clean up and exit

---

## 🔍 Step-by-Step Troubleshooting

### Step 1: Check if MongoDB is Running

**Windows:**
```bash
# Check if MongoDB service is running
sc query MongoDB

# Or check in Task Manager for mongod.exe
```

**Start MongoDB if not running:**
```bash
# Option 1: Start MongoDB service
net start MongoDB

# Option 2: Start manually
mongod --dbpath "C:\data\db"
```

**Mac/Linux:**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod --dbpath /data/db
# or
brew services start mongodb-community
```

---

### Step 2: Verify Connection String

Check your `.env` files:

**Student Backend** (`student_dash_ba/project/backend/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/education_portal
```

**Teacher Backend** (`teacher_dash_ba/project/backend/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/education_portal
```

---

### Step 3: Start Backend and Check Logs

**Start Student Backend:**
```bash
cd student_dash_ba/project/backend
npm start
```

**Look for these logs:**
```
✅ Student Backend - Connected to MongoDB successfully
📊 Database: education_portal
🔧 Initializing education_portal database...
✅ Database "education_portal" created successfully
```

**If you see errors:**
- `ECONNREFUSED` → MongoDB is not running
- `Authentication failed` → Wrong credentials
- `Database name mismatch` → Check `.env` file

---

### Step 4: Use the Database Creation Script

If backend logs show connection but database still doesn't appear:

```bash
# From project root
node create_database.js
```

**Expected Output:**
```
🔧 Connecting to MongoDB...
📡 Connection string: mongodb://localhost:27017/education_portal
✅ Connected to MongoDB successfully!
📊 Database name: education_portal
🔧 Creating database "education_portal"...
✅ Database "education_portal" created successfully!
✅ SUCCESS! Database "education_portal" is now created.
💡 Refresh MongoDB Compass to see it!
```

---

### Step 5: Refresh MongoDB Compass

1. **Close MongoDB Compass** completely
2. **Reopen MongoDB Compass**
3. **Connect** to: `mongodb://localhost:27017`
4. **Look** for `education_portal` in the database list
5. **Click refresh** button if needed

**Or manually refresh:**
- Click the **refresh icon** (circular arrow) in Compass
- Or press `F5`

---

### Step 6: Verify Database Exists via MongoDB Shell

**Open MongoDB Shell:**
```bash
mongosh
```

**Run these commands:**
```javascript
// Show all databases
show dbs

// Use education_portal database
use education_portal

// Show collections
show collections

// Count documents in users collection (if exists)
db.users.countDocuments()
```

**Expected Output:**
```
> show dbs
admin             40.00 KiB
config           108.00 KiB
education_portal  40.00 KiB    ← Should see this!
local             72.00 KiB

> use education_portal
switched to db education_portal

> show collections
users    ← Collections appear as data is added
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Database not showing in Compass"

**Cause:** MongoDB creates databases lazily (only after first document insert)

**Solution:**
1. Run `node create_database.js`
2. Or start backend and create a user/class
3. Refresh Compass

---

### Issue 2: "Connection refused" error

**Cause:** MongoDB service not running

**Solution:**
```bash
# Windows
net start MongoDB

# Mac/Linux
brew services start mongodb-community
# or
sudo systemctl start mongod
```

---

### Issue 3: "Database name is different"

**Cause:** `.env` file has wrong database name

**Solution:**
1. Check `.env` files
2. Ensure both have: `MONGODB_URI=mongodb://localhost:27017/education_portal`
3. Restart backend

---

### Issue 4: "Initialization not running"

**Cause:** `NODE_ENV` might be set to `production`

**Solution:**
1. Check `.env` file: `NODE_ENV=development` (or remove it)
2. Or run: `NODE_ENV=development npm start`

---

### Issue 5: "Database appears but is empty"

**This is normal!** The database is created but has no collections yet.

**Collections will appear when you:**
- Create a user → `users` collection appears
- Create a class → `classes` collection appears
- Create an assignment → `assignments` collection appears

---

## ✅ Verification Checklist

- [ ] MongoDB is running (`mongod` process exists)
- [ ] Connection string is correct in `.env` files
- [ ] Backend starts without connection errors
- [ ] Logs show: `📊 Database: education_portal`
- [ ] Database creation script runs successfully
- [ ] MongoDB Compass is refreshed
- [ ] Database appears in Compass database list

---

## 🎯 Quick Test

**Test if database exists:**
```bash
# Run this from project root
node create_database.js
```

**If successful:**
- Database is created ✅
- Refresh Compass to see it ✅

**If fails:**
- Check MongoDB is running
- Check connection string
- See error messages above

---

## 📞 Still Not Working?

1. **Check MongoDB logs:**
   - Windows: `C:\Program Files\MongoDB\Server\*\log\mongod.log`
   - Mac/Linux: `/var/log/mongodb/mongod.log`

2. **Test connection:**
   ```bash
   mongosh mongodb://localhost:27017
   ```

3. **Check backend logs:**
   - Look for connection errors
   - Check database name in logs

4. **Verify .env files exist:**
   - `student_dash_ba/project/backend/.env`
   - `teacher_dash_ba/project/backend/.env`

---

**Status**: Ready to troubleshoot
**Next**: Run `node create_database.js` to force-create database

