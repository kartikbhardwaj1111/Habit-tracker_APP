import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import {
  colors,
  typography,
  spacing,
  commonStyles,
  componentStyles,
  borderRadius,
  shadows
} from '../styles/globalStyles';
import Header from '../components/Header';
import Button from '../components/Button';
import { InlineLoading } from '../components/LoadingIndicator';
import { getHabits } from '../utils/storage';
import { generateEnhancedAITip } from '../utils/aiTips';
import { showErrorToast } from '../utils/toastNotifications';

const InsightsScreen = ({ navigation }) => {
  const [habits, setHabits] = useState([]);
  const [aiTip, setAiTip] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Load habits and generate AI insights
  const loadInsights = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // Load habits from storage
      const storedHabits = await getHabits();
      setHabits(storedHabits);

      // Generate AI tip based on habit data
      const tipResult = await generateEnhancedAITip(storedHabits, true);
      
      if (tipResult.success) {
        setAiTip(tipResult.tip);
        setAnalysis(tipResult.analysis);
      } else {
        const errorMsg = 'Failed to generate insights. Please try again.';
        setError(errorMsg);
        showErrorToast(errorMsg);
        console.error('AI tip generation failed:', tipResult.error);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
      const errorMsg = 'Failed to load insights. Please try again.';
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Load insights when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadInsights();
    }, [])
  );

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadInsights(false);
    setRefreshing(false);
  };

  // Handle retry
  const handleRetry = () => {
    loadInsights();
  };

  // Get completion rate color
  const getCompletionRateColor = (rate) => {
    if (rate >= 80) return colors.success;
    if (rate >= 60) return colors.warning;
    return colors.secondary;
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return 'trending-up';
      case 'declining':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  // Get trend color
  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving':
        return colors.success;
      case 'declining':
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  // Render loading state
  const renderLoadingState = () => (
    <InlineLoading 
      message="Analyzing your habits..."
      testID="insights-loading"
    />
  );

  // Render error state
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons
        name="alert-circle-outline"
        size={64}
        color={colors.secondary}
        style={styles.errorIcon}
      />
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorDescription}>{error}</Text>
      <Button
        title="Try Again"
        onPress={handleRetry}
        style={styles.retryButton}
        testID="retry-button"
      />
    </View>
  );

  // Render statistics cards
  const renderStatsCards = () => {
    if (!analysis) return null;

    return (
      <View style={styles.statsContainer}>
        {/* Completion Rate Card */}
        <View style={styles.statCard}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.statCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statValue}>{analysis.completionRate}%</Text>
            <Text style={styles.statLabel}>Completion Rate</Text>
          </LinearGradient>
        </View>

        {/* Streak Card */}
        <View style={styles.statCard}>
          <LinearGradient
            colors={colors.gradients.success}
            style={styles.statCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statValue}>{analysis.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </LinearGradient>
        </View>

        {/* Today's Progress Card */}
        <View style={styles.statCard}>
          <LinearGradient
            colors={colors.gradients.secondary}
            style={styles.statCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statValue}>
              {analysis.completedToday}/{analysis.totalHabits}
            </Text>
            <Text style={styles.statLabel}>Today</Text>
          </LinearGradient>
        </View>
      </View>
    );
  };

  // Render AI tip card
  const renderAITipCard = () => {
    if (!aiTip) return null;

    return (
      <View style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <Ionicons
            name="bulb"
            size={24}
            color={colors.warning}
            style={styles.tipIcon}
          />
          <Text style={styles.tipTitle}>AI Insights</Text>
        </View>
        <Text style={styles.tipContent}>{aiTip}</Text>
        
        {/* Trend indicator */}
        {analysis && analysis.insights && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={getTrendIcon(analysis.insights.recentTrend)}
              size={16}
              color={getTrendColor(analysis.insights.recentTrend)}
            />
            <Text style={[styles.trendText, { color: getTrendColor(analysis.insights.recentTrend) }]}>
              Recent trend: {analysis.insights.recentTrend}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Render insights cards
  const renderInsightsCards = () => {
    if (!analysis || !analysis.insights) return null;

    return (
      <View style={styles.insightsContainer}>
        {/* Most Consistent Habit */}
        {analysis.insights.mostConsistent && (
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons
                name="trophy"
                size={20}
                color={colors.success}
              />
              <Text style={styles.insightTitle}>Top Performer</Text>
            </View>
            <Text style={styles.insightHabitName}>
              {analysis.insights.mostConsistent.name}
            </Text>
            <Text style={styles.insightRate}>
              {analysis.insights.mostConsistent.rate}% completion rate
            </Text>
          </View>
        )}

        {/* Needs Attention */}
        {analysis.insights.needsAttention && (
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons
                name="flag"
                size={20}
                color={colors.warning}
              />
              <Text style={styles.insightTitle}>Needs Focus</Text>
            </View>
            <Text style={styles.insightHabitName}>
              {analysis.insights.needsAttention.name}
            </Text>
            <Text style={styles.insightRate}>
              {analysis.insights.needsAttention.rate}% completion rate
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="AI Insights"
          showBackButton={true}
          navigation={navigation}
          testID="insights-header"
        />
        {renderLoadingState()}
      </View>
    );
  }

  if (error && !aiTip) {
    return (
      <View style={styles.container}>
        <Header
          title="AI Insights"
          showBackButton={true}
          navigation={navigation}
          testID="insights-header"
        />
        {renderErrorState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="AI Insights"
        showBackButton={true}
        navigation={navigation}
        testID="insights-header"
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Statistics Cards */}
        {renderStatsCards()}

        {/* AI Tip Card */}
        {renderAITipCard()}

        {/* Insights Cards */}
        {renderInsightsCards()}

        {/* Empty state for no habits */}
        {habits.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="analytics-outline"
              size={64}
              color={colors.textSecondary}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No Habits to Analyze</Text>
            <Text style={styles.emptyDescription}>
              Create some habits first to get personalized AI insights about your progress.
            </Text>
            <Button
              title="Add Your First Habit"
              onPress={() => navigation.navigate('AddHabit')}
              style={styles.emptyStateButton}
              testID="add-habit-from-insights"
            />
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
  
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  
  loadingText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  
  loadingSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  
  errorIcon: {
    marginBottom: spacing.lg,
  },
  
  errorTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  errorDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  
  retryButton: {
    minWidth: 120,
  },
  
  // Statistics cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  
  statCard: {
    flex: 1,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    ...shadows.small,
  },
  
  statCardGradient: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  
  statValue: {
    ...typography.h2,
    color: colors.cardBackground,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  
  statLabel: {
    ...typography.caption,
    color: colors.cardBackground,
    textAlign: 'center',
    opacity: 0.9,
  },
  
  // AI tip card
  tipCard: {
    ...componentStyles.cardLarge,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  tipIcon: {
    marginRight: spacing.sm,
  },
  
  tipTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
  },
  
  tipContent: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  
  trendText: {
    ...typography.caption,
    marginLeft: spacing.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  
  // Insights cards
  insightsContainer: {
    marginBottom: spacing.lg,
  },
  
  insightCard: {
    ...componentStyles.card,
    marginBottom: spacing.sm,
  },
  
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  insightTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  
  insightHabitName: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  
  insightRate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  
  emptyTitle: {
    ...typography.h3,
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
});

export default InsightsScreen;