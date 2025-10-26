import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { colors, typography, commonStyles } from './src/styles/globalStyles';
import { initializeAppWithDummyData } from './src/utils/dummyData';
import networkStatusManager from './src/utils/networkStatus';
import appStateManager from './src/utils/appStateManager';
import { showNetworkStatusFeedback } from './src/utils/toastNotifications';



// App Initialization Hook
const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Starting app initialization...');
        
        // Initialize network status monitoring
        networkStatusManager.initialize();
        
        // Initialize app with dummy data on first launch
        const dummyDataSuccess = await initializeAppWithDummyData();
        
        if (!dummyDataSuccess) {
          console.warn('Dummy data initialization failed, but continuing with app startup');
        }
        
        // Load initial habits into app state manager
        await appStateManager.loadHabits({ showLoading: false, silent: true });
        
        // Check network connectivity
        const isOnline = await networkStatusManager.checkConnection();
        appStateManager.setOnlineStatus(isOnline);
        
        // Show network status feedback if offline
        if (!isOnline) {
          showNetworkStatusFeedback(isOnline);
        }
        
        // Simulate initialization delay for smooth UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mark app as initialized
        setIsInitialized(true);
        console.log('App initialization completed successfully');
      } catch (error) {
        console.error('App initialization failed:', error);
        setInitError(error);
        setIsInitialized(true); // Still allow app to load with error state
      }
    };

    initializeApp();
    
    // Cleanup function
    return () => {
      networkStatusManager.cleanup();
    };
  }, []);

  return { isInitialized, initError };
};

// Loading Screen Component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Initializing...</Text>
  </View>
);

// Main App Component
export default function App() {
  const { isInitialized, initError } = useAppInitialization();

  // Show loading screen during initialization
  if (!isInitialized) {
    return (
      <>
        <LoadingScreen />
        <StatusBar style="light" />
      </>
    );
  }

  // Log initialization error but continue with app
  if (initError) {
    console.warn('App initialized with errors:', initError);
  }

  return (
    <ErrorBoundary onRestart={() => setIsInitialized(false)}>
      <AppNavigator />
      <StatusBar style="light" />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    ...commonStyles.centerContent,
  },
  loadingText: {
    ...typography.body,
    color: colors.cardBackground,
  },
});
