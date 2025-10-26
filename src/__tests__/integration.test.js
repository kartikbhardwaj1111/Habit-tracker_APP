// Integration tests for AI Habit Tracker
// Tests the complete data flow between components and screens

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getHabits, 
  addHabit, 
  updateHabitCompletion, 
  recalculateAllHabitsProgress 
} from '../utils/storage';
import { calculateCompletionPercentage } from '../utils/progressCalculations';
import { generateEnhancedAITip } from '../utils/aiTips';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Integration Tests - Complete Data Flow', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
    AsyncStorage.removeItem.mockClear();
  });

  describe('Habit Creation and Storage Flow', () => {
    it('should create a habit and store it properly', async () => {
      // Mock empty storage initially
      AsyncStorage.getItem.mockResolvedValue(null);
      AsyncStorage.setItem.mockResolvedValue();

      // Create a new habit
      const habitData = {
        name: 'Drink Water',
        frequency: 'daily',
        targetTime: '09:00'
      };

      const newHabit = await addHabit(habitData);

      // Verify habit was created with correct structure
      expect(newHabit).toBeTruthy();
      expect(newHabit.name).toBe('Drink Water');
      expect(newHabit.frequency).toBe('daily');
      expect(newHabit.targetTime).toBe('09:00');
      expect(newHabit.id).toBeTruthy();
      expect(newHabit.completedDays).toBe(0);
      expect(newHabit.totalDays).toBe(0);
      expect(newHabit.isCompleted).toBe(false);
      expect(Array.isArray(newHabit.completionHistory)).toBe(true);

      // Verify AsyncStorage was called to save the habit
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@habits',
        expect.stringContaining('"name":"Drink Water"')
      );
    });

    it('should load existing habits from storage', async () => {
      // Mock existing habits in storage
      const mockStoredData = {
        habits: [
          {
            id: 'test-id-1',
            name: 'Exercise',
            frequency: 'daily',
            targetTime: null,
            createdAt: new Date().toISOString(),
            completedDays: 5,
            totalDays: 10,
            completionHistory: [],
            isCompleted: false
          }
        ],
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredData));

      const habits = await getHabits();

      expect(habits).toHaveLength(1);
      expect(habits[0].name).toBe('Exercise');
      expect(habits[0].completedDays).toBe(5);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@habits');
    });
  });

  describe('Habit Completion Flow', () => {
    it('should update habit completion status and recalculate progress', async () => {
      // Mock existing habit
      const mockHabit = {
        id: 'test-id-1',
        name: 'Read Book',
        frequency: 'daily',
        targetTime: null,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        completedDays: 2,
        totalDays: 5,
        completionHistory: [
          { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true },
          { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true }
        ],
        isCompleted: false
      };

      const mockStoredData = {
        habits: [mockHabit],
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredData));
      AsyncStorage.setItem.mockResolvedValue();

      // Update completion status
      const success = await updateHabitCompletion('test-id-1', true);

      expect(success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();

      // Verify the stored data includes the completion update
      const setItemCall = AsyncStorage.setItem.mock.calls[0];
      const storedData = JSON.parse(setItemCall[1]);
      const updatedHabit = storedData.habits[0];

      expect(updatedHabit.isCompleted).toBe(true);
      expect(updatedHabit.completedDays).toBe(3); // Should increment
      expect(updatedHabit.completionHistory).toHaveLength(3); // Should add today's entry
    });

    it('should calculate progress percentage correctly', () => {
      const habit = {
        completedDays: 7,
        totalDays: 10
      };

      const percentage = calculateCompletionPercentage(habit);
      expect(percentage).toBe(70);
    });

    it('should handle edge cases in progress calculation', () => {
      // Test zero total days
      expect(calculateCompletionPercentage({ completedDays: 0, totalDays: 0 })).toBe(0);
      
      // Test 100% completion
      expect(calculateCompletionPercentage({ completedDays: 10, totalDays: 10 })).toBe(100);
      
      // Test over-completion (shouldn't happen but handle gracefully)
      expect(calculateCompletionPercentage({ completedDays: 12, totalDays: 10 })).toBe(100);
    });
  });

  describe('AI Integration Flow', () => {
    it('should generate AI tips based on habit data', async () => {
      const mockHabits = [
        {
          id: 'habit-1',
          name: 'Morning Workout',
          frequency: 'daily',
          completedDays: 8,
          totalDays: 10,
          completionHistory: [
            { date: '2024-01-01', completed: true },
            { date: '2024-01-02', completed: true },
            { date: '2024-01-03', completed: false },
            { date: '2024-01-04', completed: true }
          ],
          isCompleted: true
        },
        {
          id: 'habit-2',
          name: 'Read Daily',
          frequency: 'daily',
          completedDays: 3,
          totalDays: 10,
          completionHistory: [
            { date: '2024-01-01', completed: true },
            { date: '2024-01-02', completed: false },
            { date: '2024-01-03', completed: false },
            { date: '2024-01-04', completed: true }
          ],
          isCompleted: false
        }
      ];

      const result = await generateEnhancedAITip(mockHabits, false); // Use fallback mode

      expect(result.success).toBe(true);
      expect(result.tip).toBeTruthy();
      expect(typeof result.tip).toBe('string');
      expect(result.analysis).toBeTruthy();
      expect(result.analysis.completionRate).toBeDefined();
      expect(result.analysis.totalHabits).toBe(2);
      expect(result.analysis.completedToday).toBe(1);
    });
  });

  describe('Data Consistency and Validation', () => {
    it('should maintain data consistency after multiple operations', async () => {
      // Start with empty storage
      AsyncStorage.getItem.mockResolvedValue(null);
      AsyncStorage.setItem.mockResolvedValue();

      // Add multiple habits
      const habit1 = await addHabit({ name: 'Habit 1', frequency: 'daily' });
      const habit2 = await addHabit({ name: 'Habit 2', frequency: 'weekly' });

      expect(habit1).toBeTruthy();
      expect(habit2).toBeTruthy();

      // Mock the storage to return both habits
      const mockStoredData = {
        habits: [habit1, habit2],
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredData));

      // Load habits and verify
      const loadedHabits = await getHabits();
      expect(loadedHabits).toHaveLength(2);
      expect(loadedHabits.find(h => h.name === 'Habit 1')).toBeTruthy();
      expect(loadedHabits.find(h => h.name === 'Habit 2')).toBeTruthy();

      // Update completion for one habit
      const success = await updateHabitCompletion(habit1.id, true);
      expect(success).toBe(true);

      // Verify AsyncStorage was called with updated data
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should handle storage errors gracefully', async () => {
      // Mock storage error
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      // Should return empty array on error
      const habits = await getHabits();
      expect(habits).toEqual([]);
    });

    it('should validate habit data before saving', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      AsyncStorage.setItem.mockResolvedValue();

      // Try to create habit with invalid data
      const invalidHabit = await addHabit({ name: '', frequency: 'invalid' });
      
      // Should return null for invalid data due to validation failure
      expect(invalidHabit).toBeNull();
      
      // Try with valid data
      const validHabit = await addHabit({ name: 'Valid Habit', frequency: 'daily' });
      expect(validHabit).toBeTruthy();
      expect(validHabit.name).toBe('Valid Habit');
    });
  });

  describe('Cross-Screen Data Flow', () => {
    it('should simulate complete user flow from creation to completion', async () => {
      // Simulate AddHabitScreen -> HomeScreen -> InsightsScreen flow
      
      // Step 1: Create habit (AddHabitScreen)
      AsyncStorage.getItem.mockResolvedValue(null);
      AsyncStorage.setItem.mockResolvedValue();
      
      const newHabit = await addHabit({
        name: 'Daily Meditation',
        frequency: 'daily',
        targetTime: '07:00'
      });
      
      expect(newHabit).toBeTruthy();
      
      // Step 2: Load habits (HomeScreen)
      const mockStoredData = {
        habits: [newHabit],
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredData));
      
      const habits = await getHabits();
      expect(habits).toHaveLength(1);
      expect(habits[0].name).toBe('Daily Meditation');
      
      // Step 3: Complete habit (HomeScreen interaction)
      const completionSuccess = await updateHabitCompletion(newHabit.id, true);
      expect(completionSuccess).toBe(true);
      
      // Step 4: Generate insights (InsightsScreen)
      const updatedHabits = [{
        ...newHabit,
        isCompleted: true,
        completedDays: 1,
        totalDays: 1,
        completionHistory: [
          { date: new Date().toISOString().split('T')[0], completed: true }
        ]
      }];
      
      const aiResult = await generateEnhancedAITip(updatedHabits, false);
      expect(aiResult.success).toBe(true);
      expect(aiResult.analysis.completedToday).toBe(1);
      expect(aiResult.analysis.totalHabits).toBe(1);
    });
  });
});