import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated
} from 'react-native';
import {
  colors,
  typography,
  spacing
} from '../styles/globalStyles';

/**
 * Animated Progress Ring Component
 * Shows circular progress with percentage and label
 */
const ProgressRing = ({
  progress = 0, // 0-100
  size = 120,
  strokeWidth = 8,
  color = colors.primary,
  backgroundColor = colors.border,
  label = '',
  showPercentage = true,
  animated = true,
  duration = 1000,
  style,
  testID,
  ...props
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const circleRef = useRef();
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  
  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [progress, animated, duration]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  const animatedPercentage = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [0, progress],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
        style
      ]}
      testID={testID}
      {...props}
    >
      {/* Background Circle */}
      <View style={styles.svgContainer}>
        <View
          style={[
            styles.backgroundCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor,
            }
          ]}
        />
        
        {/* Progress Circle */}
        <Animated.View
          ref={circleRef}
          style={[
            styles.progressCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              transform: [{ rotate: '-90deg' }],
            }
          ]}
        />
      </View>

      {/* Center Content */}
      <View style={styles.centerContent}>
        {showPercentage && (
          <Animated.Text style={[styles.percentage, getPercentageSize(size)]}>
            {animatedPercentage.interpolate({
              inputRange: [0, 100],
              outputRange: [0, Math.round(progress)],
              extrapolate: 'clamp',
            })}%
          </Animated.Text>
        )}
        
        {label && (
          <Text style={[styles.label, getLabelSize(size)]} numberOfLines={2}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
};

/**
 * Get percentage text size based on ring size
 */
const getPercentageSize = (size) => {
  if (size >= 150) {
    return { fontSize: 24, fontWeight: 'bold' };
  } else if (size >= 100) {
    return { fontSize: 18, fontWeight: '600' };
  } else {
    return { fontSize: 14, fontWeight: '600' };
  }
};

/**
 * Get label text size based on ring size
 */
const getLabelSize = (size) => {
  if (size >= 150) {
    return { fontSize: 14 };
  } else if (size >= 100) {
    return { fontSize: 12 };
  } else {
    return { fontSize: 10 };
  }
};

/**
 * Simple Progress Ring without animation (for better performance in lists)
 */
export const SimpleProgressRing = ({
  progress = 0,
  size = 60,
  strokeWidth = 6,
  color = colors.primary,
  backgroundColor = colors.border,
  showPercentage = true,
  style,
  testID
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
        style
      ]}
      testID={testID}
    >
      {/* Background Circle */}
      <View
        style={[
          styles.backgroundCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          }
        ]}
      />
      
      {/* Progress Circle - Simplified */}
      <View
        style={[
          styles.progressCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: progress > 0 ? color : 'transparent',
            transform: [{ rotate: '-90deg' }],
          }
        ]}
      />

      {/* Center Content */}
      <View style={styles.centerContent}>
        {showPercentage && (
          <Text style={[styles.percentage, getPercentageSize(size)]}>
            {Math.round(progress)}%
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  backgroundCircle: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  
  progressCircle: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  
  percentage: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
  
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs / 2,
  },
});

export default ProgressRing;