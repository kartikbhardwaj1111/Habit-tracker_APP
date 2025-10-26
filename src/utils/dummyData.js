// Dummy data generation and first-time app launch utilities

const { generateUUID } = require('./types');
const { getStorageData, setStorageData } = require('./storage');

// Storage key for first launch detection
const FIRST_LAUNCH_KEY = '@first_launch_completed';

/**
 * Generate sample habits with various completion states
 * @returns {Array} Array of dummy habit objects
 */
const generateDummyHabits = () => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Helper function to generate completion history
  const generateCompletionHistory = (daysBack, completionRate = 0.7) => {
    const history = [];
    for (let i = daysBack; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const completed = Math.random() < completionRate;
      history.push({ date: dateString, completed });
    }
    return history;
  };

  // Helper function to calculate stats from history
  const calculateStats = (history) => {
    const completedDays = history.filter(entry => entry.completed).length;
    const totalDays = history.length;
    const todayEntry = history.find(entry => entry.date === today);
    const isCompleted = todayEntry ? todayEntry.completed : false;
    return { completedDays, totalDays, isCompleted };
  };

  const dummyHabits = [
    // High performer habit
    {
      id: generateUUID(),
      name: 'Drink 8 glasses of water',
      frequency: 'daily',
      targetTime: '08:00',
      createdAt: new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000)), // 14 days ago
      completionHistory: generateCompletionHistory(13, 0.9), // 90% completion rate
    },
    
    // Moderate performer habit
    {
      id: generateUUID(),
      name: 'Read for 30 minutes',
      frequency: 'daily',
      targetTime: '20:00',
      createdAt: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)), // 10 days ago
      completionHistory: generateCompletionHistory(9, 0.6), // 60% completion rate
    },
    
    // New habit with mixed performance
    {
      id: generateUUID(),
      name: 'Morning meditation',
      frequency: 'daily',
      targetTime: '07:00',
      createdAt: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)), // 7 days ago
      completionHistory: generateCompletionHistory(6, 0.5), // 50% completion rate
    },
    
    // Weekly habit
    {
      id: generateUUID(),
      name: 'Go to the gym',
      frequency: 'weekly',
      targetTime: null,
      createdAt: new Date(now.getTime() - (21 * 24 * 60 * 60 * 1000)), // 3 weeks ago
      completionHistory: [
        { date: new Date(now.getTime() - (21 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], completed: true },
        { date: new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], completed: false },
        { date: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], completed: true },
        { date: today, completed: false }
      ]
    },
    
    // Struggling habit (low completion rate)
    {
      id: generateUUID(),
      name: 'Practice guitar',
      frequency: 'daily',
      targetTime: '19:00',
      createdAt: new Date(now.getTime() - (12 * 24 * 60 * 60 * 1000)), // 12 days ago
      completionHistory: generateCompletionHistory(11, 0.3), // 30% completion rate
    },
    
    // Recently started habit
    {
      id: generateUUID(),
      name: 'Take vitamins',
      frequency: 'daily',
      targetTime: '08:30',
      createdAt: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)), // 3 days ago
      completionHistory: generateCompletionHistory(2, 0.8), // 80% completion rate
    }
  ];

  // Calculate stats for each habit
  return dummyHabits.map(habit => {
    const stats = calculateStats(habit.completionHistory);
    return {
      ...habit,
      completedDays: stats.completedDays,
      totalDays: stats.totalDays,
      isCompleted: stats.isCompleted
    };
  });
};

/**
 * Check if this is the first time the app is launched
 * @returns {Promise<boolean>} True if first launch, false otherwise
 */
const isFirstLaunch = async () => {
  try {
    const firstLaunchCompleted = await getStorageData(FIRST_LAUNCH_KEY, false);
    return !firstLaunchCompleted;
  } catch (error) {
    console.error('Error checking first launch status:', error);
    return true; // Assume first launch on error to be safe
  }
};

/**
 * Mark first launch as completed
 * @returns {Promise<boolean>} Success status
 */
const markFirstLaunchCompleted = async () => {
  try {
    return await setStorageData(FIRST_LAUNCH_KEY, true);
  } catch (error) {
    console.error('Error marking first launch as completed:', error);
    return false;
  }
};

/**
 * Initialize app with dummy data on first launch
 * @returns {Promise<boolean>} Success status
 */
const initializeAppWithDummyData = async () => {
  try {
    const firstLaunch = await isFirstLaunch();
    
    if (!firstLaunch) {
      console.log('Not first launch, skipping dummy data initialization');
      return true;
    }

    console.log('First launch detected, initializing with dummy data...');
    
    // Generate and save dummy habits
    const dummyHabits = generateDummyHabits();
    const { saveHabits } = require('./storage');
    const success = await saveHabits(dummyHabits);
    
    if (success) {
      // Mark first launch as completed
      await markFirstLaunchCompleted();
      console.log(`Successfully initialized app with ${dummyHabits.length} dummy habits`);
      return true;
    } else {
      console.error('Failed to save dummy habits');
      return false;
    }
  } catch (error) {
    console.error('Error initializing app with dummy data:', error);
    return false;
  }
};

/**
 * Reset app to first launch state (for testing purposes)
 * @returns {Promise<boolean>} Success status
 */
const resetToFirstLaunch = async () => {
  try {
    const { clearAllHabits } = require('./storage');
    await clearAllHabits();
    await setStorageData(FIRST_LAUNCH_KEY, false);
    console.log('App reset to first launch state');
    return true;
  } catch (error) {
    console.error('Error resetting to first launch state:', error);
    return false;
  }
};

module.exports = {
  generateDummyHabits,
  isFirstLaunch,
  markFirstLaunchCompleted,
  initializeAppWithDummyData,
  resetToFirstLaunch
};