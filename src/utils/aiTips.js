// AI tips utility for generating motivational content

/**
 * Fallback motivational messages categorized by completion status
 */
const MOTIVATIONAL_MESSAGES = {
  excellent: [
    "Outstanding! You're crushing your habits! Keep this momentum going.",
    "Incredible consistency! You're building powerful habits that will transform your life.",
    "You're on fire! This level of dedication is truly inspiring.",
    "Perfect execution! You're proving that consistency creates lasting change.",
    "Amazing work! You've mastered the art of habit building."
  ],
  good: [
    "Great progress! You're building solid habits. Keep pushing forward!",
    "Well done! Your consistency is paying off. Stay focused on your goals.",
    "Nice work! You're developing strong habits. Every day counts.",
    "Good momentum! You're on the right track. Keep it up!",
    "Solid progress! Your dedication is showing. Stay committed."
  ],
  moderate: [
    "You're making progress! Remember, small steps lead to big changes.",
    "Keep going! Building habits takes time. You're on the right path.",
    "Good effort! Consistency is more important than perfection.",
    "Stay focused! Every completed habit brings you closer to your goals.",
    "You're building momentum! Don't give up, you've got this."
  ],
  needsImprovement: [
    "Don't give up! Every expert was once a beginner. Start fresh today.",
    "It's okay to stumble! What matters is getting back on track.",
    "New day, new opportunity! Small consistent actions create big results.",
    "Progress isn't always linear. Focus on today and move forward.",
    "You can do this! Start with just one habit and build from there."
  ],
  noData: [
    "Welcome to your habit journey! Start small and build consistency.",
    "Every journey begins with a single step. You've got this!",
    "Ready to build amazing habits? Start today and stay consistent.",
    "Your future self will thank you for starting today!",
    "Consistency is the key to success. Let's build great habits together!"
  ]
};

/**
 * Analyzes habit completion data to determine overall performance
 * @param {Array} habits - Array of habit objects
 * @returns {Object} Analysis results with completion rate and category
 */
const analyzeHabitData = (habits) => {
  if (!habits || habits.length === 0) {
    return {
      completionRate: 0,
      category: 'noData',
      totalHabits: 0,
      completedToday: 0,
      streak: 0,
      insights: {
        mostConsistent: null,
        needsAttention: null,
        recentTrend: 'stable'
      }
    };
  }

  const totalHabits = habits.length;
  const completedToday = habits.filter(habit => habit.isCompleted).length;
  const completionRate = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  // Calculate category based on completion rate
  let category;
  if (completionRate >= 90) {
    category = 'excellent';
  } else if (completionRate >= 70) {
    category = 'good';
  } else if (completionRate >= 40) {
    category = 'moderate';
  } else {
    category = 'needsImprovement';
  }

  // Calculate streak (consecutive days with at least one habit completed)
  const streak = calculateCurrentStreak(habits);

  // Find most consistent and least consistent habits
  const habitStats = habits.map(habit => ({
    name: habit.name,
    rate: habit.totalDays > 0 ? (habit.completedDays / habit.totalDays) * 100 : 0,
    habit
  }));

  const mostConsistent = habitStats.length > 0 
    ? habitStats.reduce((prev, current) => prev.rate > current.rate ? prev : current)
    : null;

  const needsAttention = habitStats.length > 0
    ? habitStats.reduce((prev, current) => prev.rate < current.rate ? prev : current)
    : null;

  // Analyze recent trend (last 7 days)
  const recentTrend = analyzeRecentTrend(habits);

  return {
    completionRate: Math.round(completionRate),
    category,
    totalHabits,
    completedToday,
    streak,
    insights: {
      mostConsistent: mostConsistent ? {
        name: mostConsistent.name,
        rate: Math.round(mostConsistent.rate)
      } : null,
      needsAttention: needsAttention && needsAttention.rate < 50 ? {
        name: needsAttention.name,
        rate: Math.round(needsAttention.rate)
      } : null,
      recentTrend
    }
  };
};

/**
 * Calculates current streak of days with at least one habit completed
 * @param {Array} habits - Array of habit objects
 * @returns {number} Current streak in days
 */
const calculateCurrentStreak = (habits) => {
  if (!habits || habits.length === 0) return 0;

  // Get all unique dates from completion history
  const allDates = new Set();
  habits.forEach(habit => {
    if (habit.completionHistory) {
      habit.completionHistory.forEach(entry => {
        if (entry.completed) {
          allDates.add(entry.date);
        }
      });
    }
  });

  if (allDates.size === 0) return 0;

  // Sort dates in descending order
  const sortedDates = Array.from(allDates).sort((a, b) => new Date(b) - new Date(a));
  
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  
  // Check if today has any completions
  if (sortedDates.includes(today)) {
    streak = 1;
    
    // Count consecutive days backwards
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i-1]);
      const previousDate = new Date(sortedDates[i]);
      const dayDifference = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
      
      if (dayDifference === 1) {
        streak++;
      } else {
        break;
      }
    }
  }
  
  return streak;
};

/**
 * Analyzes recent trend in habit completion
 * @param {Array} habits - Array of habit objects
 * @returns {string} Trend direction: 'improving', 'declining', or 'stable'
 */
const analyzeRecentTrend = (habits) => {
  if (!habits || habits.length === 0) return 'stable';

  const last7Days = [];
  const today = new Date();
  
  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]);
  }

  // Calculate completion rates for each day
  const dailyRates = last7Days.map(date => {
    const totalHabits = habits.length;
    const completedHabits = habits.filter(habit => {
      return habit.completionHistory && 
             habit.completionHistory.some(entry => entry.date === date && entry.completed);
    }).length;
    
    return totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
  });

  // Compare first half vs second half of the week
  const firstHalf = dailyRates.slice(0, 3).reduce((sum, rate) => sum + rate, 0) / 3;
  const secondHalf = dailyRates.slice(4).reduce((sum, rate) => sum + rate, 0) / 3;

  const difference = secondHalf - firstHalf;
  
  if (difference > 10) return 'improving';
  if (difference < -10) return 'declining';
  return 'stable';
};

/**
 * Generates a random motivational message based on completion status
 * @param {string} category - Performance category
 * @returns {string} Random motivational message
 */
const getRandomMessage = (category) => {
  const messages = MOTIVATIONAL_MESSAGES[category] || MOTIVATIONAL_MESSAGES.noData;
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

/**
 * Creates a personalized tip based on habit analysis
 * @param {Object} analysis - Habit analysis results
 * @returns {string} Personalized tip
 */
const createPersonalizedTip = (analysis) => {
  const { category, completionRate, streak, insights, totalHabits, completedToday } = analysis;
  
  let tip = getRandomMessage(category);
  
  // Add personalized insights
  if (insights.mostConsistent && insights.mostConsistent.rate > 80) {
    tip += ` Your "${insights.mostConsistent.name}" habit is performing excellently at ${insights.mostConsistent.rate}%!`;
  }
  
  if (insights.needsAttention && insights.needsAttention.rate < 50) {
    tip += ` Consider focusing more on your "${insights.needsAttention.name}" habit.`;
  }
  
  if (streak > 0) {
    tip += ` You're on a ${streak}-day streak - keep it going!`;
  }
  
  if (insights.recentTrend === 'improving') {
    tip += " Your recent progress is trending upward - fantastic work!";
  } else if (insights.recentTrend === 'declining') {
    tip += " Let's get back on track - you've got this!";
  }
  
  return tip;
};

/**
 * Main function to generate AI tips with dummy logic
 * @param {Array} habitData - Array of habit objects
 * @returns {Promise<Object>} AI tip response with analysis
 */
export const generateAITip = async (habitData) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Analyze habit data
    const analysis = analyzeHabitData(habitData);
    
    // Generate personalized tip
    const tip = createPersonalizedTip(analysis);
    
    return {
      success: true,
      tip,
      analysis,
      source: 'fallback',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating AI tip:', error);
    return {
      success: false,
      tip: "Keep up the great work! Consistency is key to building lasting habits.",
      analysis: { completionRate: 0, category: 'noData' },
      source: 'fallback',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Configuration for Gemini API
 */
const GEMINI_CONFIG = {
  API_KEY: process.env.GEMINI_API_KEY || 'your-gemini-api-key-here',
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  TIMEOUT: 10000, // 10 seconds
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000 // 1 second
};

/**
 * Creates a prompt for Gemini API based on habit analysis
 * @param {Object} analysis - Habit analysis results
 * @returns {string} Formatted prompt for AI
 */
const createGeminiPrompt = (analysis) => {
  const { completionRate, category, totalHabits, completedToday, streak, insights } = analysis;
  
  let prompt = `You are a motivational habit coach. Based on the following habit data, provide a personalized, encouraging tip (max 150 words):

Completion Rate: ${completionRate}%
Total Habits: ${totalHabits}
Completed Today: ${completedToday}
Current Streak: ${streak} days
Performance Category: ${category}`;

  if (insights.mostConsistent) {
    prompt += `\nBest Performing Habit: "${insights.mostConsistent.name}" (${insights.mostConsistent.rate}% completion rate)`;
  }

  if (insights.needsAttention) {
    prompt += `\nNeeds Attention: "${insights.needsAttention.name}" (${insights.needsAttention.rate}% completion rate)`;
  }

  prompt += `\nRecent Trend: ${insights.recentTrend}

Please provide a motivational tip that:
1. Acknowledges their current progress
2. Offers specific, actionable advice
3. Maintains an encouraging and positive tone
4. Is personalized to their performance level`;

  return prompt;
};

/**
 * Makes HTTP request to Gemini API with timeout and retry logic
 * @param {string} prompt - The prompt to send to Gemini
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<Object>} API response
 */
const makeGeminiRequest = async (prompt, retryCount = 0) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_CONFIG.TIMEOUT);

  try {
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 200,
      }
    };

    const response = await fetch(
      `${GEMINI_CONFIG.BASE_URL}?key=${GEMINI_CONFIG.API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API');
    }

    return {
      success: true,
      content: data.candidates[0].content.parts[0].text,
      usage: data.usageMetadata || null
    };

  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - Gemini API took too long to respond');
    }
    
    if (error.message.includes('fetch')) {
      throw new Error('Network error - Unable to connect to Gemini API');
    }
    
    // Retry logic for transient errors
    if (retryCount < GEMINI_CONFIG.MAX_RETRIES && 
        (error.message.includes('timeout') || 
         error.message.includes('network') || 
         error.message.includes('500') || 
         error.message.includes('502') || 
         error.message.includes('503'))) {
      
      console.warn(`Gemini API request failed, retrying... (${retryCount + 1}/${GEMINI_CONFIG.MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, GEMINI_CONFIG.RETRY_DELAY * (retryCount + 1)));
      return makeGeminiRequest(prompt, retryCount + 1);
    }
    
    throw error;
  }
};

/**
 * Validates Gemini API configuration
 * @returns {Object} Validation result
 */
const validateGeminiConfig = () => {
  const errors = [];
  
  if (!GEMINI_CONFIG.API_KEY || GEMINI_CONFIG.API_KEY === 'your-gemini-api-key-here') {
    errors.push('Gemini API key is not configured');
  }
  
  if (!GEMINI_CONFIG.BASE_URL) {
    errors.push('Gemini API base URL is not configured');
  }
  
  if (typeof GEMINI_CONFIG.TIMEOUT !== 'number' || GEMINI_CONFIG.TIMEOUT <= 0) {
    errors.push('Invalid timeout configuration');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calls Gemini API to generate personalized habit tips
 * @param {string} prompt - The prompt to send to Gemini API
 * @returns {Promise<Object>} API response with tip content
 */
export const callGeminiAPI = async (prompt) => {
  try {
    // Validate configuration
    const configValidation = validateGeminiConfig();
    if (!configValidation.isValid) {
      throw new Error(`Configuration error: ${configValidation.errors.join(', ')}`);
    }

    // Make API request
    const result = await makeGeminiRequest(prompt);
    
    return {
      success: true,
      content: result.content.trim(),
      source: 'gemini',
      usage: result.usage,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Gemini API call failed:', error);
    
    return {
      success: false,
      error: error.message,
      source: 'gemini',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Enhanced AI tip generation with Gemini API integration
 * @param {Array} habitData - Array of habit objects
 * @param {boolean} useAPI - Whether to attempt API call (default: true)
 * @returns {Promise<Object>} AI tip response
 */
export const generateEnhancedAITip = async (habitData, useAPI = true) => {
  try {
    // Analyze habit data first
    const analysis = analyzeHabitData(habitData);
    
    // Try Gemini API if enabled and configured
    if (useAPI) {
      const prompt = createGeminiPrompt(analysis);
      const apiResult = await callGeminiAPI(prompt);
      
      if (apiResult.success) {
        return {
          success: true,
          tip: apiResult.content,
          analysis,
          source: 'gemini',
          usage: apiResult.usage,
          timestamp: apiResult.timestamp
        };
      } else {
        console.warn('Gemini API failed, falling back to dummy logic:', apiResult.error);
      }
    }
    
    // Fallback to dummy logic
    const fallbackResult = await generateAITip(habitData);
    return {
      ...fallbackResult,
      apiError: useAPI ? 'API unavailable, using fallback' : 'API disabled'
    };

  } catch (error) {
    console.error('Error in enhanced AI tip generation:', error);
    
    // Ultimate fallback
    return {
      success: false,
      tip: "Keep up the great work! Consistency is key to building lasting habits.",
      analysis: { completionRate: 0, category: 'noData' },
      source: 'fallback',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Utility function to test Gemini API connection
 * @returns {Promise<Object>} Connection test result
 */
export const testGeminiConnection = async () => {
  try {
    const testPrompt = "Respond with 'Connection successful' if you receive this message.";
    const result = await callGeminiAPI(testPrompt);
    
    return {
      success: result.success,
      message: result.success ? 'Gemini API connection successful' : 'Gemini API connection failed',
      error: result.error || null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      message: 'Gemini API connection test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};