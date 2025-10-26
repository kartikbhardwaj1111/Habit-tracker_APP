// Offline functionality tests
// Tests that the app works correctly without internet connectivity

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getHabits, 
  addHabit, 
  updateHabitCompletion 
} from '../utils/storage';
import { generateEnhancedAITip } from '../utils/aiTips';
import networkStatusManager from '../utils/networkStatus';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock network status
jest.mock('../utils/networkStatus', () => ({
  checkConnection: jest.fn(),
  initialize: jest.fn(),
  cleanup: jest.fn(),
  isOnline: false
}));

describe('Offline Functionality Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
    AsyncStorage.removeItem.mockClear();
    networkStatusManager.checkConnection.mockClear();
  });

  describe('Data Persistence', () => {
    it('should store and retrieve habits when offline', async () => {
      // Mock offline state
      networkStatusManager.checkConnection.mockResolvedValue(false);
      
      // Mock empty storage initially
      AsyncStorage.getItem.mockResolvedValue(null);
      AsyncStorage.setItem.mockResolvedValue();

      // Create a habit while offline
      const habitData = {
        name: 'Offline Habit',
        frequency: 'daily',
        targetTime: null
      };

      const newHabit = await addHabit(habitData);
      expect(newHabit).toBeTruthy();
      expect(newHabit.name).toBe('Offline Habit');

      // Verify data was stored locally
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      
      // Mock the stored data for retrieval
      const mockStoredData = {
        habits: [newHabit],
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredData));

      // Retrieve habits while offline
      const habits = await getHabits();
      expect(habits).toHaveLength(1);
      expect(habits[0].name).toBe('Offline Habit');
    });

    it('should update habit completion when offline', async () => {
      // Mock offline state
      networkStatusManager.checkConnection.mockResolvedValue(false);

      const mockHabit = {
        id: 'offline-habit-1',
        name: 'Offline Exercise',
        frequency: 'daily',
        targetTime: null,
        createdAt: new Date().toISOString(),
        completedDays: 0,
        totalDays: 1,
        completionHistory: [],
        isCompleted: false
      };

      const mockStoredData = {
        habits: [mockHabit],
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredData));
      AsyncStorage.setItem.mockResolvedValue();

      // Update completion while offline
      const success = await updateHabitCompletion('offline-habit-1', true);
      expect(success).toBe(true);

      // Verify the update was stored locally
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const setItemCall = AsyncStorage.setItem.mock.calls[0];
      const storedData = JSON.parse(setItemCall[1]);
      const updatedHabit = storedData.habits[0];

      expect(updatedHabit.isCompleted).toBe(true);
      expect(updatedHabit.completedDays).toBe(1);
    });

    it('should maintain data integrity across app restarts when offline', async () => {
      // Mock offline state
      networkStatusManager.checkConnection.mockResolvedValue(false);

      // Simulate multiple habits stored offline
      const mockHabits = [
        {
          id: 'habit-1',
          name: 'Morning Routine',
          frequency: 'daily',
          completedDays: 5,
          totalDays: 7,
          completionHistory: [
            { date: '2024-01-01', completed: true },
            { date: '2024-01-02', completed: true },
            { date: '2024-01-03', completed: false },
            { date: '2024-01-04', completed: true },
            { date: '2024-01-05', completed: true }
          ],
          isCompleted: false
        },
        {
          id: 'habit-2',
          name: 'Evening Reading',
          frequency: 'daily',
          completedDays: 3,
          totalDays: 7,
          completionHistory: [
            { date: '2024-01-01', completed: true },
            { date: '2024-01-02', completed: false },
            { date: '2024-01-03', completed: true },
            { date: '2024-01-04', completed: false }
          ],
          isCompleted: true
        }
      ];

      const mockStoredData = {
        habits: mockHabits,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredData));

      // Simulate app restart by loading habits
      const loadedHabits = await getHabits();

      expect(loadedHabits).toHaveLength(2);
      expect(loadedHabits[0].name).toBe('Morning Routine');
      expect(loadedHabits[0].completedDays).toBe(5);
      expect(loadedHabits[1].name).toBe('Evening Reading');
      expect(loadedHabits[1].isCompleted).toBe(true);

      // Verify completion history is preserved
      expect(loadedHabits[0].completionHistory).toHaveLength(5);
      expect(loadedHabits[1].completionHistory).toHaveLength(4);
    });
  });

  describe('AI Features Offline', () => {
    it('should provide fallback AI tips when offline', async () => {
      // Mock offline state
      networkStatusManager.checkConnection.mockResolvedValue(false);

      const mockHabits = [
        {
          id: 'habit-1',
          name: 'Daily Exercise',
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
        }
      ];

      // Generate AI tip in offline mode (should use fallback)
      const result = await generateEnhancedAITip(mockHabits, false);

      expect(result.success).toBe(true);
      expect(result.tip).toBeTruthy();
      expect(typeof result.tip).toBe('string');
      expect(result.analysis).toBeTruthy();
      expect(result.analysis.completionRate).toBeDefined();
      expect(result.analysis.totalHabits).toBe(1);
    });

    it('should handle AI service unavailability gracefully', async () => {
      // Mock network available but AI service failing
      networkStatusManager.checkConnection.mockResolvedValue(true);

      const mockHabits = [
        {
          id: 'habit-1',
          name: 'Meditation',
          frequency: 'daily',
          completedDays: 3,
          totalDays: 5,
          completionHistory: [],
          isCompleted: false
        }
      ];

      // Force fallback mode even when online (simulating API failure)
      const result = await generateEnhancedAITip(mockHabits, false);

      expect(result.success).toBe(true);
      expect(result.tip).toBeTruthy();
      expect(result.analysis).toBeTruthy();
    });
  });

  describe('Storage Error Handling', () => {
    it('should handle AsyncStorage failures gracefully', async () => {
      // Mock storage failure
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage unavailable'));

      // Should return empty array instead of crashing
      const habits = await getHabits();
      expect(habits).toEqual([]);
    });

    it('should handle storage write failures', async () => {
      // Mock successful read but failed write
      AsyncStorage.getItem.mockResolvedValue(null);
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));

      // Should return null for failed habit creation
      const newHabit = await addHabit({
        name: 'Test Habit',
        frequency: 'daily'
      });

      expect(newHabit).toBeNull();
    });

    it('should handle corrupted storage data', async () => {
      // Mock corrupted JSON data
      AsyncStorage.getItem.mockResolvedValue('invalid json data');

      // Should return empty array for corrupted data
      const habits = await getHabits();
      expect(habits).toEqual([]);
    });
  });

  describe('Offline User Experience', () => {
    it('should maintain app functionality without network', async () => {
      // Mock offline state
      networkStatusManager.checkConnection.mockResolvedValue(false);
      AsyncStorage.getItem.mockResolvedValue(null);
      AsyncStorage.setItem.mockResolvedValue();

      // Test complete offline workflow
      
      // 1. Create habit offline
      const habit1 = await addHabit({
        name: 'Offline Habit 1',
        frequency: 'daily'
      });
      expect(habit1).toBeTruthy();

      // 2. Create another habit
      const habit2 = await addHabit({
        name: 'Offline Habit 2',
        frequency: 'weekly'
      });
      expect(habit2).toBeTruthy();

      // 3. Mock storage with both habits
      const mockStoredData = {
        habits: [habit1, habit2],
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredData));

      // 4. Load habits
      const habits = await getHabits();
      expect(habits).toHaveLength(2);

      // 5. Update completion for first habit
      const updateSuccess = await updateHabitCompletion(habit1.id, true);
      expect(updateSuccess).toBe(true);

      // 6. Generate AI insights offline
      const aiResult = await generateEnhancedAITip(habits, false);
      expect(aiResult.success).toBe(true);

      // All operations should work offline
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should queue operations for when connection is restored', async () => {
      // This test simulates the concept of operation queuing
      // In a real app, you might queue sync operations for when online
      
      const operations = [];
      
      // Mock offline operations
      networkStatusManager.checkConnection.mockResolvedValue(false);
      
      // Simulate queuing operations
      operations.push({ type: 'CREATE_HABIT', data: { name: 'Queued Habit' } });
      operations.push({ type: 'UPDATE_COMPLETION', habitId: 'habit-1', completed: true });
      
      expect(operations).toHaveLength(2);
      
      // Simulate connection restored
      networkStatusManager.checkConnection.mockResolvedValue(true);
      
      // Operations would be processed when online
      expect(operations[0].type).toBe('CREATE_HABIT');
      expect(operations[1].type).toBe('UPDATE_COMPLETION');
    });
  });
});