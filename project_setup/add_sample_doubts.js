const mongoose = require('mongoose');
const Doubt = require('../student_dash_ba/project/backend/models/Doubt');
const User = require('../student_dash_ba/project/backend/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  addSampleDoubts();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

async function addSampleDoubts() {
  try {
    // Find a student user
    const student = await User.findOne({ role: 'student' });
    
    if (!student) {
      console.log('❌ No student user found. Please create a student user first.');
      process.exit(1);
    }

    console.log('👤 Found student:', student.fullName);

    // Sample doubts data
    const sampleDoubts = [
      {
        title: "Newton's Third Law Application",
        description: "I'm having trouble understanding how to apply Newton's third law in this physics problem. When two objects interact, how do I determine which force is the action and which is the reaction?",
        subject: "physics",
        topic: "Mechanics",
        difficulty: "medium",
        askedBy: student._id,
        status: "open",
        tags: ["newton", "mechanics", "forces"],
        answers: []
      },
      {
        title: "Calculus Integration by Parts",
        description: "I can't figure out how to solve this integral using integration by parts: ∫x²e^x dx. Can someone walk me through the steps?",
        subject: "mathematics",
        topic: "Calculus",
        difficulty: "hard",
        askedBy: student._id,
        status: "answered",
        tags: ["calculus", "integration", "by-parts"],
        answers: [
          {
            content: "To solve ∫x²e^x dx using integration by parts, we use the formula ∫u dv = uv - ∫v du. Let u = x² and dv = e^x dx. Then du = 2x dx and v = e^x. Applying the formula: ∫x²e^x dx = x²e^x - ∫2xe^x dx. Now we need to apply integration by parts again to ∫2xe^x dx. Let u = 2x and dv = e^x dx, so du = 2 dx and v = e^x. This gives us: ∫2xe^x dx = 2xe^x - ∫2e^x dx = 2xe^x - 2e^x. Therefore: ∫x²e^x dx = x²e^x - (2xe^x - 2e^x) = x²e^x - 2xe^x + 2e^x = e^x(x² - 2x + 2) + C",
            answeredBy: student._id,
            answerType: "student",
            isAccepted: true,
            votes: {
              upvotes: [{ user: student._id, createdAt: new Date() }],
              downvotes: []
            },
            hasVideo: false
          }
        ]
      },
      {
        title: "Photosynthesis Light Reactions",
        description: "What happens during the light-dependent reactions of photosynthesis? I understand the overall process but need help with the specific steps.",
        subject: "biology",
        topic: "Plant Biology",
        difficulty: "medium",
        askedBy: student._id,
        status: "resolved",
        tags: ["photosynthesis", "light-reactions", "chloroplast"],
        answers: [
          {
            content: "The light-dependent reactions occur in the thylakoid membranes of chloroplasts and involve several key steps:\n\n1. **Light Absorption**: Chlorophyll and other pigments absorb light energy\n2. **Water Splitting**: Water molecules are split (photolysis), releasing oxygen, electrons, and protons\n3. **Electron Transport Chain**: Electrons move through photosystem II and photosystem I\n4. **ATP Synthesis**: Chemiosmosis produces ATP using the proton gradient\n5. **NADPH Formation**: Electrons and protons combine with NADP+ to form NADPH\n\nThe overall equation is: 2H₂O + 2NADP+ + 3ADP + 3Pi → O₂ + 2NADPH + 3ATP",
            answeredBy: student._id,
            answerType: "student",
            isAccepted: true,
            votes: {
              upvotes: [{ user: student._id, createdAt: new Date() }],
              downvotes: []
            },
            hasVideo: true,
            videoUrl: "https://www.youtube.com/watch?v=example"
          }
        ]
      },
      {
        title: "Chemical Bonding in Organic Compounds",
        description: "Why do carbon atoms form four covalent bonds? How does this relate to the stability of organic compounds?",
        subject: "chemistry",
        topic: "Organic Chemistry",
        difficulty: "easy",
        askedBy: student._id,
        status: "open",
        tags: ["carbon", "covalent-bonds", "organic-chemistry"],
        answers: []
      },
      {
        title: "Essay Writing Structure",
        description: "I need help structuring my argumentative essay. What's the best way to organize my main points and supporting evidence?",
        subject: "english",
        topic: "Writing",
        difficulty: "medium",
        askedBy: student._id,
        status: "answered",
        tags: ["essay-writing", "structure", "argumentative"],
        answers: [
          {
            content: "A well-structured argumentative essay typically follows this format:\n\n**Introduction:**\n- Hook to grab attention\n- Background information\n- Clear thesis statement\n\n**Body Paragraphs (3-5 paragraphs):**\n- Topic sentence stating your argument\n- Evidence and examples\n- Analysis and explanation\n- Counterarguments and rebuttals\n\n**Conclusion:**\n- Restate thesis\n- Summarize main points\n- Call to action or final thought\n\nEach paragraph should focus on one main idea and include specific evidence to support your claims.",
            answeredBy: student._id,
            answerType: "student",
            isAccepted: false,
            votes: {
              upvotes: [],
              downvotes: []
            },
            hasVideo: false
          }
        ]
      }
    ];

    // Clear existing doubts
    await Doubt.deleteMany({});
    console.log('🗑️ Cleared existing doubts');

    // Insert sample doubts
    const createdDoubts = await Doubt.insertMany(sampleDoubts);
    console.log(`✅ Created ${createdDoubts.length} sample doubts`);

    // Display created doubts
    console.log('\n📚 Sample doubts created:');
    createdDoubts.forEach((doubt, index) => {
      console.log(`${index + 1}. ${doubt.title} (${doubt.subject}) - ${doubt.status}`);
    });

    console.log('\n🎉 Sample doubts added successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error adding sample doubts:', error);
    process.exit(1);
  }
}

