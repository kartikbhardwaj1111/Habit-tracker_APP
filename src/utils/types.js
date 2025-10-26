// Data model interfaces and types for the AI Habit Tracker

/**
 * Habit data structure
 * @typedef {Object} Habit
 * @property {string} id - UUID for unique identification
 * @property {string} name - User-defined habit name
 * @property {'daily'|'weekly'} frequency - Tracking frequency
 * @property {string} [targetTime] - Optional target time
 * @property {Date} createdAt - Creation timestamp
 * @property {number} completedDays - Count of completed instances
 * @property {number} totalDays - Total tracking days since creation
 * @property {Array<{date: string, completed: boolean}>} completionHistory - Detailed completion tracking
 * @property {boolean} isCompleted - Current day/period completion status
 */

/**
 * Stored data structure for AsyncStorage
 * @typedef {Object} StoredData
 * @property {Habit[]} habits - Array of habit objects
 * @property {string} lastUpdated - ISO date string of last update
 * @property {string} version - App version for data migration
 */

/**
 * Completion history entry
 * @typedef {Object} CompletionEntry
 * @property {string} date - ISO date string
 * @property {boolean} completed - Completion status for that date
 */

// Storage keys for AsyncStorage
const STORAGE_KEYS = {
  HABITS: '@habits',
  USER_PREFERENCES: '@user_preferences',
  AI_CACHE: '@ai_cache',
  ACHIEVEMENTS: '@achievements'
};

// Default values
const DEFAULT_VALUES = {
  HABITS: [],
  VERSION: '1.0.0',
  FREQUENCY_OPTIONS: ['daily', 'weekly']
};

// Default habit structure
const createDefaultHabit = (name, frequency = 'daily', targetTime = null) => ({
  id: generateUUID(),
  name,
  frequency,
  targetTime,
  createdAt: new Date(),
  completedDays: 0,
  totalDays: 0,
  completionHistory: [],
  isCompleted: false
});

// Simple UUID generator
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Validation functions
const validateHabit = (habit) => {
  const errors = [];
  
  if (!habit.name || typeof habit.name !== 'string' || habit.name.trim().length === 0) {
    errors.push('Habit name is required and must be a non-empty string');
  }
  
  if (!habit.frequency || !DEFAULT_VALUES.FREQUENCY_OPTIONS.includes(habit.frequency)) {
    errors.push('Frequency must be either "daily" or "weekly"');
  }
  
  if (habit.targetTime && typeof habit.targetTime !== 'string') {
    errors.push('Target time must be a string if provided');
  }
  
  if (typeof habit.completedDays !== 'number' || habit.completedDays < 0) {
    errors.push('Completed days must be a non-negative number');
  }
  
  if (typeof habit.totalDays !== 'number' || habit.totalDays < 0) {
    errors.push('Total days must be a non-negative number');
  }
  
  if (!Array.isArray(habit.completionHistory)) {
    errors.push('Completion history must be an array');
  }
  
  if (typeof habit.isCompleted !== 'boolean') {
    errors.push('isCompleted must be a boolean');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateStoredData = (data) => {
  const errors = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Data must be an object');
    return { isValid: false, errors };
  }
  
  if (!Array.isArray(data.habits)) {
    errors.push('Habits must be an array');
  } else {
    data.habits.forEach((habit, index) => {
      const habitValidation = validateHabit(habit);
      if (!habitValidation.isValid) {
        errors.push(`Habit at index ${index}: ${habitValidation.errors.join(', ')}`);
      }
    });
  }
  
  if (!data.lastUpdated || typeof data.lastUpdated !== 'string') {
    errors.push('lastUpdated must be a string');
  }
  
  if (!data.version || typeof data.version !== 'string') {
    errors.push('version must be a string');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateHabitCreation = (habitData) => {
  const errors = [];
  
  if (!habitData.name || typeof habitData.name !== 'string' || habitData.name.trim().length === 0) {
    errors.push('Habit name is required');
  }
  
  if (!habitData.frequency || !DEFAULT_VALUES.FREQUENCY_OPTIONS.includes(habitData.frequency)) {
    errors.push('Valid frequency is required (daily or weekly)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export all functions and constants
export {
  createDefaultHabit,
  generateUUID,
  validateHabit,
  validateStoredData,
  validateHabitCreation,
  STORAGE_KEYS,
  DEFAULT_VALUES
};