import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows
} from '../styles/globalStyles';

/**
 * Achievement Badge Component
 * Displays individual achievement badges with unlock status
 */
const AchievementBadge = ({
  achievement,
  isUnlocked = false,
  progress = null,
  size = 'medium',
  onPress = null,
  style,
  testID,
  ...props
}) => {
  const sizeStyles = getSizeStyles(size);
  
  const handlePress = () => {
    if (onPress) {
      onPress(achievement);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        sizeStyles.container,
        isUnlocked ? styles.unlocked : styles.locked,
        style
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={!onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${achievement.title} achievement`}
      accessibilityHint={isUnlocked ? 'Unlocked' : `Progress: ${progress?.progressPercentage || 0}%`}
      {...props}
    >
      {/* Badge Icon */}
      <View style={[styles.iconContainer, sizeStyles.iconContainer]}>
        <Text style={[styles.icon, sizeStyles.icon]}>
          {achievement.icon}
        </Text>
        
        {/* Unlock overlay effect */}
        {isUnlocked && (
          <View style={[styles.unlockOverlay, sizeStyles.iconContainer]} />
        )}
      </View>

      {/* Badge Info */}
      <View style={styles.infoContainer}>
        <Text
          style={[
            styles.title,
            sizeStyles.title,
            isUnlocked ? styles.unlockedText : styles.lockedText
          ]}
          numberOfLines={1}
        >
          {achievement.title}
        </Text>
        
        <Text
          style={[
            styles.description,
            sizeStyles.description,
            isUnlocked ? styles.unlockedDescription : styles.lockedDescription
          ]}
          numberOfLines={2}
        >
          {achievement.description}
        </Text>

        {/* Progress bar for locked achievements */}
        {!isUnlocked && progress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress.progressPercentage}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progress.currentValue}/{progress.targetValue}
            </Text>
          </View>
        )}
      </View>

      {/* Category indicator */}
      <View style={[styles.categoryIndicator, getCategoryColor(achievement.category)]}>
        <Text style={styles.categoryText}>
          {getCategoryIcon(achievement.category)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Get size-specific styles
 */
const getSizeStyles = (size) => {
  switch (size) {
    case 'small':
      return {
        container: { minHeight: 60, paddingVertical: spacing.xs },
        iconContainer: { width: 40, height: 40 },
        icon: { fontSize: 20 },
        title: { fontSize: 14 },
        description: { fontSize: 11 }
      };
    case 'large':
      return {
        container: { minHeight: 100, paddingVertical: spacing.md },
        iconContainer: { width: 60, height: 60 },
        icon: { fontSize: 30 },
        title: { fontSize: 18 },
        description: { fontSize: 14 }
      };
    default: // medium
      return {
        container: { minHeight: 80, paddingVertical: spacing.sm },
        iconContainer: { width: 50, height: 50 },
        icon: { fontSize: 24 },
        title: { fontSize: 16 },
        description: { fontSize: 12 }
      };
  }
};

/**
 * Get category color
 */
const getCategoryColor = (category) => {
  switch (category) {
    case 'streak':
      return { backgroundColor: colors.secondary };
    case 'performance':
      return { backgroundColor: colors.success };
    case 'timing':
      return { backgroundColor: colors.warning };
    case 'milestone':
    default:
      return { backgroundColor: colors.primary };
  }
};

/**
 * Get category icon
 */
const getCategoryIcon = (category) => {
  switch (category) {
    case 'streak':
      return '🔥';
    case 'performance':
      return '⭐';
    case 'timing':
      return '⏰';
    case 'milestone':
    default:
      return '🎯';
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    ...shadows.small,
  },
  
  unlocked: {
    borderWidth: 2,
    borderColor: colors.success,
    backgroundColor: colors.cardBackground,
  },
  
  locked: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
    opacity: 0.7,
  },
  
  iconContainer: {
    borderRadius: 25,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    position: 'relative',
  },
  
  icon: {
    textAlign: 'center',
  },
  
  unlockOverlay: {
    position: 'absolute',
    backgroundColor: colors.success + '20',
    borderRadius: 25,
  },
  
  infoContainer: {
    flex: 1,
  },
  
  title: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  
  description: {
    ...typography.caption,
    lineHeight: 16,
  },
  
  unlockedText: {
    color: colors.text,
  },
  
  lockedText: {
    color: colors.textSecondary,
  },
  
  unlockedDescription: {
    color: colors.textSecondary,
  },
  
  lockedDescription: {
    color: colors.textSecondary,
    opacity: 0.7,
  },
  
  progressContainer: {
    marginTop: spacing.xs,
  },
  
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: spacing.xs / 2,
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  
  categoryIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  
  categoryText: {
    fontSize: 12,
  },
});

export default AchievementBadge;