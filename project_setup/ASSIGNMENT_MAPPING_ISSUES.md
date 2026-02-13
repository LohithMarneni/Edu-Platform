# Assignment Mapping Issues - Teacher ↔ Student Backend

## 🔍 Problem Analysis

When Sarah (teacher) creates an assignment, Alice (student) cannot see it because of **mapping issues** between the two systems.

## 📋 Current Mapping Flow

### 1. Teacher Backend Creates Assignment
```
Teacher Dashboard → POST /api/assignments
  ↓
Assignment Model (Teacher DB)
  - status: 'draft' (default) ❌
  - class: Class ID
  - teacher: Sarah's User ID
```

### 2. Student Backend Fetches Assignments
```
Student Dashboard → GET /api/assessments
  ↓
Student Backend Controller
  ↓
Fetches from Teacher Backend: GET /api/assignments/student/:studentEmail
  ↓
Teacher Backend looks up:
  1. Student by email (Student model)
  2. Classes where student._id is in class.students array
  3. Active assignments (status: 'active') for those classes
```

## ❌ Issues Found

### Issue 1: Email Mismatch
**Problem**: Alice's email in Teacher Backend ≠ Alice's email in Student Backend

- **Teacher Backend** (Student model): `alice.j@student.edu` (from seed_data.js line 145)
- **Student Backend** (User model): Unknown - need to verify
- **Impact**: When student backend calls `/api/assignments/student/${aliceEmail}`, teacher backend can't find the student

**Solution**: 
- Ensure emails match exactly (case-insensitive)
- Or update teacher backend to use the student backend email

### Issue 2: Assignment Status Not Active
**Problem**: Assignments created with status 'draft' are not visible to students

- **Teacher Backend**: Assignments default to `status: 'draft'`
- **Student Backend**: Only fetches `status: 'active'` assignments
- **Impact**: Even if everything else works, students won't see draft assignments

**Solution**: 
- Publish assignment after creation (set status to 'active')
- Or auto-publish when assignment is created

### Issue 3: Class Enrollment Mismatch
**Problem**: Student must be in `Class.students[]` array, not just `Student.classes[]`

- **Teacher Backend**: 
  - `Student.classes[]` - array of class references (Student model)
  - `Class.students[]` - array of student IDs (Class model)
- **Impact**: If Alice is in `Student.classes[]` but NOT in `Class.students[]`, she won't see assignments

**Solution**: 
- Ensure bidirectional enrollment: both arrays must be synced
- When student joins class, update both:
  - Add class to `Student.classes[]`
  - Add student to `Class.students[]`

### Issue 4: Subject Field Mapping
**Problem**: Subject comes from `Class.subject`, not `Assignment.subject`

- **Teacher Backend**: Assignment doesn't have `subject` field directly
- **Student Backend**: Expects `subject` field in assessment
- **Current Mapping**: `assignment.class?.subject || 'General'` (line 546 in getStudentAssignments)
- **Impact**: If subject is "Mathematics" in Class but frontend expects "Math", won't match

**Solution**: 
- Ensure subject names are consistent
- Or normalize subject names during mapping

## ✅ Verification Checklist

Run `check_assignment_mapping.js` to verify:

1. ✅ **Email Match**: 
   - Alice's email in Teacher Backend = Alice's email in Student Backend

2. ✅ **Student Enrollment**:
   - Alice exists in Teacher Backend `Student` model
   - Alice is in `Class.students[]` array for Sarah's Math class

3. ✅ **Assignment Status**:
   - Assignment status is 'active' (not 'draft')

4. ✅ **Class Assignment**:
   - Assignment is assigned to Sarah's Math class
   - Class is active (`isActive: true`)

5. ✅ **API Connectivity**:
   - Teacher backend running on port 5001
   - Student backend can reach teacher backend
   - `TEACHER_API_URL` env var set correctly

## 🔧 Fixes Needed

### Fix 1: Ensure Email Match
```javascript
// In teacher backend seed_data.js or when creating student
// Make sure email matches student backend user email exactly
{
  name: 'Alice Johnson',
  email: 'alice.johnson@student.edu', // Must match student backend
  // ...
}
```

### Fix 2: Auto-Publish or Require Publishing
```javascript
// Option A: Auto-publish on creation
exports.createAssignment = async (req, res, next) => {
  // ...
  req.body.status = 'active'; // Auto-publish
  const assignment = await Assignment.create(req.body);
  // ...
};

// Option B: Frontend must call publish after creation
// Current: handlePublish() in ClassAssignments.jsx
```

### Fix 3: Sync Class Enrollment
```javascript
// When student joins class, update both:
// 1. Student.classes[]
student.classes.push({ class: classId, joinedAt: new Date(), status: 'active' });
await student.save();

// 2. Class.students[]
class.students.push(student._id);
class.studentCount = class.students.length;
await class.save();
```

### Fix 4: Test API Endpoint
```bash
# Test if teacher backend returns assignments for Alice
curl "http://localhost:5001/api/assignments/student/alice.johnson@student.edu"
# Should return: { success: true, count: X, data: { "Mathematics": [...] } }
```

## 📊 Data Flow Diagram

```
┌─────────────────┐
│  Sarah (Teacher) │
│  Creates        │
│  Assignment     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Teacher Backend │
│ Assignment DB  │
│ status: 'draft' │
└────────┬────────┘
         │
         │ (Publish: status → 'active')
         ▼
┌─────────────────┐
│ Teacher Backend │
│ GET /api/       │
│ assignments/    │
│ student/:email  │
└────────┬────────┘
         │
         │ 1. Find Student by email
         │ 2. Find Classes where student in class.students[]
         │ 3. Find Active assignments for those classes
         │
         ▼
┌─────────────────┐
│ Student Backend │
│ GET /api/       │
│ assessments     │
└────────┬────────┘
         │
         │ (Fetches from teacher backend)
         │
         ▼
┌─────────────────┐
│ Student         │
│ Dashboard       │
│ Shows           │
│ Assignments     │
└─────────────────┘
```

## 🚨 Common Failure Points

1. **Email doesn't match** → Teacher backend can't find student
2. **Assignment is draft** → Filtered out (only active shown)
3. **Student not in class.students[]** → No classes found for student
4. **Class is inactive** → Filtered out (only active classes shown)
5. **Subject name mismatch** → Assignment appears under wrong subject

## 📝 Next Steps

1. Run `node check_assignment_mapping.js` to identify specific issues
2. Fix email mismatch if found
3. Ensure Alice is in Class.students[] array
4. Publish assignment (set status to 'active')
5. Verify API endpoint returns data correctly
6. Test end-to-end: Create → Publish → View in Student Dashboard

