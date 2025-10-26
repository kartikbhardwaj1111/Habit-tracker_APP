// Toast notification utilities for user feedback
import { Alert, ToastAndroid, Platform } from 'react-native';

/**
 * Toast notification types
 */
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Toast duration constants
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  LONG: 4000
};

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
export const showToast = (message, type = TOAST_TYPES.INFO, duration = TOAST_DURATION.SHORT) => {
  if (Platform.OS === 'android') {
    // Use Android's native toast
    const toastDuration = duration <= TOAST_DURATION.SHORT 
      ? ToastAndroid.SHORT 
      : ToastAndroid.LONG;
    
    ToastAndroid.show(message, toastDuration);
  } else {
    // For iOS, use Alert as a simple alternative
    // In a real app, you might want to use a third-party library like react-native-toast-message
    Alert.alert(
      getToastTitle(type),
      message,
      [{ text: 'OK', style: 'default' }],
      { cancelable: true }
    );
  }
};

/**
 * Show success toast
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds
 */
export const showSuccessToast = (message, duration = TOAST_DURATION.SHORT) => {
  showToast(message, TOAST_TYPES.SUCCESS, duration);
};

/**
 * Show error toast
 * @param {string} message - Error message
 * @param {number} duration - Duration in milliseconds
 */
export const showErrorToast = (message, duration = TOAST_DURATION.LONG) => {
  showToast(message, TOAST_TYPES.ERROR, duration);
};

/**
 * Show warning toast
 * @param {string} message - Warning message
 * @param {number} duration - Duration in milliseconds
 */
export const showWarningToast = (message, duration = TOAST_DURATION.SHORT) => {
  showToast(message, TOAST_TYPES.WARNING, duration);
};

/**
 * Show info toast
 * @param {string} message - Info message
 * @param {number} duration - Duration in milliseconds
 */
export const showInfoToast = (message, duration = TOAST_DURATION.SHORT) => {
  showToast(message, TOAST_TYPES.INFO, duration);
};

/**
 * Get toast title based on type
 * @param {string} type - Toast type
 * @returns {string} Title for the toast
 */
const getToastTitle = (type) => {
  switch (type) {
    case TOAST_TYPES.SUCCESS:
      return 'Success';
    case TOAST_TYPES.ERROR:
      return 'Error';
    case TOAST_TYPES.WARNING:
      return 'Warning';
    case TOAST_TYPES.INFO:
    default:
      return 'Info';
  }
};

/**
 * Show confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {Function} onConfirm - Callback for confirm action
 * @param {Function} onCancel - Callback for cancel action
 * @param {Object} options - Additional options
 */
export const showConfirmDialog = (
  title,
  message,
  onConfirm,
  onCancel = null,
  options = {}
) => {
  const {
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    destructive = false
  } = options;

  const buttons = [
    {
      text: cancelText,
      style: 'cancel',
      onPress: onCancel
    },
    {
      text: confirmText,
      style: destructive ? 'destructive' : 'default',
      onPress: onConfirm
    }
  ];

  Alert.alert(title, message, buttons, { cancelable: true });
};

/**
 * Show loading feedback with message
 * @param {string} message - Loading message
 * @param {Function} asyncOperation - Async operation to perform
 * @param {Object} options - Additional options
 * @returns {Promise} Result of the async operation
 */
export const showLoadingFeedback = async (message, asyncOperation, options = {}) => {
  const {
    successMessage = null,
    errorMessage = 'Operation failed',
    showSuccessToast: showSuccess = true,
    showErrorToast: showError = true
  } = options;

  try {
    // Show loading message (in a real app, you might show a loading spinner)
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }

    const result = await asyncOperation();

    // Show success feedback
    if (showSuccess && successMessage) {
      showSuccessToast(successMessage);
    }

    return result;
  } catch (error) {
    // Show error feedback
    if (showError) {
      const finalErrorMessage = error.message || errorMessage;
      showErrorToast(finalErrorMessage);
    }
    throw error;
  }
};

/**
 * Show habit completion feedback
 * @param {Object} habit - Habit object
 * @param {boolean} isCompleted - New completion status
 * @param {number} completionRate - Current completion rate
 */
export const showHabitCompletionFeedback = (habit, isCompleted, completionRate) => {
  if (!isCompleted) {
    // Don't show feedback for uncompleting habits
    return;
  }

  let message;
  let type = TOAST_TYPES.SUCCESS;

  if (completionRate >= 90) {
    message = `🎉 Amazing! You're at ${completionRate}% completion for "${habit.name}"!`;
  } else if (completionRate >= 80) {
    message = `🔥 Great job! ${completionRate}% completion for "${habit.name}"!`;
  } else if (completionRate >= 60) {
    message = `✅ Well done! Keep building that habit!`;
  } else if (completionRate >= 40) {
    message = `👍 Good progress! Every step counts!`;
  } else {
    message = `🌱 Great start! Building habits takes time!`;
  }

  showToast(message, type, TOAST_DURATION.SHORT);
};

/**
 * Show habit creation feedback
 * @param {Object} habit - Created habit object
 */
export const showHabitCreationFeedback = (habit) => {
  const message = `🎯 "${habit.name}" habit created! Let's build consistency!`;
  showSuccessToast(message);
};

/**
 * Show network status feedback
 * @param {boolean} isOnline - Network status
 */
export const showNetworkStatusFeedback = (isOnline) => {
  if (isOnline) {
    showInfoToast('📶 Connection restored');
  } else {
    showWarningToast('📵 Working offline - some features may be limited');
  }
};

/**
 * Show data sync feedback
 * @param {boolean} success - Sync success status
 * @param {number} itemCount - Number of items synced
 */
export const showDataSyncFeedback = (success, itemCount = 0) => {
  if (success) {
    if (itemCount > 0) {
      showSuccessToast(`✅ Synced ${itemCount} habit${itemCount > 1 ? 's' : ''}`);
    } else {
      showInfoToast('✅ Data is up to date');
    }
  } else {
    showErrorToast('❌ Sync failed - will retry later');
  }
};