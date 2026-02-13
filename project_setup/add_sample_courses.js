const mongoose = require('mongoose');
const Course = require('./models/Course');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function addSampleCourses() {
  try {
    console.log('🚀 Adding sample courses...');

    // Find a teacher user to be the instructor
    const teacher = await User.findOne({ role: 'teacher' });
    if (!teacher) {
      console.log('❌ No teacher found. Please create a teacher account first.');
      return;
    }

    // Sample courses data
    const sampleCourses = [
      {
        name: 'Mathematics',
        description: 'Advanced Mathematics & Problem Solving',
        icon: '🧮',
        color: 'bg-blue-50',
        iconColor: 'text-blue-500',
        borderColor: 'border-blue-200',
        category: 'mathematics',
        level: 'intermediate',
        instructor: teacher._id,
        modules: [
          {
            name: 'Algebra',
            description: 'Fundamental concepts of algebra',
            topics: [
              {
                name: 'Linear Equations',
                description: 'Solving linear equations with one variable',
                duration: '45 mins',
                videoUrl: 'https://example.com/video1',
                difficulty: 'beginner',
                order: 1
              },
              {
                name: 'Quadratic Equations',
                description: 'Understanding quadratic equations',
                duration: '30 mins',
                videoUrl: 'https://example.com/video2',
                difficulty: 'intermediate',
                order: 2
              }
            ],
            order: 1
          },
          {
            name: 'Geometry',
            description: 'Basic geometric concepts',
            topics: [
              {
                name: 'Triangles',
                description: 'Properties and types of triangles',
                duration: '40 mins',
                videoUrl: 'https://example.com/video3',
                difficulty: 'beginner',
                order: 1
              },
              {
                name: 'Circles',
                description: 'Circle properties and theorems',
                duration: '35 mins',
                videoUrl: 'https://example.com/video4',
                difficulty: 'intermediate',
                order: 2
              }
            ],
            order: 2
          }
        ],
        learningOutcomes: [
          'Solve linear and quadratic equations',
          'Understand geometric properties',
          'Apply mathematical concepts to real-world problems'
        ],
        tags: ['algebra', 'geometry', 'problem-solving']
      },
      {
        name: 'Physics',
        description: 'Classical Mechanics & Modern Physics',
        icon: '⚛️',
        color: 'bg-purple-50',
        iconColor: 'text-purple-500',
        borderColor: 'border-purple-200',
        category: 'physics',
        level: 'intermediate',
        instructor: teacher._id,
        modules: [
          {
            name: 'Mechanics',
            description: 'Fundamental mechanics concepts',
            topics: [
              {
                name: 'Newton\'s Laws',
                description: 'Understanding the three laws of motion',
                duration: '50 mins',
                videoUrl: 'https://example.com/video5',
                difficulty: 'beginner',
                order: 1
              },
              {
                name: 'Gravity',
                description: 'Gravitational forces and acceleration',
                duration: '45 mins',
                videoUrl: 'https://example.com/video6',
                difficulty: 'intermediate',
                order: 2
              }
            ],
            order: 1
          }
        ],
        learningOutcomes: [
          'Understand Newton\'s laws of motion',
          'Apply concepts of gravity and force',
          'Solve physics problems using mathematical methods'
        ],
        tags: ['mechanics', 'motion', 'forces']
      },
      {
        name: 'Chemistry',
        description: 'Organic & Inorganic Chemistry',
        icon: '🧪',
        color: 'bg-green-50',
        iconColor: 'text-green-500',
        borderColor: 'border-green-200',
        category: 'chemistry',
        level: 'beginner',
        instructor: teacher._id,
        modules: [],
        learningOutcomes: [
          'Understand basic chemical concepts',
          'Learn about organic and inorganic compounds',
          'Perform basic chemical calculations'
        ],
        tags: ['organic', 'inorganic', 'compounds']
      },
      {
        name: 'Biology',
        description: 'Life Sciences & Human Anatomy',
        icon: '🧬',
        color: 'bg-red-50',
        iconColor: 'text-red-500',
        borderColor: 'border-red-200',
        category: 'biology',
        level: 'beginner',
        instructor: teacher._id,
        modules: [],
        learningOutcomes: [
          'Understand basic biological processes',
          'Learn about human anatomy',
          'Explore life sciences concepts'
        ],
        tags: ['anatomy', 'life-sciences', 'biology']
      },
      {
        name: 'English',
        description: 'Literature & Grammar',
        icon: '📚',
        color: 'bg-yellow-50',
        iconColor: 'text-yellow-500',
        borderColor: 'border-yellow-200',
        category: 'english',
        level: 'intermediate',
        instructor: teacher._id,
        modules: [],
        learningOutcomes: [
          'Improve grammar and writing skills',
          'Analyze literature',
          'Develop communication skills'
        ],
        tags: ['literature', 'grammar', 'writing']
      },
      {
        name: 'History',
        description: 'World History & Civilizations',
        icon: '🏛️',
        color: 'bg-orange-50',
        iconColor: 'text-orange-500',
        borderColor: 'border-orange-200',
        category: 'history',
        level: 'beginner',
        instructor: teacher._id,
        modules: [],
        learningOutcomes: [
          'Understand world history',
          'Learn about different civilizations',
          'Analyze historical events'
        ],
        tags: ['world-history', 'civilizations', 'historical-events']
      }
    ];

    // Clear existing courses
    await Course.deleteMany({});
    console.log('🗑️ Cleared existing courses');

    // Add sample courses
    const createdCourses = await Course.insertMany(sampleCourses);
    console.log(`✅ Added ${createdCourses.length} sample courses`);

    // Display created courses
    createdCourses.forEach(course => {
      console.log(`📚 ${course.name} - ${course.modules.length} modules, ${course.totalTopics} topics`);
    });

    console.log('🎉 Sample courses added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding sample courses:', error);
  } finally {
    mongoose.connection.close();
  }
}

addSampleCourses();
