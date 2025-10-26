// Network status monitoring utilities

import React from 'react';

/**
 * Simple network status manager for handling online/offline states
 * Note: This is a simplified version that assumes online status
 * In a production app, you would integrate with @react-native-community/netinfo
 */
class NetworkStatusManager {
  constructor() {
    this.isOnline = true; // Assume online by default
    this.listeners = new Set();
  }

  /**
   * Initialize network status monitoring
   * In a real implementation, this would set up NetInfo listeners
   */
  initialize() {
    console.log('Network status manager initialized (simplified version)');
    // In production, you would set up NetInfo listeners here
  }

  /**
   * Clean up network monitoring
   */
  cleanup() {
    console.log('Network status manager cleaned up');
  }

  /**
   * Subscribe to network status changes
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of network status changes
   * @param {boolean} isOnline - Current online status
   */
  notifyListeners(isOnline) {
    this.listeners.forEach(listener => listener(isOnline));
  }

  /**
   * Get current network status
   * @returns {boolean} Current online status
   */
  getStatus() {
    return this.isOnline;
  }

  /**
   * Simulate network status change (for testing)
   * @param {boolean} isOnline - New online status
   */
  setStatus(isOnline) {
    if (this.isOnline !== isOnline) {
      this.isOnline = isOnline;
      this.notifyListeners(isOnline);
      console.log(`Network status changed: ${isOnline ? 'Online' : 'Offline'}`);
    }
  }

  /**
   * Check if device is currently online
   * @returns {Promise<boolean>} Online status
   */
  async checkConnection() {
    try {
      // Simple connectivity check using fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      this.isOnline = true;
      return true;
    } catch (error) {
      console.log('Network check failed, assuming offline:', error.message);
      this.isOnline = false;
      return false;
    }
  }
}

// Create singleton instance
const networkStatusManager = new NetworkStatusManager();

// React hook for using network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(networkStatusManager.getStatus());

  React.useEffect(() => {
    const unsubscribe = networkStatusManager.subscribe(setIsOnline);
    return unsubscribe;
  }, []);

  return {
    isOnline,
    checkConnection: networkStatusManager.checkConnection.bind(networkStatusManager)
  };
};

export default networkStatusManager;