# Minimal Safe Implementation Guide - Unified Database

## 🎯 Goal
Connect both backends to `education_portal` database and enable: **Teacher creates assignment → Student sees it**

---

## 📋 Step-by-Step Implementation Order

### **STEP 1: Create Unified User Model**
**File**: `teacher_dash_ba/project/backend/models/User.js` (update this one, copy to student backend)

**What**: Merge student and teacher User schemas into one unified schema

**Test After**: Model can be imported without errors

---

### **STEP 2: Update Student Backend Database Connection**
**File**: `student_dash_ba/project/backend/server.js`

**What**: Change MongoDB connection from `student_dashboard` to `education_portal`

**Test After**: Server starts and connects to database

---

### **STEP 3: Update Teacher Backend Database Connection**
**File**: `teacher_dash_ba/project/backend/server.js`

**What**: Change MongoDB connection from `teacher_dashboard` to `education_portal`

**Test After**: Server starts and connects to database

---

### **STEP 4: Update Environment Files**
**Files**: 
- `student_dash_ba/project/backend/.env`
- `teacher_dash_ba/project/backend/.env`

**What**: Update `MONGODB_URI` to point to `education_portal`

**Test After**: Both servers use correct database from env

---

### **STEP 5: Copy Unified User Model to Student Backend**
**File**: `student_dash_ba/project/backend/models/User.js`

**What**: Replace with unified User model

**Test After**: Student backend can import User model

---

### **STEP 6: Update Assignment Model**
**File**: `teacher_dash_ba/project/backend/models/Assignment.js`

**What**: Change `submissions.student` reference from `Student` to `User`

**Test After**: Assignment model loads without errors

---

### **STEP 7: Update Assignment Controller**
**File**: `teacher_dash_ba/project/backend/controllers/assignments.js`

**What**: Replace `Student` model references with `User` model

**Test After**: Controller can find/create users for submissions

---

### **STEP 8: Test Authentication**
**What**: Test student login and teacher login

**Test**: Both should authenticate successfully

---

### **STEP 9: Test Complete Flow**
**What**: 
1. Teacher creates assignment
2. Student fetches assignments

**Test**: Student can see teacher's assignment

---

## ⚠️ Safety Notes

- **Backup**: Both databases before starting
- **Test Each Step**: Don't proceed until current step works
- **Rollback Plan**: Keep old code commented or in git
- **No Data Migration Yet**: We're just connecting to new database (empty initially)

---

## 🧪 Testing Commands

After each step, test with:

```bash
# Test Student Backend
cd student_dash_ba/project/backend
npm start
# Should connect to education_portal

# Test Teacher Backend  
cd teacher_dash_ba/project/backend
npm start
# Should connect to education_portal
```

---

## 📝 Notes

- We're NOT migrating old data yet
- We're creating a fresh `education_portal` database
- Both backends will share the same database
- Authentication will work for both roles
- Assignment flow will work end-to-end

