const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher_dashboard', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

async function testLogin() {
  try {
    console.log('\n🔍 Testing login credentials...\n');
    
    // Find the demo teacher
    const user = await User.findOne({ email: 'teacher@demo.com' }).select('+password');
    
    if (!user) {
      console.log('❌ User not found: teacher@demo.com');
      console.log('\n📋 Available users in database:');
      const allUsers = await User.find({});
      allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.name})`);
      });
      process.exit(1);
    }
    
    console.log('✅ User found:', user.name);
    console.log('📧 Email:', user.email);
    console.log('🔑 Role:', user.role);
    console.log('💾 Hashed password exists:', !!user.password);
    console.log('🔒 Password starts with $2b (bcrypt):', user.password.startsWith('$2b'));
    
    // Test password match
    console.log('\n🧪 Testing password match...');
    const isMatch = await user.matchPassword('demo123');
    console.log('✅ Password match result:', isMatch);
    
    if (isMatch) {
      console.log('\n✅ LOGIN SHOULD WORK!');
    } else {
      console.log('\n❌ PASSWORD MISMATCH!');
      console.log('   The password in database does not match "demo123"');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

connectDB().then(() => {
  testLogin();
});

