import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity
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
import AchievementBadge from '../components/AchievementBadge';
import ProgressRing from '../components/ProgressRing';
import { InlineLoading } from '../components/LoadingIndicator';
import { getHabits, getUserAchievements } from '../utils/storage';
import { 
  checkAchievements, 
  getAchievementProgress,
  ACHIEVEMENTS,
  calculateUserStats
} from '../utils/achievementSystem';

const AchievementsScreen = ({ navigation }) => {
  const [habits, setHabits] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [achievementProgress, setAchievementProgress] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load achievements data
  const loadAchievements = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      // Load habits and current achievements
      const [habitsData, achievementsData] = await Promise.all([
        getHabits(),
        getUserAchievements()
      ]);

      setHabits(habitsData);
      setUnlockedAchievements(achievementsData);

      // Calculate user stats and achievement progress
      const stats = calculateUserStats(habitsData);
      setUserStats(stats);

      const progress = getAchievementProgress(habitsData, achievementsData);
      setAchievementProgress(progress);

    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Load achievements when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadAchievements();
    }, [])
  );

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAchievements(false);
    setRefreshing(false);
  };

  // Filter achievements by category
  const getFilteredAchievements = () => {
    const allAchievements = Object.values(ACHIEVEMENTS);
    
    if (selectedCategory === 'all') {
      return allAchievements;
    }
    
    if (selectedCategory === 'unlocked') {
      return allAchievements.filter(achievement => 
        unlockedAchievements.includes(achievement.id)
      );
    }
    
    if (selectedCategory === 'locked') {
      return allAchievements.filter(achievement => 
        !unlockedAchievements.includes(achievement.id)
      );
    }
    
    return allAchievements.filter(achievement => 
      achievement.category === selectedCategory
    );
  };

  // Get progress for specific achievement
  const getProgressForAchievement = (achievementId) => {
    return achievementProgress.find(p => p.achievement.id === achievementId);
  };

  // Render category filter buttons
  const renderCategoryFilters = () => {
    const categories = [
      { key: 'all', label: 'All', icon: '🏆' },
      { key: 'unlocked', label: 'Unlocked', icon: '✅' },
      { key: 'locked', label: 'Locked', icon: '🔒' },
      { key: 'streak', label: 'Streaks', icon: '🔥' },
      { key: 'performance', label: 'Performance', icon: '⭐' },
      { key: 'milestone', label: 'Milestones', icon: '🎯' },
      { key: 'timing', label: 'Timing', icon: '⏰' }
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilters}
        contentContainerStyle={styles.categoryFiltersContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              selectedCategory === category.key && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === category.key && styles.categoryLabelActive
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Render stats overview
  const renderStatsOverview = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <ProgressRing
          progress={userStats.overallCompletionRate || 0}
          size={80}
          label="Overall"
          color={colors.primary}
        />
        <ProgressRing
          progress={Math.min((userStats.longestStreak || 0) / 30 * 100, 100)}
          size={80}
          label="Streak"
          color={colors.secondary}
        />
        <ProgressRing
          progress={Math.min((unlockedAchievements.length / Object.keys(ACHIEVEMENTS).length) * 100, 100)}
          size={80}
          label="Badges"
          color={colors.success}
        />
      </View>
      
      <View style={styles.quickStats}>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatValue}>{userStats.totalCompletions || 0}</Text>
          <Text style={styles.quickStatLabel}>Total Completions</Text>
        </View>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatValue}>{userStats.longestStreak || 0}</Text>
          <Text style={styles.quickStatLabel}>Longest Streak</Text>
        </View>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatValue}>{unlockedAchievements.length}</Text>
          <Text style={styles.quickStatLabel}>Badges Earned</Text>
        </View>
      </View>
    </View>
  );

  // Render achievement item
  const renderAchievementItem = ({ item: achievement }) => {
    const isUnlocked = unlockedAchievements.includes(achievement.id);
    const progress = getProgressForAchievement(achievement.id);

    return (
      <AchievementBadge
        achievement={achievement}
        isUnlocked={isUnlocked}
        progress={progress}
        size="medium"
        testID={`achievement-${achievement.id}`}
      />
    );
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Achievements"
          showBackButton={true}
          navigation={navigation}
        />
        <InlineLoading message="Loading your achievements..." />
      </View>
    );
  }

  const filteredAchievements = getFilteredAchievements();

  return (
    <View style={styles.container}>
      <Header
        title="Achievements"
        showBackButton={true}
        navigation={navigation}
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Stats Overview */}
        {renderStatsOverview()}

        {/* Category Filters */}
        {renderCategoryFilters()}

        {/* Achievement Count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {selectedCategory === 'unlocked' 
              ? `${unlockedAchievements.length} unlocked`
              : selectedCategory === 'locked'
              ? `${filteredAchievements.length - unlockedAchievements.length} locked`
              : `${filteredAchievements.length} achievements`
            }
          </Text>
        </View>

        {/* Achievements List */}
        <View style={styles.achievementsList}>
          {filteredAchievements.map(achievement => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              isUnlocked={unlockedAchievements.includes(achievement.id)}
              progress={getProgressForAchievement(achievement.id)}
              size="medium"
              testID={`achievement-${achievement.id}`}
            />
          ))}
        </View>

        {/* Empty state */}
        {filteredAchievements.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No achievements in this category</Text>
          </View>
        )}
      </ScrollView>
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
  
  // Stats Overview
  statsContainer: {
    ...componentStyles.card,
    margin: spacing.md,
  },
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  quickStat: {
    alignItems: 'center',
  },
  
  quickStatValue: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  
  quickStatLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs / 2,
  },
  
  // Category Filters
  categoryFilters: {
    marginVertical: spacing.sm,
  },
  
  categoryFiltersContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  categoryIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  
  categoryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  
  categoryLabelActive: {
    color: colors.cardBackground,
  },
  
  // Achievement Count
  countContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  
  countText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Achievements List
  achievementsList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  
  // Empty State
  emptyState: {
    ...commonStyles.centerContent,
    paddingVertical: spacing.xl,
  },
  
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default AchievementsScreen;