# Unified Database Architecture - Education Portal

## Executive Summary

This document outlines the architectural design for migrating from **two separate MongoDB databases** (`student_dashboard` and `teacher_dashboard`) to **one unified database** (`education_portal`) while maintaining separate frontend applications and minimal code changes.

---

## 🎯 Goals & Constraints

### Goals
- ✅ Single unified MongoDB database: `education_portal`
- ✅ Maintain separate Student UI (port 5173) and Teacher UI (port 3000)
- ✅ Maintain separate backend servers (ports 5000 and 5001)
- ✅ Minimal code changes
- ✅ No feature removal
- ✅ Role-based access control (student/teacher/admin)
- ✅ Production-ready, scalable architecture

### Constraints
- Use MongoDB + Mongoose
- Keep frontends separate (no merging)
- Preserve all existing functionality
- Maintain backward compatibility during migration

---

## 📐 Current Architecture (Before Migration)

```
┌─────────────────────────────────────────────────────────────┐
│                    CURRENT STATE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Student Dashboard                    Teacher Dashboard      │
│  ┌──────────────┐                  ┌──────────────┐        │
│  │  Frontend    │                  │  Frontend    │        │
│  │  (Port 5173) │                  │  (Port 3000) │        │
│  └──────┬───────┘                  └──────┬───────┘        │
│         │                                  │                 │
│  ┌──────▼───────┐                  ┌──────▼───────┐        │
│  │  Backend     │                  │  Backend     │        │
│  │  (Port 5000) │                  │  (Port 5001) │        │
│  └──────┬───────┘                  └──────┬───────┘        │
│         │                                  │                 │
│  ┌──────▼──────────┐            ┌────────▼──────────┐    │
│  │ student_dashboard│            │ teacher_dashboard  │    │
│  │   (Database)     │            │    (Database)     │    │
│  └──────────────────┘            └────────────────────┘    │
│                                                              │
│  ⚠️ ISSUES:                                                  │
│  • Data sync problems                                        │
│  • Duplicate User models                                     │
│  • Cross-database queries (slow, complex)                    │
│  • Separate Student model vs User model                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Target Architecture (After Migration)

```
┌─────────────────────────────────────────────────────────────┐
│                  UNIFIED ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Student Dashboard                    Teacher Dashboard      │
│  ┌──────────────┐                  ┌──────────────┐        │
│  │  Frontend    │                  │  Frontend    │        │
│  │  (Port 5173) │                  │  (Port 3000) │        │
│  └──────┬───────┘                  └──────┬───────┘        │
│         │                                  │                 │
│  ┌──────▼───────┐                  ┌──────▼───────┐        │
│  │  Backend     │                  │  Backend     │        │
│  │  (Port 5000) │                  │  (Port 5001) │        │
│  └──────┬───────┘                  └──────┬───────┘        │
│         │                                  │                 │
│         └──────────────┬───────────────────┘                 │
│                        │                                     │
│              ┌─────────▼──────────┐                         │
│              │  education_portal  │                         │
│              │    (Database)      │                         │
│              └────────────────────┘                         │
│                                                              │
│  ✅ BENEFITS:                                                │
│  • Single source of truth                                   │
│  • Real-time data consistency                                │
│  • Simplified queries (no cross-DB)                         │
│  • Unified User model                                        │
│  • Better performance                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema Design

### Core Principle
**One database, role-based access control, shared collections where appropriate, role-specific collections where needed.**

### Collection Structure

```
education_portal/
├── users                    # Unified User collection (students + teachers)
├── classes                  # Teacher-created classes
├── courses                  # Student-facing courses (synced from Content)
├── content                  # Teacher-created educational content
├── assignments              # Teacher assignments
├── quizzes                  # Student quizzes
├── assessments             # Student assessments
├── doubts                  # Unified doubts (from both sides)
├── notes                   # Student notes
├── progress                # Student learning progress
├── collections             # Student personal collections
├── videoNotes              # Student video annotations
└── tasks                   # Teacher tasks
```

---

## 🔑 Key Design Decisions

### 1. Unified User Model

**Problem**: Currently two separate User models with different schemas.

**Solution**: Merge into one User model with role-based fields.

```javascript
User Schema:
{
  // Common fields
  email, password, name, role (student/teacher/admin)
  
  // Role-specific fields (conditionally populated)
  profile: {
    // Student fields: grade, school, bio, phone, dateOfBirth
    // Teacher fields: subject, firstName, lastName, phone, bio
  }
  
  // Student-specific stats (only for role='student')
  stats: { totalPoints, currentStreak, ... }
  
  // Teacher-specific fields (only for role='teacher')
  // (if any unique teacher fields needed)
}
```

**Migration Strategy**:
- Merge both User collections
- Ensure unique emails across roles
- Preserve all existing data
- Update references in all related collections

---

### 2. Student Model Consolidation

**Problem**: Teacher DB has separate `Student` model, Student DB uses `User` model.

**Solution**: Eliminate `Student` model. Use `User` with `role='student'` everywhere.

**Migration**:
- Convert all `Student` documents to `User` documents
- Update all references from `Student` to `User`
- Update `Class.students` array to reference `User._id`

---

### 3. Doubt Model Unification

**Problem**: Two different Doubt schemas in each database.

**Solution**: Create unified Doubt schema that accommodates both use cases.

```javascript
Doubt Schema (Unified):
{
  title, description/question, subject, topic
  askedBy: User._id (student)
  assignedTo: User._id (teacher, optional)
  class: Class._id (if from teacher context)
  course: Course._id (if from student context)
  answers/responses: [unified answer structure]
  status, priority, tags, attachments
  // Support both student and teacher doubt flows
}
```

---

### 4. Content & Course Relationship

**Problem**: Teacher creates `Content`, Student sees `Course` modules. Currently synced across databases.

**Solution**: Keep both collections, but in same database. Maintain sync logic, but now it's intra-database (faster).

- `Content` collection: Teacher-created chapters/subtopics
- `Course` collection: Student-facing course structure
- Sync happens within same database (much faster)

---

### 5. Class & Course Relationship

**Problem**: Teachers create `Class`, Students enroll in `Course`. Currently disconnected.

**Solution**: Link them via `classId` field (already exists in Course model).

- `Class`: Teacher-managed class with students
- `Course`: Student-facing course linked via `classId`
- When student joins class via code, create/update Course enrollment

---

## 🔐 Access Control Strategy

### Role-Based Middleware

Both backends will use the same User model but filter by role:

```javascript
// Student Backend Middleware
const protectStudent = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user.role !== 'student') {
    return res.status(403).json({ error: 'Student access only' });
  }
  req.user = user;
  next();
};

// Teacher Backend Middleware
const protectTeacher = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!['teacher', 'admin'].includes(user.role)) {
    return res.status(403).json({ error: 'Teacher access only' });
  }
  req.user = user;
  next();
};
```

### Collection-Level Access

- **Students** can read/write: Courses, Quizzes, Assessments, Notes, Progress, Collections, VideoNotes, Doubts (their own)
- **Teachers** can read/write: Classes, Content, Assignments, Doubts (all in their classes), Tasks
- **Both** can read: Shared content (based on visibility rules)

---

## 📝 Migration Strategy

### Phase 1: Preparation
1. Create unified User schema
2. Create migration scripts
3. Backup both databases
4. Test migration on staging

### Phase 2: Data Migration
1. Merge User collections (handle email conflicts)
2. Convert Student documents to User documents
3. Migrate all collections to `education_portal`
4. Update all ObjectId references
5. Verify data integrity

### Phase 3: Code Updates
1. Update both backend `server.js` to use `education_portal` database
2. Update User model imports
3. Remove Student model references
4. Update Doubt model to unified schema
5. Update all controllers to use unified models
6. Remove cross-database connection code

### Phase 4: Testing
1. Test student authentication & features
2. Test teacher authentication & features
3. Test class enrollment flow
4. Test content sync
5. Test doubt system
6. Performance testing

### Phase 5: Deployment
1. Deploy to production
2. Monitor for issues
3. Rollback plan ready

---

## 🔄 Data Flow Examples

### Example 1: Student Joins Class

```
1. Student enters class code (via Student Frontend)
2. Student Backend validates code with Class collection
3. Create/Update Course enrollment
4. Add User._id to Class.students array
5. Sync Content → Course modules (within same DB, fast!)
```

### Example 2: Teacher Creates Content

```
1. Teacher creates Content (via Teacher Frontend)
2. Teacher Backend saves to Content collection
3. Background job syncs Content → Course modules
4. Students see updated Course immediately
```

### Example 3: Student Asks Doubt

```
1. Student creates Doubt (via Student Frontend)
2. Student Backend saves to Doubt collection
3. Teacher sees Doubt in their dashboard
4. Teacher responds (saved to same Doubt document)
5. Student sees response immediately
```

---

## 📦 Model Consolidation Details

### Models to Keep (Unified)
- ✅ `User` - Unified (students + teachers)
- ✅ `Class` - Teacher side
- ✅ `Course` - Student side (linked to Class)
- ✅ `Content` - Teacher side
- ✅ `Assignment` - Teacher side
- ✅ `Quiz` - Student side
- ✅ `Assessment` - Student side
- ✅ `Doubt` - Unified (both sides)
- ✅ `Note` - Student side
- ✅ `Progress` - Student side
- ✅ `Collection` - Student side
- ✅ `VideoNote` - Student side
- ✅ `Task` - Teacher side

### Models to Remove
- ❌ `Student` (replaced by `User` with `role='student'`)

### Models to Merge
- 🔄 `Doubt` (student version + teacher version → unified version)

---

## 🔧 Technical Implementation Details

### Database Connection

**Before:**
```javascript
// Student Backend
mongoose.connect('mongodb://localhost:27017/student_dashboard')

// Teacher Backend  
mongoose.connect('mongodb://localhost:27017/teacher_dashboard')
```

**After:**
```javascript
// Both Backends
mongoose.connect('mongodb://localhost:27017/education_portal')
```

### Environment Variables

**Before:**
```env
# Student Backend .env
MONGODB_URI=mongodb://localhost:27017/student_dashboard

# Teacher Backend .env
MONGODB_URI=mongodb://localhost:27017/teacher_dashboard
```

**After:**
```env
# Student Backend .env
MONGODB_URI=mongodb://localhost:27017/education_portal

# Teacher Backend .env
MONGODB_URI=mongodb://localhost:27017/education_portal
```

### Model Imports

**Before:**
```javascript
// Student Backend
const User = require('./models/User'); // Student User model

// Teacher Backend
const User = require('./models/User'); // Teacher User model
const Student = require('./models/Student');
```

**After:**
```javascript
// Both Backends (shared models directory or same model)
const User = require('./models/User'); // Unified User model
// Student model removed
```

---

## 🚀 Benefits of Unified Architecture

### 1. Data Consistency
- ✅ Single source of truth
- ✅ No sync delays
- ✅ Real-time updates

### 2. Performance
- ✅ No cross-database queries
- ✅ Faster joins and aggregations
- ✅ Better indexing strategy

### 3. Simplicity
- ✅ One database to manage
- ✅ Simpler backup/restore
- ✅ Easier monitoring

### 4. Scalability
- ✅ Better query optimization
- ✅ Unified connection pooling
- ✅ Easier horizontal scaling

### 5. Development
- ✅ Easier debugging
- ✅ Simpler testing
- ✅ Better data relationships

---

## ⚠️ Potential Challenges & Solutions

### Challenge 1: Email Conflicts
**Problem**: Same email might exist in both databases with different roles.

**Solution**: 
- During migration, check for conflicts
- If conflict: merge accounts or create separate accounts with role suffix
- Prefer merging if same person

### Challenge 2: ObjectId References
**Problem**: References between collections use ObjectIds that might change.

**Solution**:
- Use stable identifiers (email, custom IDs) where possible
- Maintain mapping during migration
- Verify all references after migration

### Challenge 3: Model Schema Differences
**Problem**: Same model name but different schemas in each DB.

**Solution**:
- Create unified schema that accommodates both
- Use optional fields
- Migrate data to unified format

### Challenge 4: Code Duplication
**Problem**: Same models might be duplicated in both backends.

**Solution**:
- Option A: Keep models in each backend (simpler, more independent)
- Option B: Shared models directory (DRY, but coupling)
- **Recommendation**: Option A for now (easier migration, can refactor later)

---

## 📋 Migration Checklist

### Pre-Migration
- [ ] Backup `student_dashboard` database
- [ ] Backup `teacher_dashboard` database
- [ ] Document all current data counts
- [ ] Test migration script on staging
- [ ] Create rollback plan

### Migration
- [ ] Create `education_portal` database
- [ ] Merge User collections
- [ ] Convert Student → User documents
- [ ] Migrate all collections
- [ ] Update all ObjectId references
- [ ] Verify data integrity

### Post-Migration
- [ ] Update backend connection strings
- [ ] Update model schemas
- [ ] Remove cross-DB code
- [ ] Test all endpoints
- [ ] Monitor for errors
- [ ] Update documentation

---

## 🎓 Next Steps

1. **Review this architecture** - Ensure it meets requirements
2. **Create migration scripts** - Automated data migration
3. **Update models** - Unified schemas
4. **Update backends** - Connection strings and code
5. **Test thoroughly** - All features on both sides
6. **Deploy** - Production migration

---

## 📚 Additional Considerations

### Indexes
- Ensure all indexes are recreated in unified database
- Add composite indexes for common queries
- Monitor query performance

### Validation
- Update Mongoose validations for unified schemas
- Ensure role-based validations work correctly

### Security
- Maintain role-based access control
- Ensure students can't access teacher-only data
- Ensure teachers can't access other teachers' private data

### Performance
- Monitor database size
- Optimize slow queries
- Consider read replicas if needed

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Architecture Design - Ready for Implementation Review

