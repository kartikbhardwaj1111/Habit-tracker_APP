// End-to-end user flow tests
// Tests complete user journeys through the app

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getHabits, 
  addHabit, 
  updateHabitCompletion,
  recalculateAllHabitsProgress 
} from '../utils/storage';
import { generateEnhancedAITip } from '../utils/aiTips';
import { calculateCompletionPercentage } from '../utils/progressCalculations';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('End-to-End User Flow Tests', () => {
  beforeEach(() => {
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
    AsyncStorage.removeItem.mockClear();
  });

  describe('New User Onboarding Flow', () => {
    it('should handle first-time user experience', async () => {
      // Mock empty storage (new user)
      AsyncStorage.getItem.mockResolvedValue(null);
      AsyncStorage.setItem.mockResolvedValue();

      // 1. New user opens app - should see empty state
      const initialHabits = await getHabits();
      expect(initialHabits).toEqual([]);

      // 2. User creates their first habit
      const firstHabit = await addHabit({
        name: 'Drink 8 glasses of water',
        frequency: 'daily',
        targetTime: '09:00'
      });

      expect(firstHabit).toBeTruthy();
      expect(firstHabit.name).toBe('Drink 8 glasses of water');
      expect(firstHabit.completedDays).toBe(0);
      expect(firstHabit.totalDays).toBe(0);
      expect(firstHabit.isCompleted).toBe(false);

      // 3. User creates a second habit
      const secondHabit = await addHabit({
        name: 'Morning exercise',
        frequency: 'daily',
        targetTime: null
      });

      expect(secondHabit).toBeTruthy();
      expect(secondHabit.name).toBe('Morning exercise');
    });
  });

  describe('Daily Usage Flow', () => {
    it('should handle typical daily user interactions', async () => {
      // Setup: User has existing habits
      const existingHabits = [
        {
          id: 'habit-1',
          name: 'Morning Meditation',
          frequency: 'daily',
          targetTime: '07:00',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          completedDays: 5,
          totalDays: 7,
          completionHistory: [
            { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true },
            { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true },
            { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: false },
            { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true },
            { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true },
            { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: false },
          ],
          isCompleted: false
        },
        {
          id: 'habit-2',
          name: 'Read for 30 minutes',
          frequency: 'daily',
          targetTime: '20:00',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          completedDays: 6,
          totalDays: 7,
          completionHistory: [
            { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true },
            { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true },
            { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true },
            { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true },
            { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true },
            { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true },
          ],
          isCompleted: false
        }
      ];

      const mockStoredData = {
        habits: existingHabits,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredData));
      AsyncStorage.setItem.mockResolvedValue();

      // 1. User opens app and sees their habits
      const habits = await getHabits();
      expect(habits).toHaveLength(2);
      expect(habits[0].name).toBe('Morning Meditation');
      expect(habits[1].name).toBe('Read for 30 minutes');

      // 2. User completes first habit
      const completion1Success = await updateHabitCompletion('habit-1', true);
      expect(completion1Success).toBe(true);

      // 3. User completes second habit
      const completion2Success = await updateHabitCompletion('habit-2', true);
      expect(completion2Success).toBe(true);

      // 4. Verify completion data was stored
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Progress Tracking Flow', () => {
    it('should track progress over multiple days', async () => {
      // Simulate habit progress over a week
      const baseHabit = {
        id: 'progress-habit',
        name: 'Daily Exercise',
        frequency: 'daily',
        targetTime: '18:00',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedDays: 0,
        totalDays: 0,
        completionHistory: [],
        isCompleted: false
      };

      AsyncStorage.setItem.mockResolvedValue();

      // Day 1: Complete habit
      let currentHabit = { ...baseHabit, totalDays: 1 };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        habits: [currentHabit],
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      }));

      await updateHabitCompletion('progress-habit', true);
      
      // Day 2: Skip habit
      currentHabit = { 
        ...currentHabit, 
        totalDays: 2,
        completedDays: 1,
        completionHistory: [
          { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true }
        ]
      };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        habits: [currentHabit],
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      }));

      // Day 3: Complete habit
      await updateHabitCompletion('progress-habit', true);

      // Verify progress calculations
      const progressHabit = {
        completedDays: 2,
        totalDays: 3
      };
      
      const progressPercentage = calculateCompletionPercentage(progressHabit);
      expect(progressPercentage).toBe(67); // 2/3 = 66.67% rounded to 67%
    });
  });

  describe('AI Insights Flow', () => {
    it('should generate insights based on user progress', async () => {
      const habitsWithProgress = [
        {
          id: 'insight-habit-1',
          name: 'Morning Workout',
          frequency: 'daily',
          completedDays: 8,
          totalDays: 10,
          completionHistory: [
            { date: '2024-01-01', completed: true },
            { date: '2024-01-02', completed: true },
            { date: '2024-01-03', completed: false },
            { date: '2024-01-04', completed: true },
            { date: '2024-01-05', completed: true },
            { date: '2024-01-06', completed: true },
            { date: '2024-01-07', completed: false },
            { date: '2024-01-08', completed: true },
            { date: '2024-01-09', completed: true },
            { date: '2024-01-10', completed: true }
          ],
          isCompleted: true
        },
        {
          id: 'insight-habit-2',
          name: 'Evening Reading',
          frequency: 'daily',
          completedDays: 3,
          totalDays: 10,
          completionHistory: [
            { date: '2024-01-01', completed: true },
            { date: '2024-01-02', completed: false },
            { date: '2024-01-03', completed: false },
            { date: '2024-01-04', completed: true },
            { date: '2024-01-05', completed: false },
            { date: '2024-01-06', completed: false },
            { date: '2024-01-07', completed: false },
            { date: '2024-01-08', completed: true },
            { date: '2024-01-09', completed: false },
            { date: '2024-01-10', completed: false }
          ],
          isCompleted: false
        }
      ];

      // Generate AI insights
      const aiResult = await generateEnhancedAITip(habitsWithProgress, false);

      expect(aiResult.success).toBe(true);
      expect(aiResult.tip).toBeTruthy();
      expect(typeof aiResult.tip).toBe('string');
      
      expect(aiResult.analysis).toBeTruthy();
      expect(aiResult.analysis.totalHabits).toBe(2);
      expect(aiResult.analysis.completedToday).toBe(1);
      expect(aiResult.analysis.completionRate).toBeDefined();
      
      // Should identify most consistent and needs attention habits
      expect(aiResult.analysis.insights).toBeTruthy();
      expect(aiResult.analysis.insights.mostConsistent).toBeTruthy();
      expect(aiResult.analysis.insights.needsAttention).toBeTruthy();
    });
  });

  describe('Data Recovery Flow', () => {
    it('should handle app crashes and data recovery', async () => {
      // Simulate app crash scenario
      const precrashHabits = [
        {
          id: 'recovery-habit-1',
          name: 'Crashed Habit',
          frequency: 'daily',
          completedDays: 3,
          totalDays: 5,
          completionHistory: [
            { date: '2024-01-01', completed: true },
            { date: '2024-01-02', completed: true },
            { date: '2024-01-03', completed: false },
            { date: '2024-01-04', completed: true }
          ],
          isCompleted: false
        }
      ];

      const mockStoredData = {
        habits: precrashHabits,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };

      // Mock successful data recovery
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredData));

      // App restarts and recovers data
      const recoveredHabits = await getHabits();
      
      expect(recoveredHabits).toHaveLength(1);
      expect(recoveredHabits[0].name).toBe('Crashed Habit');
      expect(recoveredHabits[0].completedDays).toBe(3);
      expect(recoveredHabits[0].completionHistory).toHaveLength(4);
      
      // Verify data integrity after recovery
      const progressPercentage = calculateCompletionPercentage(recoveredHabits[0]);
      expect(progressPercentage).toBe(60); // 3/5 = 60%
    });

    it('should handle corrupted data gracefully', async () => {
      // Mock corrupted storage data
      AsyncStorage.getItem.mockResolvedValue('corrupted json data');

      // Should recover gracefully with empty state
      const habits = await getHabits();
      expect(habits).toEqual([]);
    });
  });

  describe('Long-term Usage Flow', () => {
    it('should handle habits with extensive history', async () => {
      // Create habit with 30 days of history
      const completionHistory = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        completionHistory.push({
          date: date.toISOString().split('T')[0],
          completed: Math.random() > 0.3 // 70% completion rate
        });
      }

      const longTermHabit = {
        id: 'long-term-habit',
        name: 'Long Term Habit',
        frequency: 'daily',
        completedDays: completionHistory.filter(entry => entry.completed).length,
        totalDays: 30,
        completionHistory,
        isCompleted: false
      };

      // Test progress calculation with extensive history
      const progressPercentage = calculateCompletionPercentage(longTermHabit);
      expect(progressPercentage).toBeGreaterThanOrEqual(0);
      expect(progressPercentage).toBeLessThanOrEqual(100);

      // Test AI analysis with extensive data
      const aiResult = await generateEnhancedAITip([longTermHabit], false);
      expect(aiResult.success).toBe(true);
      expect(aiResult.analysis.totalHabits).toBe(1);
    });
  });
});