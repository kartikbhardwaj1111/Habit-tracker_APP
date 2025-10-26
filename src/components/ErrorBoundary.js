import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  commonStyles,
  componentStyles
} from '../styles/globalStyles';
import Button from './Button';

/**
 * Enhanced Error Boundary component for catching and displaying errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      hasError: true
    });

    // In a real app, you might want to log this to a crash reporting service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // Placeholder for error logging service
    // In production, you might use services like Sentry, Bugsnag, etc.
    console.log('Logging error to service:', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount
    });
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleRestart = () => {
    // In a real app, you might want to restart the app or navigate to home
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
    
    // If onRestart prop is provided, call it
    if (this.props.onRestart) {
      this.props.onRestart();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      const { fallback: CustomFallback } = this.props;
      
      if (CustomFallback) {
        return (
          <CustomFallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onRestart={this.handleRestart}
            retryCount={this.state.retryCount}
          />
        );
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Ionicons
              name="alert-circle-outline"
              size={64}
              color={colors.secondary}
              style={styles.icon}
            />
            
            <Text style={styles.title}>Oops! Something went wrong</Text>
            
            <Text style={styles.message}>
              The app encountered an unexpected error. Don't worry, your data is safe.
            </Text>

            {this.state.retryCount > 0 && (
              <Text style={styles.retryInfo}>
                Retry attempts: {this.state.retryCount}
              </Text>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title="Try Again"
                onPress={this.handleRetry}
                style={styles.retryButton}
                testID="error-retry-button"
              />
              
              <Button
                title="Restart App"
                onPress={this.handleRestart}
                variant="secondary"
                style={styles.restartButton}
                testID="error-restart-button"
              />
            </View>

            {__DEV__ && this.state.error && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text style={styles.debugText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.debugText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Simple error fallback component
 */
export const SimpleErrorFallback = ({ 
  error, 
  onRetry, 
  message = "Something went wrong" 
}) => (
  <View style={styles.simpleContainer}>
    <Text style={styles.simpleMessage}>{message}</Text>
    <TouchableOpacity onPress={onRetry} style={styles.simpleButton}>
      <Text style={styles.simpleButtonText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

/**
 * Network error fallback component
 */
export const NetworkErrorFallback = ({ onRetry }) => (
  <View style={styles.container}>
    <View style={styles.content}>
      <Ionicons
        name="wifi-outline"
        size={64}
        color={colors.textSecondary}
        style={styles.icon}
      />
      <Text style={styles.title}>Connection Problem</Text>
      <Text style={styles.message}>
        Please check your internet connection and try again.
      </Text>
      <Button
        title="Retry"
        onPress={onRetry}
        style={styles.retryButton}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    ...commonStyles.centerContent,
  },
  
  content: {
    ...commonStyles.centerContent,
    paddingHorizontal: spacing.xl,
    maxWidth: 400,
  },
  
  icon: {
    marginBottom: spacing.lg,
  },
  
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  
  retryInfo: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  
  buttonContainer: {
    width: '100%',
    gap: spacing.sm,
  },
  
  retryButton: {
    marginBottom: spacing.sm,
  },
  
  restartButton: {
    // Additional styles if needed
  },
  
  debugInfo: {
    ...componentStyles.card,
    marginTop: spacing.lg,
    backgroundColor: colors.secondary + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  
  debugTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  
  debugText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 16,
  },
  
  // Simple fallback styles
  simpleContainer: {
    ...commonStyles.centerContent,
    padding: spacing.lg,
  },
  
  simpleMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  
  simpleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  
  simpleButtonText: {
    ...typography.body,
    color: colors.cardBackground,
    fontWeight: '600',
  },
});

export default ErrorBoundary;