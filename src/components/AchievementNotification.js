import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows
} from '../styles/globalStyles';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Achievement Notification Component
 * Shows animated notification when user unlocks an achievement
 */
const AchievementNotification = ({
  achievement,
  visible = false,
  onPress = null,
  onDismiss = null,
  duration = 4000,
  style,
  testID
}) => {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideNotification();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideNotification();
    }
  }, [visible, duration]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  const handlePress = () => {
    if (onPress) {
      onPress(achievement);
    }
    hideNotification();
  };

  if (!achievement) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
          opacity: opacityAnim,
        },
        style
      ]}
      testID={testID}
    >
      <TouchableOpacity
        style={styles.notification}
        onPress={handlePress}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`Achievement unlocked: ${achievement.title}`}
      >
        {/* Trophy Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name="trophy"
            size={24}
            color={colors.warning}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Achievement Unlocked!</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={hideNotification}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.achievementInfo}>
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            <View style={styles.achievementText}>
              <Text style={styles.achievementTitle} numberOfLines={1}>
                {achievement.title}
              </Text>
              <Text style={styles.achievementDescription} numberOfLines={2}>
                {achievement.description}
              </Text>
            </View>
          </View>
        </View>

        {/* Celebration Effect */}
        <View style={styles.celebrationContainer}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationEmoji}>✨</Text>
          <Text style={styles.celebrationEmoji}>🎊</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Simple Achievement Toast (Alternative simpler version)
 */
export const AchievementToast = ({
  achievement,
  visible = false,
  onDismiss = null,
  duration = 3000
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      if (duration > 0) {
        const timer = setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            if (onDismiss) onDismiss();
          });
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration]);

  if (!achievement) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.toast}>
        <Text style={styles.toastIcon}>{achievement.icon}</Text>
        <View style={styles.toastContent}>
          <Text style={styles.toastTitle}>{achievement.title}</Text>
          <Text style={styles.toastDescription} numberOfLines={1}>
            {achievement.description}
          </Text>
        </View>
        <Ionicons name="trophy" size={16} color={colors.warning} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Below status bar
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  
  notification: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    ...shadows.medium,
    borderWidth: 2,
    borderColor: colors.success,
  },
  
  iconContainer: {
    position: 'absolute',
    top: -12,
    left: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  
  content: {
    marginTop: spacing.sm,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  title: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.success,
  },
  
  closeButton: {
    padding: spacing.xs,
  },
  
  achievementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  achievementIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  
  achievementText: {
    flex: 1,
  },
  
  achievementTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  
  achievementDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  
  celebrationContainer: {
    position: 'absolute',
    top: -8,
    right: spacing.md,
    flexDirection: 'row',
  },
  
  celebrationEmoji: {
    fontSize: 16,
    marginLeft: spacing.xs,
  },
  
  // Toast styles
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    ...shadows.small,
  },
  
  toastIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  
  toastContent: {
    flex: 1,
  },
  
  toastTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.cardBackground,
  },
  
  toastDescription: {
    ...typography.caption,
    color: colors.cardBackground,
    opacity: 0.9,
  },
});

export default AchievementNotification;