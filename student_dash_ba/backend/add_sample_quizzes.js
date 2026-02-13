const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { Quiz } = require('./models/Quiz');
const Course = require('./models/Course');

async function addSampleQuizzes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get a course to associate quizzes with
    const course = await Course.findOne();
    if (!course) {
      console.log('❌ No courses found. Please create courses first.');
      return;
    }

    console.log(`📚 Using course: ${course.name}`);

    // Sample quiz data
    const sampleQuizzes = [
      {
        title: 'Physics Fundamentals Quiz',
        description: 'Test your understanding of basic physics concepts',
        subject: 'Physics',
        topic: 'Fundamentals',
        difficulty: 'medium',
        course: course._id,
        questions: [
          {
            question: "What is Newton's First Law of Motion?",
            options: [
              { text: "An object at rest stays at rest", isCorrect: true },
              { text: "Force equals mass times acceleration", isCorrect: false }, 
              { text: "For every action there is an equal and opposite reaction", isCorrect: false },
              { text: "Energy cannot be created or destroyed", isCorrect: false }
            ],
            correctAnswer: "An object at rest stays at rest",
            explanation: "Newton's First Law states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force."
          },
          {
            question: "What is the formula for kinetic energy?",
            options: [
              { text: "KE = mgh", isCorrect: false },
              { text: "KE = ½mv²", isCorrect: true },
              { text: "KE = mc²", isCorrect: false },
              { text: "KE = Fd", isCorrect: false }
            ],
            correctAnswer: "KE = ½mv²",
            explanation: "Kinetic energy is calculated as KE = ½mv², where m is mass and v is velocity."
          }
        ],
        passingScore: 60,
        duration: 30, // minutes
        isPublished: true,
        createdBy: course.instructor || course._id, // Use course instructor or course ID as fallback
        tags: ['physics', 'fundamentals']
      },
      {
        title: 'Mathematics Algebra Quiz',
        description: 'Test your algebra skills with these challenging problems',
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'medium',
        course: course._id,
        questions: [
          {
            question: "What is the solution to 2x + 5 = 13?",
            options: [
              { text: "x = 4", isCorrect: true },
              { text: "x = 3", isCorrect: false },
              { text: "x = 5", isCorrect: false },
              { text: "x = 6", isCorrect: false }
            ],
            correctAnswer: "x = 4",
            explanation: "Solving: 2x + 5 = 13, so 2x = 8, therefore x = 4."
          }
        ],
        passingScore: 70,
        duration: 20,
        isPublished: true,
        createdBy: course.instructor || course._id,
        tags: ['mathematics', 'algebra']
      }
    ];

    // Create quizzes
    for (const quizData of sampleQuizzes) {
      const quiz = new Quiz(quizData);
      await quiz.save();
      console.log(`✅ Created quiz: ${quiz.title}`);
    }

    console.log(`\n🎉 Successfully created ${sampleQuizzes.length} sample quizzes!`);
    console.log('📊 Quiz data includes:');
    console.log('- Physics Fundamentals Quiz (3 questions)');
    console.log('- Mathematics Algebra Quiz (2 questions)');
    console.log('- All quizzes are active and ready to use');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error adding sample quizzes:', error);
    process.exit(1);
  }
}

addSampleQuizzes();
