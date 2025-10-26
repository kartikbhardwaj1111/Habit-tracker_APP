// Progress calculation utilities for habit tracking

/**
 * Calculate completion percentage for a habit
 * @param {Object} habit - Habit object with completion data
 * @returns {number} - Completion percentage (0-100)
 */
const calculateCompletionPercentage = (habit) => {
  if (!habit || habit.totalDays === 0) {
    return 0;
  }
  
  const percentage = Math.round((habit.completedDays / habit.totalDays) * 100);
  return Math.min(percentage, 100); // Cap at 100%
};

/**
 * Calculate streak information for a habit
 * @param {Array} completionHistory - Array of completion entries
 * @returns {Object} - Streak information
 */
const calculateStreak = (completionHistory) => {
  if (!Array.isArray(completionHistory) || completionHistory.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort completion history by date (newest first)
  const sortedHistory = [...completionHistory].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Calculate current streak (from most recent date)
  for (let i = 0; i < sortedHistory.length; i++) {
    if (sortedHistory[i].completed) {
      currentStreak = i === 0 ? currentStreak + 1 : currentStreak;
      if (i === 0) currentStreak = 1;
      else if (currentStreak === 0) break; // Current streak is broken
    } else if (i === 0) {
      currentStreak = 0;
      break;
    }
  }

  // Calculate longest streak
  for (const entry of sortedHistory.reverse()) {
    if (entry.completed) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
};

/**
 * Calculate weekly completion rate for a habit
 * @param {Array} completionHistory - Array of completion entries
 * @param {number} weeksBack - Number of weeks to look back (default: 4)
 * @returns {number} - Weekly completion rate (0-100)
 */
const calculateWeeklyCompletionRate = (completionHistory, weeksBack = 4) => {
  if (!Array.isArray(completionHistory) || completionHistory.length === 0) {
    return 0;
  }

  const now = new Date();
  const weeksAgo = new Date(now.getTime() - (weeksBack * 7 * 24 * 60 * 60 * 1000));
  
  const recentEntries = completionHistory.filter(entry => 
    new Date(entry.date) >= weeksAgo
  );

  if (recentEntries.length === 0) {
    return 0;
  }

  const completedEntries = recentEntries.filter(entry => entry.completed);
  return Math.round((completedEntries.length / recentEntries.length) * 100);
};

/**
 * Get progress color based on completion percentage
 * @param {number} percentage - Completion percentage
 * @returns {string} - Color code for progress indication
 */
const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#4ECDC4'; // success color
  if (percentage >= 50) return '#FFE66D'; // warning color
  return '#FF6B6B'; // secondary color
};

/**
 * Calculate habit consistency score
 * @param {Object} habit - Habit object
 * @returns {Object} - Consistency score and rating
 */
const calculateConsistencyScore = (habit) => {
  if (!habit || !habit.completionHistory || habit.completionHistory.length === 0) {
    return { score: 0, rating: 'No Data' };
  }

  const { currentStreak } = calculateStreak(habit.completionHistory);
  const completionRate = calculateCompletionPercentage(habit);
  const weeklyRate = calculateWeeklyCompletionRate(habit.completionHistory);

  // Weighted score calculation
  const score = Math.round(
    (completionRate * 0.4) + 
    (weeklyRate * 0.3) + 
    (Math.min(currentStreak * 5, 30) * 0.3)
  );

  let rating;
  if (score >= 90) rating = 'Excellent';
  else if (score >= 75) rating = 'Great';
  else if (score >= 60) rating = 'Good';
  else if (score >= 40) rating = 'Fair';
  else rating = 'Needs Improvement';

  return { score, rating };
};

/**
 * Get habit progress insights
 * @param {Object} habit - Habit object
 * @returns {Object} - Progress insights and recommendations
 */
const getProgressInsights = (habit) => {
  if (!habit) {
    return { insights: [], recommendations: [] };
  }

  const insights = [];
  const recommendations = [];
  
  const completionRate = calculateCompletionPercentage(habit);
  const { currentStreak, longestStreak } = calculateStreak(habit.completionHistory);
  const weeklyRate = calculateWeeklyCompletionRate(habit.completionHistory);

  // Generate insights
  if (completionRate >= 80) {
    insights.push(`Excellent progress! You've completed ${completionRate}% of your habit.`);
  } else if (completionRate >= 50) {
    insights.push(`Good progress with ${completionRate}% completion rate.`);
  } else {
    insights.push(`You have ${completionRate}% completion rate - there's room for improvement.`);
  }

  if (currentStreak > 0) {
    insights.push(`You're on a ${currentStreak}-day streak!`);
  }

  if (longestStreak > currentStreak && longestStreak > 3) {
    insights.push(`Your longest streak was ${longestStreak} days.`);
  }

  // Generate recommendations
  if (completionRate < 50) {
    recommendations.push('Try setting smaller, more achievable daily goals.');
    recommendations.push('Consider adjusting your habit frequency or target time.');
  }

  if (currentStreak === 0 && habit.totalDays > 3) {
    recommendations.push('Focus on building consistency - even small steps count!');
  }

  if (weeklyRate < 60) {
    recommendations.push('Try to maintain at least 4-5 completions per week.');
  }

  return { insights, recommendations };
};

export {
  calculateCompletionPercentage,
  calculateStreak,
  calculateWeeklyCompletionRate,
  getProgressColor,
  calculateConsistencyScore,
  getProgressInsights
};