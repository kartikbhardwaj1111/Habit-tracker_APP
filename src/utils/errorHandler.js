// Comprehensive error handling utilities

import { Alert } from 'react-native';

/**
 * Error types for categorization
 */
export const ERROR_TYPES = {
  STORAGE: 'storage',
  NETWORK: 'network',
  VALIDATION: 'validation',
  API: 'api',
  PERMISSION: 'permission',
  UNKNOWN: 'unknown'
};

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Enhanced error class with additional context
 */
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, severity = ERROR_SEVERITY.MEDIUM, context = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Error handler class for centralized error management
 */
class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  /**
   * Handle and log errors with appropriate user feedback
   * @param {Error|AppError} error - Error to handle
   * @param {Object} options - Handling options
   * @param {boolean} options.showAlert - Whether to show alert to user
   * @param {boolean} options.logError - Whether to log error
   * @param {string} options.fallbackMessage - Fallback message for user
   * @returns {Object} Error handling result
   */
  handleError(error, options = {}) {
    const {
      showAlert = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred'
    } = options;

    // Enhance error if it's not already an AppError
    const enhancedError = this.enhanceError(error);

    // Log error
    if (logError) {
      this.logError(enhancedError);
    }

    // Get user-friendly message
    const userMessage = this.getUserFriendlyMessage(enhancedError, fallbackMessage);

    // Show alert if requested
    if (showAlert) {
      this.showErrorAlert(enhancedError, userMessage);
    }

    return {
      error: enhancedError,
      userMessage,
      handled: true
    };
  }

  /**
   * Enhance regular errors with additional context
   * @param {Error} error - Original error
   * @returns {AppError} Enhanced error
   */
  enhanceError(error) {
    if (error instanceof AppError) {
      return error;
    }

    // Determine error type based on message content
    let type = ERROR_TYPES.UNKNOWN;
    let severity = ERROR_SEVERITY.MEDIUM;

    if (error.message.includes('storage') || error.message.includes('AsyncStorage')) {
      type = ERROR_TYPES.STORAGE;
      severity = ERROR_SEVERITY.HIGH;
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      type = ERROR_TYPES.NETWORK;
      severity = ERROR_SEVERITY.MEDIUM;
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      type = ERROR_TYPES.VALIDATION;
      severity = ERROR_SEVERITY.LOW;
    } else if (error.message.includes('API') || error.message.includes('server')) {
      type = ERROR_TYPES.API;
      severity = ERROR_SEVERITY.MEDIUM;
    } else if (error.message.includes('permission')) {
      type = ERROR_TYPES.PERMISSION;
      severity = ERROR_SEVERITY.HIGH;
    }

    return new AppError(error.message, type, severity, {
      originalError: error,
      stack: error.stack
    });
  }

  /**
   * Log error to internal log and console
   * @param {AppError} error - Error to log
   */
  logError(error) {
    // Add to internal log
    this.errorLog.push({
      timestamp: error.timestamp,
      message: error.message,
      type: error.type,
      severity: error.severity,
      context: error.context
    });

    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Console logging based on severity
    const logMethod = this.getLogMethod(error.severity);
    logMethod(`[${error.type.toUpperCase()}] ${error.message}`, {
      severity: error.severity,
      context: error.context,
      timestamp: error.timestamp
    });
  }

  /**
   * Get appropriate console log method based on severity
   * @param {string} severity - Error severity
   * @returns {Function} Console log method
   */
  getLogMethod(severity) {
    switch (severity) {
      case ERROR_SEVERITY.LOW:
        return console.info;
      case ERROR_SEVERITY.MEDIUM:
        return console.warn;
      case ERROR_SEVERITY.HIGH:
      case ERROR_SEVERITY.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Get user-friendly error message
   * @param {AppError} error - Error object
   * @param {string} fallback - Fallback message
   * @returns {string} User-friendly message
   */
  getUserFriendlyMessage(error, fallback) {
    const messageMap = {
      [ERROR_TYPES.STORAGE]: 'There was a problem saving your data. Please check your device storage and try again.',
      [ERROR_TYPES.NETWORK]: 'Network connection issue. Please check your internet connection and try again.',
      [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
      [ERROR_TYPES.API]: 'Service temporarily unavailable. Please try again later.',
      [ERROR_TYPES.PERMISSION]: 'Permission required. Please check app permissions in your device settings.',
      [ERROR_TYPES.UNKNOWN]: fallback
    };

    return messageMap[error.type] || fallback;
  }

  /**
   * Show error alert to user
   * @param {AppError} error - Error object
   * @param {string} message - User message
   */
  showErrorAlert(error, message) {
    const title = this.getAlertTitle(error.severity);
    
    const buttons = [
      { text: 'OK', style: 'default' }
    ];

    // Add retry button for certain error types
    if ([ERROR_TYPES.NETWORK, ERROR_TYPES.API, ERROR_TYPES.STORAGE].includes(error.type)) {
      buttons.push({
        text: 'Retry',
        style: 'default',
        onPress: () => {
          // Emit retry event that components can listen to
          this.emitRetryEvent(error);
        }
      });
    }

    Alert.alert(title, message, buttons);
  }

  /**
   * Get alert title based on severity
   * @param {string} severity - Error severity
   * @returns {string} Alert title
   */
  getAlertTitle(severity) {
    switch (severity) {
      case ERROR_SEVERITY.LOW:
        return 'Notice';
      case ERROR_SEVERITY.MEDIUM:
        return 'Warning';
      case ERROR_SEVERITY.HIGH:
        return 'Error';
      case ERROR_SEVERITY.CRITICAL:
        return 'Critical Error';
      default:
        return 'Error';
    }
  }

  /**
   * Emit retry event for error recovery
   * @param {AppError} error - Error that triggered retry
   */
  emitRetryEvent(error) {
    console.log('Retry requested for error:', error.type);
    // In a real app, you might use an event emitter or state management
    // to notify components about retry requests
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      bySeverity: {},
      recent: this.errorLog.slice(-10)
    };

    this.errorLog.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
    console.log('Error log cleared');
  }

  /**
   * Export error log for debugging
   * @returns {Array} Error log
   */
  exportErrorLog() {
    return [...this.errorLog];
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

/**
 * Convenience function for handling errors
 * @param {Error} error - Error to handle
 * @param {Object} options - Handling options
 * @returns {Object} Error handling result
 */
export const handleError = (error, options = {}) => {
  return errorHandler.handleError(error, options);
};

/**
 * Create an app error with context
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {string} severity - Error severity
 * @param {Object} context - Additional context
 * @returns {AppError} Created error
 */
export const createError = (message, type, severity, context) => {
  return new AppError(message, type, severity, context);
};

/**
 * Handle async operations with error handling
 * @param {Function} operation - Async operation to execute
 * @param {Object} errorOptions - Error handling options
 * @returns {Promise<Object>} Operation result with error handling
 */
export const withErrorHandling = async (operation, errorOptions = {}) => {
  try {
    const result = await operation();
    return { success: true, data: result, error: null };
  } catch (error) {
    const handledError = handleError(error, errorOptions);
    return { success: false, data: null, error: handledError.error };
  }
};

export default errorHandler;