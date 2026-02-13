# Collections Setup Guide - education_portal

## 🎯 Overview

This guide explains how to create all collections in the `education_portal` database based on your project models.

---

## 📚 Collections in education_portal

Based on your project structure, the following collections will be created:

### Core Collections
1. **users** - Unified user collection (students + teachers)
2. **classes** - Teacher-created classes
3. **courses** - Student-facing courses
4. **assignments** - Teacher assignments
5. **content** - Educational content (chapters, subtopics)

### Student Collections
6. **quizzes** - Student quizzes
7. **assessments** - Student assessments
8. **doubts** - Student doubts (unified)
9. **notes** - Student notes
10. **progress** - Learning progress tracking
11. **collections** - Personal collections
12. **videonotes** - Video annotations

### Teacher Collections
13. **tasks** - Teacher tasks

---

## 🚀 Quick Start

### Option 1: Use the Seed Script (Recommended)

Run the seed script to create all collections:

```bash
node seed_collections.js
```

**What it does:**
- ✅ Connects to `education_portal` database
- ✅ Creates all 13 collections
- ✅ Uses Mongoose models for proper schema validation
- ✅ Safe to run multiple times (skips existing collections)
- ✅ Shows summary of created/skipped collections

**Expected Output:**
```
✅ Connected to MongoDB successfully!
📊 Database: education_portal

🔧 Creating collections...

✅ Created collection "users"
✅ Created collection "classes"
✅ Created collection "courses"
...
⏭️  Collection "users" already exists - skipping

📊 Summary:
   ✅ Created: 12 collections
   ⏭️  Skipped: 1 collections (already exist)
   ❌ Errors: 0 collections

📚 Total collections in database: 13
   - users
   - classes
   - courses
   ...
```

---

## 🔍 Verify Collections in MongoDB Compass

### Step 1: Open MongoDB Compass

1. Launch **MongoDB Compass**
2. Connect to: `mongodb://localhost:27017`
3. Click on **`education_portal`** database

### Step 2: View Collections

You should see all 13 collections listed:

- ✅ users
- ✅ classes
- ✅ courses
- ✅ assignments
- ✅ content
- ✅ quizzes
- ✅ assessments
- ✅ doubts
- ✅ notes
- ✅ progress
- ✅ collections
- ✅ videonotes
- ✅ tasks

### Step 3: Check Collection Structure

Click on any collection to see:
- **Documents**: Empty (collections are created, ready for data)
- **Schema**: Will be defined when first real document is inserted
- **Indexes**: Will be created by Mongoose models

---

## 🧪 Manual Collection Creation (Alternative)

If you prefer to create collections manually or one at a time:

### Method 1: Via MongoDB Shell

```bash
mongosh
```

```javascript
// Use education_portal database
use education_portal

// Create collections by inserting documents
db.users.insertOne({ _init: true })
db.users.deleteOne({ _init: true })

db.classes.insertOne({ _init: true })
db.classes.deleteOne({ _init: true })

// ... repeat for all collections
```

### Method 2: Via Backend (Automatic)

Collections are automatically created when you:
- Register a user → `users` collection created
- Create a class → `classes` collection created
- Create an assignment → `assignments` collection created
- etc.

**Note**: This method creates collections on-demand as you use the application.

---

## 📋 Collection Details

### users
- **Model**: `User.js` (unified)
- **Purpose**: Stores all users (students, teachers, admins)
- **Key Fields**: email, password, role, fullName/name

### classes
- **Model**: `Class.js`
- **Purpose**: Teacher-created classes
- **Key Fields**: name, subject, grade, teacher, students

### courses
- **Model**: `Course.js`
- **Purpose**: Student-facing courses
- **Key Fields**: name, category, modules, instructor

### assignments
- **Model**: `Assignment.js`
- **Purpose**: Teacher assignments
- **Key Fields**: title, class, teacher, dueDate, submissions

### content
- **Model**: `Content.js`
- **Purpose**: Educational content (chapters, subtopics)
- **Key Fields**: title, type, class, teacher, chapter, subtopic

### quizzes
- **Model**: `Quiz.js`
- **Purpose**: Student quizzes
- **Key Fields**: title, questions, subject

### assessments
- **Model**: `Assessment.js`
- **Purpose**: Student assessments
- **Key Fields**: title, type, questions

### doubts
- **Model**: `Doubt.js` (unified)
- **Purpose**: Student doubts and teacher responses
- **Key Fields**: title, description, askedBy, answers

### notes
- **Model**: `Note.js`
- **Purpose**: Student personal notes
- **Key Fields**: title, content, user

### progress
- **Model**: `Progress.js`
- **Purpose**: Learning progress tracking
- **Key Fields**: user, course, completed, progress

### collections
- **Model**: `Collection.js`
- **Purpose**: Student personal collections
- **Key Fields**: name, user, items

### videonotes
- **Model**: `VideoNote.js`
- **Purpose**: Video annotations
- **Key Fields**: title, videoUrl, user, notes

### tasks
- **Model**: `Task.js`
- **Purpose**: Teacher tasks
- **Key Fields**: title, description, teacher, status

---

## ✅ Verification Checklist

After running the seed script:

- [ ] Script runs without errors
- [ ] All 13 collections are created
- [ ] Collections appear in MongoDB Compass
- [ ] Collections are empty (ready for data)
- [ ] Backend can connect and use collections

---

## 🔧 Troubleshooting

### Issue: "Collection already exists"

**This is normal!** The script skips existing collections. This means:
- ✅ Collection was already created
- ✅ No action needed
- ✅ Script is idempotent (safe to run multiple times)

### Issue: "Model not found" error

**Solution**: The script will use direct collection creation if model loading fails. This is safe and still creates the collection.

### Issue: "Validation error"

**Solution**: The script handles validation errors by using direct collection creation. The collection will still be created.

### Issue: Collections not showing in Compass

**Solution**:
1. Refresh MongoDB Compass (click refresh button)
2. Close and reopen Compass
3. Verify database name is `education_portal`
4. Check connection string

---

## 🎯 Next Steps

After collections are created:

1. **Start Backends**: Both student and teacher backends
2. **Register Users**: Create test users (students and teachers)
3. **Create Data**: Create classes, courses, assignments, etc.
4. **Verify**: Check that data appears in collections

---

## 📝 Notes

- **Empty Collections**: Collections are created empty (no documents)
- **Schema Validation**: Mongoose models will enforce schema when documents are inserted
- **Indexes**: Indexes are created automatically by Mongoose models
- **Safe to Run**: Script can be run multiple times without issues

---

**Status**: ✅ Ready to Use
**Script**: `seed_collections.js`
**Collections**: 13 total

