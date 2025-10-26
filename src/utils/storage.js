// Storage utility functions for AsyncStorage operations

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_VALUES, validateStoredData, generateUUID } from './types';

// Generic storage helper functions

/**
 * Get data from AsyncStorage with error handling
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {Promise<*>} - Retrieved data or default value
 */
const getStorageData = async (key, defaultValue = null) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Set data in AsyncStorage with error handling
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {Promise<boolean>} - Success status
 */
const setStorageData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`Error setting data for key ${key}:`, error);
    return false;
  }
};

/**
 * Update data in AsyncStorage with error handling
 * @param {string} key - Storage key
 * @param {Function} updateFunction - Function to update the data
 * @returns {Promise<boolean>} - Success status
 */
const updateStorageData = async (key, updateFunction) => {
  try {
    const currentData = await getStorageData(key, {});
    const updatedData = updateFunction(currentData);
    return await setStorageData(key, updatedData);
  } catch (error) {
    console.error(`Error updating data for key ${key}:`, error);
    return false;
  }
};

/**
 * Delete data from AsyncStorage with error handling
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} - Success status
 */
const deleteStorageData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error deleting data for key ${key}:`, error);
    return false;
  }
};

// Habit-specific storage operations

/**
 * Get all habits from storage
 * @returns {Promise<Array>} - Array of habits or empty array on error
 */
const getHabits = async () => {
  try {
    const storedData = await getStorageData(STORAGE_KEYS.HABITS, {
      habits: DEFAULT_VALUES.HABITS,
      lastUpdated: new Date().toISOString(),
      version: DEFAULT_VALUES.VERSION
    });
    
    // Validate stored data
    const validation = validateStoredData(storedData);
    if (!validation.isValid) {
      console.warn('Invalid stored data, returning empty habits:', validation.errors);
      return DEFAULT_VALUES.HABITS;
    }
    
    return storedData.habits;
  } catch (error) {
    console.error('Error getting habits:', error);
    return DEFAULT_VALUES.HABITS;
  }
};

/**
 * Save habits to storage
 * @param {Array} habits - Array of habit objects
 * @returns {Promise<boolean>} - Success status
 */
const saveHabits = async (habits) => {
  try {
    const storedData = {
      habits: habits || DEFAULT_VALUES.HABITS,
      lastUpdated: new Date().toISOString(),
      version: DEFAULT_VALUES.VERSION
    };
    
    // Validate data before saving
    const validation = validateStoredData(storedData);
    if (!validation.isValid) {
      console.error('Invalid habit data, cannot save:', validation.errors);
      return false;
    }
    
    return await setStorageData(STORAGE_KEYS.HABITS, storedData);
  } catch (error) {
    console.error('Error saving habits:', error);
    return false;
  }
};

/**
 * Add a new habit to storage
 * @param {Object} habitData - Habit data to add
 * @returns {Promise<Object|null>} - Created habit object or null on error
 */
const addHabit = async (habitData) => {
  try {
    const habits = await getHabits();
    const newHabit = {
      id: generateUUID(),
      name: habitData.name,
      frequency: habitData.frequency,
      targetTime: habitData.targetTime || null,
      createdAt: new Date(),
      completedDays: 0,
      totalDays: 0,
      completionHistory: [],
      isCompleted: false
    };
    
    const updatedHabits = [...habits, newHabit];
    const success = await saveHabits(updatedHabits);
    
    return success ? newHabit : null;
  } catch (error) {
    console.error('Error adding habit:', error);
    return null;
  }
};

/**
 * Update a specific habit in storage
 * @param {string} habitId - ID of habit to update
 * @param {Object} updates - Updates to apply
 * @returns {Promise<boolean>} - Success status
 */
const updateHabit = async (habitId, updates) => {
  try {
    const habits = await getHabits();
    const habitIndex = habits.findIndex(habit => habit.id === habitId);
    
    if (habitIndex === -1) {
      console.warn(`Habit with ID ${habitId} not found`);
      return false;
    }
    
    const updatedHabit = { ...habits[habitIndex], ...updates };
    const updatedHabits = [...habits];
    updatedHabits[habitIndex] = updatedHabit;
    
    return await saveHabits(updatedHabits);
  } catch (error) {
    console.error('Error updating habit:', error);
    return false;
  }
};

/**
 * Update habit completion status with enhanced progress tracking
 * @param {string} habitId - ID of habit to update
 * @param {boolean} isCompleted - New completion status
 * @returns {Promise<boolean>} - Success status
 */
const updateHabitCompletion = async (habitId, isCompleted) => {
  try {
    const habits = await getHabits();
    const habitIndex = habits.findIndex(habit => habit.id === habitId);
    
    if (habitIndex === -1) {
      console.warn(`Habit with ID ${habitId} not found`);
      return false;
    }
    
    const habit = habits[habitIndex];
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize completion history if it doesn't exist
    const completionHistory = habit.completionHistory || [];
    
    // Update completion history
    const existingEntryIndex = completionHistory.findIndex(entry => entry.date === today);
    const updatedHistory = [...completionHistory];
    
    if (existingEntryIndex >= 0) {
      // Update existing entry
      updatedHistory[existingEntryIndex] = { date: today, completed: isCompleted };
    } else {
      // Add new entry
      updatedHistory.push({ date: today, completed: isCompleted });
    }
    
    // Sort completion history by date for consistency
    updatedHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Recalculate completion counts based on updated history
    const completedDays = updatedHistory.filter(entry => entry.completed).length;
    const totalDays = updatedHistory.length;
    
    // Calculate days since creation for more accurate total days
    const createdAt = new Date(habit.createdAt);
    const daysSinceCreation = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24)) + 1;
    const actualTotalDays = Math.max(totalDays, daysSinceCreation);
    
    const updatedHabit = {
      ...habit,
      isCompleted,
      completedDays,
      totalDays: actualTotalDays,
      completionHistory: updatedHistory,
      lastUpdated: new Date().toISOString()
    };
    
    const updatedHabits = [...habits];
    updatedHabits[habitIndex] = updatedHabit;
    
    return await saveHabits(updatedHabits);
  } catch (error) {
    console.error('Error updating habit completion:', error);
    return false;
  }
};

/**
 * Delete a habit from storage
 * @param {string} habitId - ID of habit to delete
 * @returns {Promise<boolean>} - Success status
 */
const deleteHabit = async (habitId) => {
  try {
    const habits = await getHabits();
    const filteredHabits = habits.filter(habit => habit.id !== habitId);
    
    if (filteredHabits.length === habits.length) {
      console.warn(`Habit with ID ${habitId} not found`);
      return false;
    }
    
    return await saveHabits(filteredHabits);
  } catch (error) {
    console.error('Error deleting habit:', error);
    return false;
  }
};

/**
 * Recalculate progress for all habits to ensure data consistency
 * @returns {Promise<boolean>} - Success status
 */
const recalculateAllHabitsProgress = async () => {
  try {
    const habits = await getHabits();
    const updatedHabits = habits.map(habit => {
      const completionHistory = habit.completionHistory || [];
      const completedDays = completionHistory.filter(entry => entry.completed).length;
      
      // Calculate days since creation for accurate total days
      const createdAt = new Date(habit.createdAt);
      const daysSinceCreation = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24)) + 1;
      const totalDays = Math.max(completionHistory.length, daysSinceCreation);
      
      // Check if today is completed
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = completionHistory.find(entry => entry.date === today);
      const isCompleted = todayEntry ? todayEntry.completed : false;
      
      return {
        ...habit,
        completedDays,
        totalDays,
        isCompleted,
        lastUpdated: new Date().toISOString()
      };
    });
    
    return await saveHabits(updatedHabits);
  } catch (error) {
    console.error('Error recalculating habits progress:', error);
    return false;
  }
};

/**
 * Clear all habits from storage
 * @returns {Promise<boolean>} - Success status
 */
const clearAllHabits = async () => {
  try {
    return await saveHabits(DEFAULT_VALUES.HABITS);
  } catch (error) {
    console.error('Error clearing habits:', error);
    return false;
  }
};

/**
 * Get user achievements from storage
 * @returns {Promise<Array>} - Array of unlocked achievement IDs
 */
const getUserAchievements = async () => {
  try {
    const achievements = await getStorageData(STORAGE_KEYS.ACHIEVEMENTS, []);
    return Array.isArray(achievements) ? achievements : [];
  } catch (error) {
    console.error('Error getting achievements:', error);
    return [];
  }
};

/**
 * Save user achievements to storage
 * @param {Array} achievements - Array of achievement IDs
 * @returns {Promise<boolean>} - Success status
 */
const saveUserAchievements = async (achievements) => {
  try {
    return await setStorageData(STORAGE_KEYS.ACHIEVEMENTS, achievements || []);
  } catch (error) {
    console.error('Error saving achievements:', error);
    return false;
  }
};

/**
 * Add new achievement to user's collection
 * @param {string} achievementId - Achievement ID to add
 * @returns {Promise<boolean>} - Success status
 */
const unlockAchievement = async (achievementId) => {
  try {
    const currentAchievements = await getUserAchievements();
    if (!currentAchievements.includes(achievementId)) {
      const updatedAchievements = [...currentAchievements, achievementId];
      return await saveUserAchievements(updatedAchievements);
    }
    return true; // Already unlocked
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return false;
  }
};

// Export all functions
export {
  getStorageData,
  setStorageData,
  updateStorageData,
  deleteStorageData,
  getHabits,
  saveHabits,
  addHabit,
  updateHabit,
  updateHabitCompletion,
  deleteHabit,
  recalculateAllHabitsProgress,
  clearAllHabits,
  getUserAchievements,
  saveUserAchievements,
  unlockAchievement
};