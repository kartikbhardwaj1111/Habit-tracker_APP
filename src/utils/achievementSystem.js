// Achievement and Badge System for AI Habit Tracker
import { calculateStreak, calculateCompletionPercentage } from './progressCalculations';

/**
 * Achievement definitions with unlock conditions
 */
export const ACHIEVEMENTS = {
  FIRST_STEPS: {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first habit',
    icon: '🎯',
    category: 'milestone',
    condition: (userStats) => userStats.totalCompletions >= 1
  },
  
  WEEK_WARRIOR: {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streak',
    condition: (userStats) => userStats.longestStreak >= 7
  },
  
  CONSISTENCY_CHAMPION: {
    id: 'consistency_champion',
    title: 'Consistency Champion',
    description: 'Achieve 80% completion rate',
    icon: '⭐',
    category: 'performance',
    condition: (userStats) => userStats.overallCompletionRate >= 80
  },
  
  EARLY_BIRD: {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete 10 habits before 9 AM',
    icon: '🌅',
    category: 'timing',
    condition: (userStats) => userStats.earlyCompletions >= 10
  },
  
  MONTH_MASTER: {
    id: 'month_master',
    title: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    category: 'streak',
    condition: (userStats) => userStats.longestStreak >= 30
  },
  
  PERFECTIONIST: {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: '100% completion for 7 days',
    icon: '💎',
    category: 'performance',
    condition: (userStats) => userStats.perfectWeeks >= 1
  },
  
  HABIT_COLLECTOR: {
    id: 'habit_collector',
    title: 'Habit Collector',
    description: 'Create 5 different habits',
    icon: '📚',
    category: 'milestone',
    condition: (userStats) => userStats.totalHabits >= 5
  },
  
  STREAK_LEGEND: {
    id: 'streak_legend',
    title: 'Streak Legend',
    description: 'Maintain a 100-day streak',
    icon: '🏆',
    category: 'streak',
    condition: (userStats) => userStats.longestStreak >= 100
  },
  
  DEDICATION_MASTER: {
    id: 'dedication_master',
    title: 'Dedication Master',
    description: 'Complete 100 total habits',
    icon: '🎖️',
    category: 'milestone',
    condition: (userStats) => userStats.totalCompletions >= 100
  },
  
  NIGHT_OWL: {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete 10 habits after 8 PM',
    icon: '🦉',
    category: 'timing',
    condition: (userStats) => userStats.lateCompletions >= 10
  }
};

/**
 * Calculate user statistics from habits data
 * @param {Array} habits - Array of habit objects
 * @returns {Object} User statistics for achievement checking
 */
export const calculateUserStats = (habits) => {
  if (!habits || habits.length === 0) {
    return {
      totalHabits: 0,
      totalCompletions: 0,
      longestStreak: 0,
      currentStreak: 0,
      overallCompletionRate: 0,
      perfectWeeks: 0,
      earlyCompletions: 0,
      lateCompletions: 0
    };
  }

  let totalCompletions = 0;
  let longestStreak = 0;
  let currentStreak = 0;
  let totalDays = 0;
  let perfectWeeks = 0;
  let earlyCompletions = 0;
  let lateCompletions = 0;

  habits.forEach(habit => {
    // Basic stats
    totalCompletions += habit.completedDays || 0;
    totalDays += habit.totalDays || 0;

    // Streak calculations
    const streakData = calculateStreak(habit.completionHistory || []);
    longestStreak = Math.max(longestStreak, streakData.longestStreak);
    currentStreak = Math.max(currentStreak, streakData.currentStreak);

    // Perfect weeks calculation (simplified)
    if (habit.completionHistory && habit.completionHistory.length >= 7) {
      const recentWeek = habit.completionHistory.slice(-7);
      if (recentWeek.every(day => day.completed)) {
        perfectWeeks++;
      }
    }

    // Time-based completions (simplified - would need actual completion times)
    if (habit.targetTime) {
      const hour = parseInt(habit.targetTime.split(':')[0]);
      if (hour < 9) {
        earlyCompletions += habit.completedDays || 0;
      } else if (hour >= 20) {
        lateCompletions += habit.completedDays || 0;
      }
    }
  });

  const overallCompletionRate = totalDays > 0 ? Math.round((totalCompletions / totalDays) * 100) : 0;

  return {
    totalHabits: habits.length,
    totalCompletions,
    longestStreak,
    currentStreak,
    overallCompletionRate,
    perfectWeeks,
    earlyCompletions,
    lateCompletions
  };
};

/**
 * Check which achievements the user has unlocked
 * @param {Array} habits - Array of habit objects
 * @param {Array} currentAchievements - Currently unlocked achievements
 * @returns {Object} { newAchievements: [], allUnlocked: [] }
 */
export const checkAchievements = (habits, currentAchievements = []) => {
  const userStats = calculateUserStats(habits);
  const allUnlocked = [];
  const newAchievements = [];

  Object.values(ACHIEVEMENTS).forEach(achievement => {
    if (achievement.condition(userStats)) {
      allUnlocked.push(achievement.id);
      
      // Check if this is a new achievement
      if (!currentAchievements.includes(achievement.id)) {
        newAchievements.push(achievement);
      }
    }
  });

  return {
    newAchievements,
    allUnlocked,
    userStats
  };
};

/**
 * Get achievement by ID
 * @param {string} achievementId - Achievement ID
 * @returns {Object} Achievement object
 */
export const getAchievement = (achievementId) => {
  return Object.values(ACHIEVEMENTS).find(achievement => achievement.id === achievementId);
};

/**
 * Get achievements by category
 * @param {string} category - Achievement category
 * @returns {Array} Array of achievements in category
 */
export const getAchievementsByCategory = (category) => {
  return Object.values(ACHIEVEMENTS).filter(achievement => achievement.category === category);
};

/**
 * Get progress towards next achievement
 * @param {Array} habits - Array of habit objects
 * @param {Array} unlockedAchievements - Currently unlocked achievements
 * @returns {Array} Array of progress objects for locked achievements
 */
export const getAchievementProgress = (habits, unlockedAchievements = []) => {
  const userStats = calculateUserStats(habits);
  const progress = [];

  Object.values(ACHIEVEMENTS).forEach(achievement => {
    if (!unlockedAchievements.includes(achievement.id)) {
      let progressPercentage = 0;
      let currentValue = 0;
      let targetValue = 0;

      // Calculate progress based on achievement type
      switch (achievement.id) {
        case 'first_steps':
          currentValue = userStats.totalCompletions;
          targetValue = 1;
          break;
        case 'week_warrior':
          currentValue = userStats.longestStreak;
          targetValue = 7;
          break;
        case 'consistency_champion':
          currentValue = userStats.overallCompletionRate;
          targetValue = 80;
          break;
        case 'early_bird':
          currentValue = userStats.earlyCompletions;
          targetValue = 10;
          break;
        case 'month_master':
          currentValue = userStats.longestStreak;
          targetValue = 30;
          break;
        case 'perfectionist':
          currentValue = userStats.perfectWeeks;
          targetValue = 1;
          break;
        case 'habit_collector':
          currentValue = userStats.totalHabits;
          targetValue = 5;
          break;
        case 'streak_legend':
          currentValue = userStats.longestStreak;
          targetValue = 100;
          break;
        case 'dedication_master':
          currentValue = userStats.totalCompletions;
          targetValue = 100;
          break;
        case 'night_owl':
          currentValue = userStats.lateCompletions;
          targetValue = 10;
          break;
      }

      progressPercentage = Math.min(Math.round((currentValue / targetValue) * 100), 100);

      progress.push({
        achievement,
        currentValue,
        targetValue,
        progressPercentage
      });
    }
  });

  // Sort by progress percentage (closest to completion first)
  return progress.sort((a, b) => b.progressPercentage - a.progressPercentage);
};