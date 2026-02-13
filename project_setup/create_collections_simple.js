/**
 * Simple script to create all collections in education_portal database
 * Run this: node create_collections_simple.js
 * 
 * This creates collections directly without model validation
 * Safe, fast, and reliable
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/education_portal';

// All collections based on your project models
const collections = [
  'users',           // Unified User model
  'classes',         // Class model
  'courses',         // Course model
  'assignments',     // Assignment model
  'content',         // Content model
  'quizzes',         // Quiz model
  'assessments',     // Assessment model
  'doubts',          // Doubt model (unified)
  'notes',           // Note model
  'progress',        // Progress model
  'collections',     // Collection model
  'videonotes',      // VideoNote model
  'tasks'            // Task model
];

console.log('🔧 Connecting to MongoDB...');
console.log(`📡 Connection string: ${MONGODB_URI}\n`);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async (conn) => {
  console.log('✅ Connected to MongoDB successfully!');
  console.log(`📊 Database: ${conn.connection.name}\n`);
  
  const db = conn.connection.db;
  
  // Get existing collections
  const existingCollections = await db.listCollections().toArray();
  const existingNames = existingCollections.map(c => c.name);
  
  console.log(`📚 Found ${existingNames.length} existing collections`);
  if (existingNames.length > 0) {
    existingNames.forEach(name => console.log(`   - ${name}`));
  }
  console.log('');
  
  // Create collections
  console.log('🔧 Creating collections...\n');
  
  let created = 0;
  let skipped = 0;
  
  for (const collectionName of collections) {
    try {
      // Check if collection exists
      if (existingNames.includes(collectionName)) {
        console.log(`⏭️  "${collectionName}" - already exists`);
        skipped++;
        continue;
      }
      
      // Create collection by inserting and deleting a document
      const collection = db.collection(collectionName);
      await collection.insertOne({
        _init: true,
        _created: new Date(),
        _purpose: 'Collection initialization',
        _note: 'This document is automatically deleted'
      });
      
      // Delete the init document (collection is now created)
      await collection.deleteOne({ _init: true });
      
      console.log(`✅ Created collection: "${collectionName}"`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating "${collectionName}":`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   ✅ Created: ${created} collections`);
  console.log(`   ⏭️  Skipped: ${skipped} collections (already exist)`);
  console.log(`   📚 Total: ${collections.length} collections`);
  console.log('='.repeat(50) + '\n');
  
  // List all collections
  const finalCollections = await db.listCollections().toArray();
  console.log(`📚 All collections in "education_portal" database:`);
  finalCollections.forEach(col => {
    console.log(`   ✓ ${col.name}`);
  });
  
  console.log('\n✅ SUCCESS! All collections are ready.');
  console.log('💡 Refresh MongoDB Compass to see them!');
  console.log('💡 Collections are empty and ready for your data.\n');
  
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

