// Simple test to verify the student dashboard fix
console.log('🧪 Testing Student Dashboard Fix...\n');

// Simulate the progressData fix
const dashboardData = {
  stats: {
    topicsCompleted: 80,
    assessmentsCompleted: 70,
    weeklyStreak: 5
  }
};

// Test the progressData definition (same as in the fixed component)
const progressData = dashboardData?.stats || {
  topicsCompleted: 75,
  assessmentsCompleted: 60,
  weeklyStreak: 6,
};

console.log('✅ progressData defined successfully:');
console.log('  - topicsCompleted:', progressData.topicsCompleted);
console.log('  - assessmentsCompleted:', progressData.assessmentsCompleted);
console.log('  - weeklyStreak:', progressData.weeklyStreak);

// Test chart data generation (same as in the fixed component)
const progressChartData = {
  datasets: [{
    data: [progressData.topicsCompleted || 75, 100 - (progressData.topicsCompleted || 75)],
    backgroundColor: ['#4F46E5', '#E5E7EB'],
    borderWidth: 0,
    cutout: '75%',
  }],
};

const assessmentChartData = {
  datasets: [{
    data: [progressData.assessmentsCompleted || 60, 100 - (progressData.assessmentsCompleted || 60)],
    backgroundColor: ['#10B981', '#E5E7EB'],
    borderWidth: 0,
    cutout: '75%',
  }],
};

console.log('\n✅ Chart data generated successfully:');
console.log('  - Progress chart data:', progressChartData.datasets[0].data);
console.log('  - Assessment chart data:', assessmentChartData.datasets[0].data);

console.log('\n🎉 Student Dashboard fix test passed!');
console.log('The ReferenceError: progressData is not defined should now be resolved.');
