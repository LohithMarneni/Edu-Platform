/**
 * Simple script to force create education_portal database
 * Run this once: nodbase.js
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/education_portal';

console.log('🔧 Connecting to MongoDB...');
console.log(`📡 Connection string: ${MONGODB_URI}`);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async (conn) => {
  console.log('✅ Connected to MongoDB successfully!');
  console.log(`📊 Database name: ${conn.connection.name}`);
  console.log(`🏠 Host: ${conn.connection.host}`);
  console.log(`🔌 Port: ${conn.connection.port}`);
  
  // Force database creation by inserting a document
  console.log('\n🔧 Creating database "education_portal"...');
  
  try {
    // Get the database object
    const db = conn.connection.db;
    
    // Create a test collection and insert a document
    const testCollection = db.collection('_init');
    await testCollection.insertOne({
      _created: new Date(),
      _purpose: 'Database initialization',
      _note: 'This document can be safely deleted'
    });
    
    console.log('✅ Database "education_portal" created successfully!');
    console.log('📝 Inserted initialization document into "_init" collection');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📚 Collections in database: ${collections.length}`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Optionally delete the init document
    console.log('\n🧹 Cleaning up initialization document...');
    await testCollection.deleteOne({ _purpose: 'Database initialization' });
    console.log('✅ Cleanup complete');
    
    console.log('\n✅ SUCCESS! Database "education_portal" is now created.');
    console.log('💡 Refresh MongoDB Compass to see it!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    process.exit(1);
  }
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.error('\n💡 Troubleshooting:');
  console.error('   1. Make sure MongoDB is running');
  console.error('   2. Check connection string:', MONGODB_URI);
  console.error('   3. Try: mongod (to start MongoDB)');
  process.exit(1);
});

