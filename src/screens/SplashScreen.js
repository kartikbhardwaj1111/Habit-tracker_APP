import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { colors, typography, spacing, animations, commonStyles } from '../styles/globalStyles';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start fade-in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animations.slow.duration,
        useNativeDriver: animations.slow.useNativeDriver,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: animations.spring.tension,
        friction: animations.spring.friction,
        useNativeDriver: animations.spring.useNativeDriver,
      }),
    ]).start();

    // Navigate to HomeScreen after delay
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* App Logo/Icon placeholder */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🎯</Text>
          </View>
        </View>
        
        <Text style={styles.title}>AI Habit Tracker</Text>
        <Text style={styles.subtitle}>Building better habits with AI</Text>
        
        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
            <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
            <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    ...commonStyles.centerContent,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    ...commonStyles.centerContent,
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    ...typography.h1,
    color: colors.cardBackground,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.cardBackground,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loadingContainer: {
    marginTop: spacing.lg,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.xs,
  },
});

export default SplashScreen;