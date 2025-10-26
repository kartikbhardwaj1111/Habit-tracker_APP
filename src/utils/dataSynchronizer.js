// Data synchronization utilities for refresh mechanisms

import { handleError, ERROR_TYPES, ERROR_SEVERITY } from './errorHandler';
import { getHabits, saveHabits, recalculateAllHabitsProgress } from './storage';

/**
 * Data synchronization manager for handling data refresh and consistency
 */
class DataSynchronizer {
  constructor() {
    this.syncInProgress = false;
    this.lastSyncTime = null;
    this.syncListeners = new Set();
    this.conflictResolvers = new Map();
  }

  /**
   * Subscribe to sync events
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  /**
   * Notify all listeners of sync events
   * @param {string} event - Event type
   * @param {Object} data - Event data
   */
  notifyListeners(event, data = {}) {
    this.syncListeners.forEach(listener => {
      try {
        listener({ event, data, timestamp: new Date().toISOString() });
      } catch (error) {
        console.error('Error notifying sync listener:', error);
      }
    });
  }

  /**
   * Perform full data synchronization
   * @param {Object} options - Sync options
   * @param {boolean} options.force - Force sync even if already in progress
   * @param {boolean} options.recalculate - Whether to recalculate progress
   * @returns {Promise<Object>} Sync result
   */
  async performFullSync(options = {}) {
    const { force = false, recalculate = true } = options;

    if (this.syncInProgress && !force) {
      return {
        success: false,
        message: 'Sync already in progress',
        data: null
      };
    }

    this.syncInProgress = true;
    this.notifyListeners('sync_started');

    try {
      console.log('Starting full data synchronization...');

      // Step 1: Recalculate progress if requested
      if (recalculate) {
        this.notifyListeners('sync_progress', { step: 'recalculating', progress: 25 });
        await recalculateAllHabitsProgress();
      }

      // Step 2: Load fresh data from storage
      this.notifyListeners('sync_progress', { step: 'loading', progress: 50 });
      const habits = await getHabits();

      // Step 3: Validate data integrity
      this.notifyListeners('sync_progress', { step: 'validating', progress: 75 });
      const validationResult = await this.validateDataIntegrity(habits);

      if (!validationResult.isValid) {
        console.warn('Data integrity issues found:', validationResult.issues);
        
        // Attempt to fix data issues
        const fixedHabits = await this.fixDataIntegrity(habits, validationResult.issues);
        await saveHabits(fixedHabits);
      }

      // Step 4: Complete sync
      this.notifyListeners('sync_progress', { step: 'completing', progress: 100 });
      this.lastSyncTime = new Date().toISOString();

      this.notifyListeners('sync_completed', {
        habitsCount: habits.length,
        lastSyncTime: this.lastSyncTime,
        issues: validationResult.issues
      });

      console.log(`Full sync completed successfully. ${habits.length} habits synchronized.`);

      return {
        success: true,
        message: 'Sync completed successfully',
        data: {
          habits,
          lastSyncTime: this.lastSyncTime,
          issues: validationResult.issues
        }
      };

    } catch (error) {
      console.error('Full sync failed:', error);
      
      const handledError = handleError(error, {
        showAlert: false,
        logError: true,
        fallbackMessage: 'Data synchronization failed'
      });

      this.notifyListeners('sync_failed', {
        error: handledError.error,
        message: handledError.userMessage
      });

      return {
        success: false,
        message: handledError.userMessage,
        error: handledError.error
      };

    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Perform incremental data refresh
   * @param {Array} currentHabits - Current habits in memory
   * @returns {Promise<Object>} Refresh result
   */
  async performIncrementalRefresh(currentHabits = []) {
    try {
      console.log('Starting incremental data refresh...');

      // Load latest data from storage
      const storageHabits = await getHabits();

      // Compare and detect changes
      const changes = this.detectChanges(currentHabits, storageHabits);

      if (changes.hasChanges) {
        console.log('Changes detected:', changes.summary);
        
        this.notifyListeners('data_changed', {
          changes: changes.summary,
          updatedHabits: storageHabits
        });

        return {
          success: true,
          hasChanges: true,
          changes: changes.summary,
          data: storageHabits
        };
      } else {
        console.log('No changes detected during incremental refresh');
        
        return {
          success: true,
          hasChanges: false,
          data: storageHabits
        };
      }

    } catch (error) {
      console.error('Incremental refresh failed:', error);
      
      const handledError = handleError(error, {
        showAlert: false,
        logError: true
      });

      return {
        success: false,
        error: handledError.error
      };
    }
  }

  /**
   * Validate data integrity
   * @param {Array} habits - Habits to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateDataIntegrity(habits) {
    const issues = [];

    try {
      // Check for duplicate IDs
      const ids = habits.map(h => h.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        issues.push({
          type: 'duplicate_ids',
          severity: 'high',
          data: duplicateIds
        });
      }

      // Check for missing required fields
      habits.forEach((habit, index) => {
        if (!habit.id) {
          issues.push({
            type: 'missing_id',
            severity: 'critical',
            data: { index, habit: habit.name }
          });
        }
        if (!habit.name || habit.name.trim() === '') {
          issues.push({
            type: 'missing_name',
            severity: 'high',
            data: { index, id: habit.id }
          });
        }
        if (!habit.frequency || !['daily', 'weekly'].includes(habit.frequency)) {
          issues.push({
            type: 'invalid_frequency',
            severity: 'medium',
            data: { index, id: habit.id, frequency: habit.frequency }
          });
        }
      });

      // Check for data consistency
      habits.forEach((habit, index) => {
        if (habit.completedDays > habit.totalDays) {
          issues.push({
            type: 'inconsistent_progress',
            severity: 'medium',
            data: { 
              index, 
              id: habit.id, 
              completedDays: habit.completedDays, 
              totalDays: habit.totalDays 
            }
          });
        }

        if (habit.completionHistory && Array.isArray(habit.completionHistory)) {
          const historyCompletions = habit.completionHistory.filter(h => h.completed).length;
          if (Math.abs(historyCompletions - habit.completedDays) > 1) {
            issues.push({
              type: 'history_mismatch',
              severity: 'low',
              data: { 
                index, 
                id: habit.id, 
                historyCompletions, 
                recordedCompletions: habit.completedDays 
              }
            });
          }
        }
      });

      return {
        isValid: issues.length === 0,
        issues,
        summary: {
          totalHabits: habits.length,
          criticalIssues: issues.filter(i => i.severity === 'critical').length,
          highIssues: issues.filter(i => i.severity === 'high').length,
          mediumIssues: issues.filter(i => i.severity === 'medium').length,
          lowIssues: issues.filter(i => i.severity === 'low').length
        }
      };

    } catch (error) {
      console.error('Data validation failed:', error);
      return {
        isValid: false,
        issues: [{
          type: 'validation_error',
          severity: 'critical',
          data: { error: error.message }
        }]
      };
    }
  }

  /**
   * Fix data integrity issues
   * @param {Array} habits - Habits with issues
   * @param {Array} issues - Detected issues
   * @returns {Promise<Array>} Fixed habits
   */
  async fixDataIntegrity(habits, issues) {
    let fixedHabits = [...habits];

    try {
      for (const issue of issues) {
        switch (issue.type) {
          case 'duplicate_ids':
            // Generate new IDs for duplicates
            const { generateUUID } = require('./types');
            fixedHabits = fixedHabits.map((habit, index) => {
              if (issue.data.includes(habit.id) && index > 0) {
                return { ...habit, id: generateUUID() };
              }
              return habit;
            });
            break;

          case 'missing_id':
            // Generate ID for habits without one
            const { generateUUID: genUUID } = require('./types');
            if (fixedHabits[issue.data.index]) {
              fixedHabits[issue.data.index] = {
                ...fixedHabits[issue.data.index],
                id: genUUID()
              };
            }
            break;

          case 'invalid_frequency':
            // Set default frequency
            if (fixedHabits[issue.data.index]) {
              fixedHabits[issue.data.index] = {
                ...fixedHabits[issue.data.index],
                frequency: 'daily'
              };
            }
            break;

          case 'inconsistent_progress':
            // Recalculate progress from history
            const habit = fixedHabits[issue.data.index];
            if (habit && habit.completionHistory) {
              const completedDays = habit.completionHistory.filter(h => h.completed).length;
              fixedHabits[issue.data.index] = {
                ...habit,
                completedDays
              };
            }
            break;
        }
      }

      console.log(`Fixed ${issues.length} data integrity issues`);
      return fixedHabits;

    } catch (error) {
      console.error('Error fixing data integrity:', error);
      return habits; // Return original habits if fixing fails
    }
  }

  /**
   * Detect changes between two habit arrays
   * @param {Array} oldHabits - Previous habits
   * @param {Array} newHabits - New habits
   * @returns {Object} Change detection result
   */
  detectChanges(oldHabits, newHabits) {
    const changes = {
      added: [],
      removed: [],
      modified: [],
      hasChanges: false
    };

    try {
      const oldIds = new Set(oldHabits.map(h => h.id));
      const newIds = new Set(newHabits.map(h => h.id));

      // Detect added habits
      changes.added = newHabits.filter(h => !oldIds.has(h.id));

      // Detect removed habits
      changes.removed = oldHabits.filter(h => !newIds.has(h.id));

      // Detect modified habits
      newHabits.forEach(newHabit => {
        const oldHabit = oldHabits.find(h => h.id === newHabit.id);
        if (oldHabit) {
          // Simple comparison of key fields
          const isModified = (
            oldHabit.name !== newHabit.name ||
            oldHabit.isCompleted !== newHabit.isCompleted ||
            oldHabit.completedDays !== newHabit.completedDays ||
            oldHabit.totalDays !== newHabit.totalDays
          );

          if (isModified) {
            changes.modified.push({
              id: newHabit.id,
              old: oldHabit,
              new: newHabit
            });
          }
        }
      });

      changes.hasChanges = (
        changes.added.length > 0 ||
        changes.removed.length > 0 ||
        changes.modified.length > 0
      );

      changes.summary = {
        addedCount: changes.added.length,
        removedCount: changes.removed.length,
        modifiedCount: changes.modified.length,
        totalChanges: changes.added.length + changes.removed.length + changes.modified.length
      };

      return changes;

    } catch (error) {
      console.error('Error detecting changes:', error);
      return {
        hasChanges: false,
        error: error.message
      };
    }
  }

  /**
   * Get sync status
   * @returns {Object} Current sync status
   */
  getSyncStatus() {
    return {
      syncInProgress: this.syncInProgress,
      lastSyncTime: this.lastSyncTime,
      listenersCount: this.syncListeners.size
    };
  }

  /**
   * Reset synchronizer state
   */
  reset() {
    this.syncInProgress = false;
    this.lastSyncTime = null;
    this.syncListeners.clear();
    console.log('Data synchronizer reset');
  }
}

// Create singleton instance
const dataSynchronizer = new DataSynchronizer();

export default dataSynchronizer;