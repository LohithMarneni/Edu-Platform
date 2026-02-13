const mongoose = require('mongoose');
const Note = require('./models/Note');
const Doubt = require('./models/Doubt');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  addSampleNotes();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

async function addSampleNotes() {
  try {
    // Find a student user
    const student = await User.findOne({ role: 'student' });
    
    if (!student) {
      console.log('❌ No student user found. Please create a student user first.');
      process.exit(1);
    }

    console.log('👤 Found student:', student.fullName);

    // Get some doubts to create notes for
    const doubts = await Doubt.find({ askedBy: student._id }).limit(3);
    
    if (doubts.length === 0) {
      console.log('❌ No doubts found. Please create some doubts first.');
      process.exit(1);
    }

    console.log('📚 Found doubts:', doubts.length);

    // Sample notes data
    const sampleNotes = [
      {
        title: `Notes for: ${doubts[0].title}`,
        content: `# Key Concepts

## Main Points
- This is about **${doubts[0].subject}** and specifically **${doubts[0].topic || 'general concepts'}**
- The difficulty level is **${doubts[0].difficulty}**

## My Understanding
I learned that this concept involves several important principles:

1. **First principle**: This is crucial for understanding the topic
2. **Second principle**: This builds on the first principle
3. **Third principle**: This ties everything together

## Practice Problems
- I should practice more problems of this type
- Focus on the application of these concepts
- Review the examples given in the answers

## Questions to Follow Up
- How does this relate to other topics in ${doubts[0].subject}?
- What are the real-world applications?

## Resources
- Textbook chapter 5
- Online tutorial videos
- Practice worksheets`,
        doubtId: doubts[0]._id,
        doubtTitle: doubts[0].title,
        doubtDescription: doubts[0].description,
        subject: doubts[0].subject,
        topic: doubts[0].topic,
        createdBy: student._id,
        tags: [doubts[0].subject, doubts[0].topic].filter(Boolean)
      },
      {
        title: `Study Notes: ${doubts[1]?.title || 'Mathematics Problem'}`,
        content: `# Problem Analysis

## What I Understood
This problem is about **${doubts[1]?.subject || 'mathematics'}** and requires understanding of:

- Basic concepts
- Problem-solving approach
- Step-by-step solution

## Solution Steps
1. **Identify the given information**
2. **Determine what needs to be found**
3. **Apply the appropriate formula/method**
4. **Solve step by step**
5. **Verify the answer**

## Common Mistakes to Avoid
- Not reading the problem carefully
- Skipping steps in the solution
- Not checking the final answer

## Additional Practice
I should work on similar problems to strengthen my understanding.`,
        doubtId: doubts[1]?._id || doubts[0]._id,
        doubtTitle: doubts[1]?.title || doubts[0].title,
        doubtDescription: doubts[1]?.description || doubts[0].description,
        subject: doubts[1]?.subject || doubts[0].subject,
        topic: doubts[1]?.topic || doubts[0].topic,
        createdBy: student._id,
        tags: [doubts[1]?.subject || doubts[0].subject, doubts[1]?.topic || doubts[0].topic].filter(Boolean)
      }
    ];

    // Clear existing notes
    await Note.deleteMany({});
    console.log('🗑️ Cleared existing notes');

    // Insert sample notes
    const createdNotes = await Note.insertMany(sampleNotes);
    console.log(`✅ Created ${createdNotes.length} sample notes`);

    // Display created notes
    console.log('\n📝 Sample notes created:');
    createdNotes.forEach((note, index) => {
      console.log(`${index + 1}. ${note.title} (${note.subject})`);
    });

    console.log('\n🎉 Sample notes added successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error adding sample notes:', error);
    process.exit(1);
  }
}
