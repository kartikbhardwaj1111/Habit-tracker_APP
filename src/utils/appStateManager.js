// Enhanced app state management utilities

import React from 'react';
import { Alert } from 'react-native';
import { getHabits, saveHabits, recalculateAllHabitsProgress } from './storage';

/**
 * App state management class for centralized state handling
 */
class AppStateManager {
  constructor() {
    this.listeners = new Set();
    this.state = {
      habits: [],
      loading: false,
      error: null,
      lastUpdated: null,
      isOnline: true
    };
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener - Callback function to handle state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state changes
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Update state and notify listeners
   * @param {Object} updates - State updates to apply
   */
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   * @returns {Object} Current app state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Load habits with comprehensive error handling and loading states
   * @param {Object} options - Loading options
   * @param {boolean} options.showLoading - Whether to show loading state
   * @param {boolean} options.silent - Whether to suppress error alerts
   * @param {boolean} options.recalculate - Whether to recalculate progress
   * @returns {Promise<boolean>} Success status
   */
  async loadHabits({ showLoading = true, silent = false, recalculate = true } = {}) {
    try {
      if (showLoading) {
        this.setState({ loading: true, error: null });
      }

      // Recalculate progress to ensure data consistency
      if (recalculate) {
        await recalculateAllHabitsProgress();
      }

      const habits = await getHabits();
      
      this.setState({
        habits,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error loading habits:', error);
      
      const errorMessage = this.getErrorMessage(error);
      this.setState({
        loading: false,
        error: errorMessage
      });

      if (!silent) {
        this.showErrorAlert('Failed to Load Habits', errorMessage);
      }

      return false;
    }
  }

  /**
   * Save habits with error handling and optimistic updates
   * @param {Array} habits - Habits array to save
   * @param {Object} options - Save options
   * @param {boolean} options.optimistic - Whether to update state optimistically
   * @param {boolean} options.silent - Whether to suppress error alerts
   * @returns {Promise<boolean>} Success status
   */
  async saveHabits(habits, { optimistic = true, silent = false } = {}) {
    const previousHabits = [...this.state.habits];

    try {
      // Optimistic update
      if (optimistic) {
        this.setState({
          habits,
          lastUpdated: new Date().toISOString()
        });
      }

      const success = await saveHabits(habits);

      if (success) {
        // Confirm the optimistic update
        this.setState({
          habits,
          error: null,
          lastUpdated: new Date().toISOString()
        });
        return true;
      } else {
        throw new Error('Failed to save habits to storage');
      }
    } catch (error) {
      console.error('Error saving habits:', error);

      // Revert optimistic update on failure
      if (optimistic) {
        this.setState({ habits: previousHabits });
      }

      const errorMessage = this.getErrorMessage(error);
      this.setState({ error: errorMessage });

      if (!silent) {
        this.showErrorAlert('Failed to Save Habits', errorMessage);
      }

      return false;
    }
  }

  /**
   * Refresh habits data with pull-to-refresh functionality
   * @returns {Promise<boolean>} Success status
   */
  async refreshHabits() {
    return await this.loadHabits({ 
      showLoading: false, 
      silent: true, 
      recalculate: true 
    });
  }

  /**
   * Update a specific habit with optimistic updates
   * @param {string} habitId - ID of habit to update
   * @param {Object} updates - Updates to apply
   * @param {Object} options - Update options
   * @returns {Promise<boolean>} Success status
   */
  async updateHabit(habitId, updates, { optimistic = true } = {}) {
    const previousHabits = [...this.state.habits];
    const habitIndex = this.state.habits.findIndex(h => h.id === habitId);

    if (habitIndex === -1) {
      console.warn(`Habit with ID ${habitId} not found`);
      return false;
    }

    try {
      // Optimistic update
      if (optimistic) {
        const updatedHabits = [...this.state.habits];
        updatedHabits[habitIndex] = { ...updatedHabits[habitIndex], ...updates };
        this.setState({ habits: updatedHabits });
      }

      // Save to storage
      const updatedHabits = [...this.state.habits];
      updatedHabits[habitIndex] = { ...updatedHabits[habitIndex], ...updates };
      
      const success = await this.saveHabits(updatedHabits, { 
        optimistic: false, 
        silent: true 
      });

      if (!success) {
        // Revert optimistic update on failure
        if (optimistic) {
          this.setState({ habits: previousHabits });
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating habit:', error);
      
      // Revert optimistic update on error
      if (optimistic) {
        this.setState({ habits: previousHabits });
      }

      return false;
    }
  }

  /**
   * Add a new habit with optimistic updates
   * @param {Object} habitData - New habit data
   * @returns {Promise<Object|null>} Created habit or null on error
   */
  async addHabit(habitData) {
    try {
      const { addHabit } = require('./storage');
      const newHabit = await addHabit(habitData);

      if (newHabit) {
        // Update state with new habit
        const updatedHabits = [...this.state.habits, newHabit];
        this.setState({
          habits: updatedHabits,
          lastUpdated: new Date().toISOString()
        });
        return newHabit;
      }

      return null;
    } catch (error) {
      console.error('Error adding habit:', error);
      this.showErrorAlert('Failed to Add Habit', this.getErrorMessage(error));
      return null;
    }
  }

  /**
   * Delete a habit with optimistic updates
   * @param {string} habitId - ID of habit to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteHabit(habitId) {
    const previousHabits = [...this.state.habits];

    try {
      // Optimistic update
      const updatedHabits = this.state.habits.filter(h => h.id !== habitId);
      this.setState({ habits: updatedHabits });

      const { deleteHabit } = require('./storage');
      const success = await deleteHabit(habitId);

      if (!success) {
        // Revert optimistic update on failure
        this.setState({ habits: previousHabits });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting habit:', error);
      
      // Revert optimistic update on error
      this.setState({ habits: previousHabits });
      this.showErrorAlert('Failed to Delete Habit', this.getErrorMessage(error));
      
      return false;
    }
  }

  /**
   * Clear all errors from state
   */
  clearError() {
    this.setState({ error: null });
  }

  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  setLoading(loading) {
    this.setState({ loading });
  }

  /**
   * Set online status
   * @param {boolean} isOnline - Online status
   */
  setOnlineStatus(isOnline) {
    this.setState({ isOnline });
  }

  /**
   * Get user-friendly error message
   * @param {Error} error - Error object
   * @returns {string} User-friendly error message
   */
  getErrorMessage(error) {
    if (error.message.includes('storage')) {
      return 'Storage error. Please check device storage and try again.';
    }
    if (error.message.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.message.includes('permission')) {
      return 'Permission error. Please check app permissions.';
    }
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Show error alert to user
   * @param {string} title - Alert title
   * @param {string} message - Alert message
   */
  showErrorAlert(title, message) {
    Alert.alert(
      title,
      message,
      [
        { text: 'OK', style: 'default' },
        { 
          text: 'Retry', 
          style: 'default',
          onPress: () => this.loadHabits({ showLoading: true })
        }
      ]
    );
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccessMessage(message) {
    Alert.alert('Success', message, [{ text: 'OK', style: 'default' }]);
  }

  /**
   * Get habits statistics
   * @returns {Object} Habits statistics
   */
  getHabitsStats() {
    const habits = this.state.habits;
    const today = new Date().toISOString().split('T')[0];

    const totalHabits = habits.length;
    const completedToday = habits.filter(h => h.isCompleted).length;
    const totalCompletions = habits.reduce((sum, h) => sum + h.completedDays, 0);
    const totalPossible = habits.reduce((sum, h) => sum + h.totalDays, 0);
    const overallCompletionRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;

    return {
      totalHabits,
      completedToday,
      totalCompletions,
      totalPossible,
      overallCompletionRate,
      todayCompletionRate: totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0
    };
  }

  /**
   * Reset app state to initial values
   */
  reset() {
    this.setState({
      habits: [],
      loading: false,
      error: null,
      lastUpdated: null,
      isOnline: true
    });
  }
}

// Create singleton instance
const appStateManager = new AppStateManager();

// React hook for using app state manager
export const useAppState = () => {
  const [state, setState] = React.useState(appStateManager.getState());

  React.useEffect(() => {
    const unsubscribe = appStateManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    loadHabits: appStateManager.loadHabits.bind(appStateManager),
    saveHabits: appStateManager.saveHabits.bind(appStateManager),
    refreshHabits: appStateManager.refreshHabits.bind(appStateManager),
    updateHabit: appStateManager.updateHabit.bind(appStateManager),
    addHabit: appStateManager.addHabit.bind(appStateManager),
    deleteHabit: appStateManager.deleteHabit.bind(appStateManager),
    clearError: appStateManager.clearError.bind(appStateManager),
    setLoading: appStateManager.setLoading.bind(appStateManager),
    setOnlineStatus: appStateManager.setOnlineStatus.bind(appStateManager),
    getHabitsStats: appStateManager.getHabitsStats.bind(appStateManager),
    reset: appStateManager.reset.bind(appStateManager)
  };
};

export default appStateManager;