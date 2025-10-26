import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors,
  componentStyles,
  typography,
  spacing,
  borderRadius,
  animations
} from '../styles/globalStyles';
import { 
  calculateCompletionPercentage, 
  getProgressColor,
  calculateStreak 
} from '../utils/progressCalculations';

const { width: screenWidth } = Dimensions.get('window');

/**
 * HabitCard component for displaying individual habit information
 * Shows habit name, progress bar, and completion toggle
 * Handles progress calculation and visual feedback
 */
const HabitCard = ({
  habit,
  onToggleComplete,
  style,
  testID,
  accessibilityLabel,
  ...props
}) => {
  const [progressAnimation] = useState(new Animated.Value(0));
  const [scaleAnimation] = useState(new Animated.Value(1));

  // Calculate progress percentage using utility function
  const progressPercentage = calculateCompletionPercentage(habit);
  
  // Calculate streak information
  const { currentStreak } = calculateStreak(habit.completionHistory || []);

  // Animate progress bar when progress changes
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: progressPercentage / 100,
      duration: animations.progress.duration,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage, progressAnimation]);

  // Enhanced animation for completion status changes
  useEffect(() => {
    if (habit.isCompleted) {
      // Subtle pulse animation when completed
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 1.02,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [habit.isCompleted, scaleAnimation]);

  // Handle completion toggle with visual feedback
  const handleToggleComplete = () => {
    if (!onToggleComplete || !habit.id) return;

    // Scale animation for visual feedback
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: animations.fast.duration,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: animations.fast.duration,
        useNativeDriver: true,
      }),
    ]).start();

    // Call the toggle callback
    onToggleComplete(habit.id);
  };

  // Get completion icon based on status
  const getCompletionIcon = () => {
    return habit.isCompleted ? 'checkmark-circle' : 'ellipse-outline';
  };

  // Get completion icon color
  const getCompletionIconColor = () => {
    return habit.isCompleted ? colors.success : colors.border;
  };

  // Format frequency display
  const getFrequencyText = () => {
    const frequency = habit.frequency || 'daily';
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  // Get progress color using utility function
  const progressColor = getProgressColor(progressPercentage);

  // Calculate progress bar width with smooth interpolation
  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  // Create color interpolation for smooth progress color transitions
  const progressColorInterpolated = progressAnimation.interpolate({
    inputRange: [0, 0.5, 0.8, 1],
    outputRange: [colors.secondary, colors.secondary, colors.warning, colors.success],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleAnimation }] },
        style
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || `${habit.name} habit card`}
      {...props}
    >
      {/* Main content area */}
      <View style={styles.content}>
        {/* Habit name and frequency */}
        <View style={styles.header}>
          <Text
            style={styles.habitName}
            numberOfLines={2}
            ellipsizeMode="tail"
            testID={`${testID}-name`}
            accessibilityRole="text"
          >
            {habit.name}
          </Text>
          <Text
            style={styles.frequency}
            testID={`${testID}-frequency`}
            accessibilityRole="text"
          >
            {getFrequencyText()}
          </Text>
        </View>

        {/* Progress section */}
        <View style={styles.progressSection}>
          {/* Progress bar container */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressWidth,
                    backgroundColor: progressColorInterpolated,
                  }
                ]}
              />
              {/* Gradient overlay for progress bar */}
              <LinearGradient
                colors={colors.gradients.progress}
                style={[
                  StyleSheet.absoluteFillObject,
                  { borderRadius: borderRadius.small }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

          {/* Progress text */}
          <Text
            style={styles.progressText}
            testID={`${testID}-progress`}
            accessibilityRole="text"
            accessibilityLabel={`Progress: ${progressPercentage} percent`}
          >
            {progressPercentage}%
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            {habit.completedDays} of {habit.totalDays} days
          </Text>
          {currentStreak > 0 && (
            <Text style={styles.streakText}>
              🔥 {currentStreak} day streak
            </Text>
          )}
          {habit.targetTime && !currentStreak && (
            <Text style={styles.targetTime}>
              Target: {habit.targetTime}
            </Text>
          )}
        </View>
      </View>

      {/* Completion toggle button */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={handleToggleComplete}
        activeOpacity={0.7}
        testID={`${testID}-toggle`}
        accessibilityRole="button"
        accessibilityLabel={
          habit.isCompleted 
            ? `Mark ${habit.name} as incomplete` 
            : `Mark ${habit.name} as complete`
        }
        accessibilityHint="Double tap to toggle completion status"
        accessibilityState={{ checked: habit.isCompleted }}
      >
        <Ionicons
          name={getCompletionIcon()}
          size={32}
          color={getCompletionIconColor()}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...componentStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingVertical: spacing.md,
  },
  
  content: {
    flex: 1,
    marginRight: spacing.md,
  },
  
  header: {
    marginBottom: spacing.sm,
  },
  
  habitName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  
  frequency: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  
  progressSection: {
    marginBottom: spacing.sm,
  },
  
  progressBarContainer: {
    marginBottom: spacing.xs,
  },
  
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.small,
    overflow: 'hidden',
  },
  
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.small,
    minWidth: 2,
  },
  
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    fontWeight: '600',
  },
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  statsText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  targetTime: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  
  streakText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  
  toggleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default HabitCard;