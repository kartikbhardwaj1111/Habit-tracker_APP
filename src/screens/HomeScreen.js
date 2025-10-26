import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  colors,
  typography,
  spacing,
  commonStyles,
  componentStyles
} from '../styles/globalStyles';
import Header from '../components/Header';
import HabitCard from '../components/HabitCard';
import Button from '../components/Button';
import { InlineLoading } from '../components/LoadingIndicator';
import { getHabits, updateHabitCompletion, recalculateAllHabitsProgress } from '../utils/storage';
import { calculateCompletionPercentage, getProgressInsights } from '../utils/progressCalculations';
import { 
  showErrorToast, 
  showHabitCompletionFeedback,
  showLoadingFeedback 
} from '../utils/toastNotifications';
import { checkAchievements } from '../utils/achievementSystem';
import { getUserAchievements, unlockAchievement } from '../utils/storage';

const HomeScreen = ({ navigation }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load habits from storage with progress recalculation
  const loadHabits = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      // Recalculate progress to ensure data consistency
      await recalculateAllHabitsProgress();
      
      const storedHabits = await getHabits();
      setHabits(storedHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
      showErrorToast('Failed to load habits. Please pull to refresh and try again.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Load habits when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadHabits(false);
    setRefreshing(false);
  };

  // Handle habit completion toggle
  const handleToggleComplete = async (habitId) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) {
        showErrorToast('Habit not found. Please refresh and try again.');
        return;
      }

      const newCompletionStatus = !habit.isCompleted;
      
      // Update local state immediately for better UX with optimistic update
      setHabits(prevHabits =>
        prevHabits.map(h =>
          h.id === habitId
            ? { 
                ...h, 
                isCompleted: newCompletionStatus,
                // Optimistically update progress calculations
                completedDays: newCompletionStatus 
                  ? h.completedDays + (h.isCompleted ? 0 : 1)
                  : h.completedDays - (h.isCompleted ? 1 : 0)
              }
            : h
        )
      );

      // Update habit completion status in AsyncStorage
      const success = await updateHabitCompletion(habitId, newCompletionStatus);
      
      if (success) {
        // Reload habits to get accurate updated progress data and calculations
        await loadHabits(false);
        
        // Check for new achievements
        if (newCompletionStatus) {
          const updatedHabits = await getHabits();
          const currentAchievements = await getUserAchievements();
          const achievementResult = checkAchievements(updatedHabits, currentAchievements);
          
          // Unlock new achievements
          for (const newAchievement of achievementResult.newAchievements) {
            await unlockAchievement(newAchievement.id);
            
            // Show achievement notification
            setTimeout(() => {
              Alert.alert(
                '🏆 Achievement Unlocked!',
                `${newAchievement.icon} ${newAchievement.title}\n${newAchievement.description}`,
                [{ text: 'Awesome!', style: 'default' }]
              );
            }, 500);
          }
          
          const updatedHabit = habits.find(h => h.id === habitId);
          const completionRate = calculateCompletionPercentage(updatedHabit);
          
          // Show encouraging toast feedback
          showHabitCompletionFeedback(habit, newCompletionStatus, completionRate);
        }
      } else {
        // Revert optimistic update on failure
        setHabits(prevHabits =>
          prevHabits.map(h =>
            h.id === habitId
              ? { ...h, isCompleted: habit.isCompleted }
              : h
          )
        );
        showErrorToast('Failed to update habit. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      
      // Revert optimistic update on error
      const originalHabit = habits.find(h => h.id === habitId);
      if (originalHabit) {
        setHabits(prevHabits =>
          prevHabits.map(h =>
            h.id === habitId
              ? { ...h, isCompleted: originalHabit.isCompleted }
              : h
          )
        );
      }
      
      showErrorToast('Failed to update habit. Please check your connection and try again.');
    }
  };

  // Navigate to Add Habit screen
  const handleAddHabit = () => {
    navigation.navigate('AddHabit');
  };

  // Navigate to Insights screen
  const handleViewInsights = () => {
    navigation.navigate('Insights');
  };

  // Navigate to Achievements screen
  const handleViewAchievements = () => {
    navigation.navigate('Achievements');
  };

  // Render individual habit item
  const renderHabitItem = ({ item, index }) => (
    <HabitCard
      habit={item}
      onToggleComplete={handleToggleComplete}
      testID={`habit-card-${index}`}
    />
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="checkmark-circle-outline"
        size={64}
        color={colors.textSecondary}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No Habits Yet</Text>
      <Text style={styles.emptyDescription}>
        Start building better habits by creating your first habit tracker.
      </Text>
      <Button
        title="Create Your First Habit"
        onPress={handleAddHabit}
        style={styles.emptyStateButton}
        testID="empty-state-add-button"
      />
    </View>
  );

  // Render loading state
  const renderLoadingState = () => (
    <InlineLoading 
      message="Loading your habits..."
      testID="home-loading"
    />
  );

  // Header right component with insights and achievements buttons
  const headerRightComponent = (
    <View style={styles.headerButtons}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={handleViewAchievements}
        activeOpacity={0.7}
        testID="achievements-button"
        accessibilityLabel="View achievements"
        accessibilityRole="button"
      >
        <Ionicons
          name="trophy-outline"
          size={24}
          color={colors.primary}
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.headerButton}
        onPress={handleViewInsights}
        activeOpacity={0.7}
        testID="insights-button"
        accessibilityLabel="View AI insights"
        accessibilityRole="button"
      >
        <Ionicons
          name="bulb-outline"
          size={24}
          color={colors.primary}
        />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="My Habits"
          rightComponent={headerRightComponent}
          testID="home-header"
        />
        {renderLoadingState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="My Habits"
        rightComponent={headerRightComponent}
        testID="home-header"
      />
      
      <View style={styles.content}>
        {habits.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Habits list */}
            <FlatList
              data={habits}
              renderItem={renderHabitItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
              testID="habits-list"
            />
            
            {/* Floating action button */}
            <Button
              variant="floating"
              onPress={handleAddHabit}
              style={styles.fab}
              testID="add-habit-fab"
              accessibilityLabel="Add new habit"
            >
              <Ionicons
                name="add"
                size={28}
                color={colors.cardBackground}
              />
            </Button>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  content: {
    flex: 1,
  },
  
  listContainer: {
    paddingVertical: spacing.sm,
    paddingBottom: 100, // Space for FAB
  },
  
  // Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  emptyDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  
  emptyStateButton: {
    minWidth: 200,
  },
  
  // Loading state styles
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Header components
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  // Floating action button
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    ...componentStyles.button.floating,
  },
});

export default HomeScreen;