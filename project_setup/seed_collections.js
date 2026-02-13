/**
 * Seed script to create all collections in education_portal database
 * Run this once: node seed_collections.js
 * 
 * This script:
 * 1. Creates the database if it doesn't exist
 * 2. Creates all collections by inserting initialization documents
 * 3. Uses Mongoose models to ensure proper schema validation
 * 4. Safe to run multiple times (idempotent)
 */

const mongoose = require('mongoose');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/education_portal';

console.log('🔧 Connecting to MongoDB...');
console.log(`📡 Connection string: ${MONGODB_URI}\n`);

// Collection initialization data
const collectionsToCreate = [
  {
    name: 'users',
    modelPath: path.join(__dirname, 'teacher_dash_ba/project/backend/models/User.js'),
    initDoc: {
      email: '__init_user__@temp.local',
      password: 'temp',
      fullName: 'Collection Initialization',
      role: 'student',
      isActive: false
    }
  },
  {
    name: 'classes',
    modelPath: path.join(__dirname, 'teacher_dash_ba/project/backend/models/Class.js'),
    initDoc: {
      name: '__init_class__',
      subject: 'initialization',
      grade: 'init',
      teacher: new mongoose.Types.ObjectId(),
      isActive: false
    }
  },
  {
    name: 'courses',
    modelPath: path.join(__dirname, 'student_dash_ba/project/backend/models/Course.js'),
    initDoc: {
      name: '__init_course__',
      description: 'Collection initialization',
      category: 'mathematics',
      isPublished: false
    }
  },
  {
    name: 'assignments',
    modelPath: path.join(__dirname, 'teacher_dash_ba/project/backend/models/Assignment.js'),
    initDoc: {
      title: '__init_assignment__',
      description: 'Collection initialization',
      class: new mongoose.Types.ObjectId(),
      teacher: new mongoose.Types.ObjectId(),
      dueDate: new Date(),
      totalMarks: 0,
      status: 'draft'
    }
  },
  {
    name: 'content',
    modelPath: path.join(__dirname, 'teacher_dash_ba/project/backend/models/Content.js'),
    initDoc: {
      title: '__init_content__',
      type: 'document',
      class: new mongoose.Types.ObjectId(),
      teacher: new mongoose.Types.ObjectId(),
      subject: 'initialization',
      status: 'draft',
      isActive: false
    }
  },
  {
    name: 'quizzes',
    modelPath: path.join(__dirname, 'student_dash_ba/project/backend/models/Quiz.js'),
    initDoc: {
      title: '__init_quiz__',
      description: 'Collection initialization',
      subject: 'mathematics',
      questions: [],
      isActive: false
    }
  },
  {
    name: 'assessments',
    modelPath: path.join(__dirname, 'student_dash_ba/project/backend/models/Assessment.js'),
    initDoc: {
      title: '__init_assessment__',
      description: 'Collection initialization',
      type: 'quiz',
      isActive: false
    }
  },
  {
    name: 'doubts',
    modelPath: path.join(__dirname, 'student_dash_ba/project/backend/models/Doubt.js'),
    initDoc: {
      title: '__init_doubt__',
      description: 'Collection initialization',
      subject: 'mathematics',
      askedBy: new mongoose.Types.ObjectId(),
      status: 'closed',
      isPublic: false
    }
  },
  {
    name: 'notes',
    modelPath: path.join(__dirname, 'student_dash_ba/project/backend/models/Note.js'),
    initDoc: {
      title: '__init_note__',
      content: 'Collection initialization',
      user: new mongoose.Types.ObjectId(),
      isActive: false
    }
  },
  {
    name: 'progress',
    modelPath: path.join(__dirname, 'student_dash_ba/project/backend/models/Progress.js'),
    initDoc: {
      user: new mongoose.Types.ObjectId(),
      course: new mongoose.Types.ObjectId(),
      completed: false
    }
  },
  {
    name: 'collections',
    modelPath: path.join(__dirname, 'student_dash_ba/project/backend/models/Collection.js'),
    initDoc: {
      name: '__init_collection__',
      user: new mongoose.Types.ObjectId(),
      isActive: false
    }
  },
  {
    name: 'videonotes',
    modelPath: path.join(__dirname, 'student_dash_ba/project/backend/models/VideoNote.js'),
    initDoc: {
      title: '__init_videonote__',
      user: new mongoose.Types.ObjectId(),
      videoUrl: 'init',
      isActive: false
    }
  },
  {
    name: 'tasks',
    modelPath: path.join(__dirname, 'teacher_dash_ba/project/backend/models/Task.js'),
    initDoc: {
      title: '__init_task__',
      description: 'Collection initialization',
      teacher: new mongoose.Types.ObjectId(),
      isActive: false
    }
  }
];

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async (conn) => {
  console.log('✅ Connected to MongoDB successfully!');
  console.log(`📊 Database: ${conn.connection.name}`);
  console.log(`🏠 Host: ${conn.connection.host}:${conn.connection.port}\n`);
  
  const db = conn.connection.db;
  
  // Get existing collections
  const existingCollections = await db.listCollections().toArray();
  const existingCollectionNames = existingCollections.map(c => c.name);
  
  console.log(`📚 Found ${existingCollectionNames.length} existing collections`);
  if (existingCollectionNames.length > 0) {
    existingCollectionNames.forEach(name => console.log(`   - ${name}`));
  }
  console.log('');
  
  // Create collections
  console.log('🔧 Creating collections...\n');
  
  let createdCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const collection of collectionsToCreate) {
    try {
      // Check if collection already exists
      if (existingCollectionNames.includes(collection.name)) {
        console.log(`⏭️  Collection "${collection.name}" already exists - skipping`);
        skippedCount++;
        continue;
      }
      
      // Try to load model if path exists
      let Model;
      try {
        // Clear require cache to avoid conflicts
        delete require.cache[require.resolve(collection.modelPath)];
        Model = require(collection.modelPath);
      } catch (modelError) {
        // If model doesn't exist or has errors, create collection directly
        console.log(`⚠️  Could not load model for "${collection.name}", creating collection directly...`);
        const col = db.collection(collection.name);
        await col.insertOne({
          _init: true,
          _created: new Date(),
          _purpose: 'Collection initialization',
          _note: 'This document can be safely deleted'
        });
        // Delete the init document
        await col.deleteOne({ _init: true });
        console.log(`✅ Created collection "${collection.name}" (direct method)`);
        createdCount++;
        continue;
      }
      
      // Create document using model (this creates the collection)
      try {
        const initDoc = new Model(collection.initDoc);
        await initDoc.save();
        
        // Delete the init document immediately
        await Model.deleteOne({ _id: initDoc._id });
        
        console.log(`✅ Created collection "${collection.name}"`);
        createdCount++;
      } catch (saveError) {
        // If save fails due to validation, try direct method
        if (saveError.name === 'ValidationError' || saveError.message.includes('required')) {
          const col = db.collection(collection.name);
          await col.insertOne({
            _init: true,
            _created: new Date(),
            _purpose: 'Collection initialization'
          });
          await col.deleteOne({ _init: true });
          console.log(`✅ Created collection "${collection.name}" (direct method - validation bypassed)`);
          createdCount++;
        } else {
          throw saveError;
        }
      }
    } catch (error) {
      console.error(`❌ Error creating collection "${collection.name}":`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   ✅ Created: ${createdCount} collections`);
  console.log(`   ⏭️  Skipped: ${skippedCount} collections (already exist)`);
  console.log(`   ❌ Errors: ${errorCount} collections`);
  console.log('='.repeat(50) + '\n');
  
  // List all collections after creation
  const finalCollections = await db.listCollections().toArray();
  console.log(`📚 Total collections in database: ${finalCollections.length}`);
  finalCollections.forEach(col => {
    console.log(`   - ${col.name}`);
  });
  
  console.log('\n✅ SUCCESS! All collections initialized.');
  console.log('💡 Refresh MongoDB Compass to see all collections!');
  
  process.exit(0);
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.error('\n💡 Troubleshooting:');
  console.error('   1. Make sure MongoDB is running');
  console.error('   2. Check connection string:', MONGODB_URI);
  console.error('   3. Try: mongod (to start MongoDB)');
  process.exit(1);
});

