// Unit tests for storage utilities
const AsyncStorage = require('@react-native-async-storage/async-storage');
const {
  getStorageData,
  setStorageData,
  updateStorageData,
  deleteStorageData,
  getHabits,
  saveHabits,
  addHabit,
  updateHabit,
  updateHabitCompletion,
  deleteHabit,
  clearAllHabits
} = require('../storage');
const { STORAGE_KEYS, DEFAULT_VALUES } = require('../types');

describe('Storage Utilities', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Generic Storage Functions', () => {
    describe('getStorageData', () => {
      it('should return parsed data when key exists', async () => {
        const testData = { test: 'value' };
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(testData));

        const result = await getStorageData('test-key');
        
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('test-key');
        expect(result).toEqual(testData);
      });

      it('should return default value when key does not exist', async () => {
        AsyncStorage.getItem.mockResolvedValue(null);
        const defaultValue = { default: 'value' };

        const result = await getStorageData('test-key', defaultValue);
        
        expect(result).toEqual(defaultValue);
      });

      it('should return default value on error', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
        const defaultValue = { default: 'value' };

        const result = await getStorageData('test-key', defaultValue);
        
        expect(result).toEqual(defaultValue);
      });
    });

    describe('setStorageData', () => {
      it('should store data successfully', async () => {
        AsyncStorage.setItem.mockResolvedValue();
        const testData = { test: 'value' };

        const result = await setStorageData('test-key', testData);
        
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testData));
        expect(result).toBe(true);
      });

      it('should return false on error', async () => {
        AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));
        const testData = { test: 'value' };

        const result = await setStorageData('test-key', testData);
        
        expect(result).toBe(false);
      });
    });

    describe('updateStorageData', () => {
      it('should update data successfully', async () => {
        const existingData = { count: 1 };
        const updatedData = { count: 2 };
        
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingData));
        AsyncStorage.setItem.mockResolvedValue();

        const updateFunction = (data) => ({ ...data, count: data.count + 1 });
        const result = await updateStorageData('test-key', updateFunction);
        
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(updatedData));
        expect(result).toBe(true);
      });
    });

    describe('deleteStorageData', () => {
      it('should delete data successfully', async () => {
        AsyncStorage.removeItem.mockResolvedValue();

        const result = await deleteStorageData('test-key');
        
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test-key');
        expect(result).toBe(true);
      });

      it('should return false on error', async () => {
        AsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

        const result = await deleteStorageData('test-key');
        
        expect(result).toBe(false);
      });
    });
  });

  describe('Habit-Specific Storage Functions', () => {
    describe('getHabits', () => {
      it('should return habits from valid stored data', async () => {
        const storedData = {
          habits: [
            {
              id: '1',
              name: 'Test Habit',
              frequency: 'daily',
              targetTime: null,
              createdAt: '2025-10-26T06:50:50.716Z',
              completedDays: 0,
              totalDays: 0,
              completionHistory: [],
              isCompleted: false
            }
          ],
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        };
        
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

        const result = await getHabits();
        
        expect(result).toEqual(storedData.habits);
      });

      it('should return empty array when no data exists', async () => {
        AsyncStorage.getItem.mockResolvedValue(null);

        const result = await getHabits();
        
        expect(result).toEqual(DEFAULT_VALUES.HABITS);
      });

      it('should return empty array on error', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

        const result = await getHabits();
        
        expect(result).toEqual(DEFAULT_VALUES.HABITS);
      });
    });

    describe('saveHabits', () => {
      it('should save habits successfully', async () => {
        AsyncStorage.setItem.mockResolvedValue();
        const habits = [
          {
            id: '1',
            name: 'Test Habit',
            frequency: 'daily',
            targetTime: null,
            createdAt: new Date(),
            completedDays: 0,
            totalDays: 0,
            completionHistory: [],
            isCompleted: false
          }
        ];

        const result = await saveHabits(habits);
        
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEYS.HABITS,
          expect.stringContaining('"habits"')
        );
        expect(result).toBe(true);
      });

      it('should return false for invalid habit data', async () => {
        const invalidHabits = [{ invalid: 'data' }];

        const result = await saveHabits(invalidHabits);
        
        expect(result).toBe(false);
      });
    });

    describe('addHabit', () => {
      it('should add new habit successfully', async () => {
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
          habits: [],
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        }));
        AsyncStorage.setItem.mockResolvedValue();

        const habitData = {
          name: 'New Habit',
          frequency: 'daily',
          targetTime: '10:00'
        };

        const result = await addHabit(habitData);
        
        expect(result).toBeTruthy();
        expect(result.name).toBe(habitData.name);
        expect(result.frequency).toBe(habitData.frequency);
        expect(result.targetTime).toBe(habitData.targetTime);
        expect(result.id).toBeDefined();
      });

      it('should return null on error', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
        AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

        const result = await addHabit({ name: 'Test', frequency: 'daily' });
        
        expect(result).toBeNull();
      });
    });

    describe('updateHabit', () => {
      it('should update existing habit successfully', async () => {
        const existingHabits = [
          {
            id: '1',
            name: 'Old Name',
            frequency: 'daily',
            targetTime: null,
            createdAt: new Date(),
            completedDays: 0,
            totalDays: 0,
            completionHistory: [],
            isCompleted: false
          }
        ];
        
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
          habits: existingHabits,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        }));
        AsyncStorage.setItem.mockResolvedValue();

        const result = await updateHabit('1', { name: 'New Name' });
        
        expect(result).toBe(true);
      });

      it('should return false for non-existent habit', async () => {
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
          habits: [],
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        }));

        const result = await updateHabit('non-existent', { name: 'New Name' });
        
        expect(result).toBe(false);
      });
    });

    describe('updateHabitCompletion', () => {
      it('should update habit completion status', async () => {
        const existingHabits = [
          {
            id: '1',
            name: 'Test Habit',
            frequency: 'daily',
            targetTime: null,
            createdAt: new Date(),
            completedDays: 0,
            totalDays: 0,
            completionHistory: [],
            isCompleted: false
          }
        ];
        
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
          habits: existingHabits,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        }));
        AsyncStorage.setItem.mockResolvedValue();

        const result = await updateHabitCompletion('1', true);
        
        expect(result).toBe(true);
      });
    });

    describe('deleteHabit', () => {
      it('should delete existing habit successfully', async () => {
        const existingHabits = [
          {
            id: '1',
            name: 'Test Habit',
            frequency: 'daily',
            targetTime: null,
            createdAt: new Date(),
            completedDays: 0,
            totalDays: 0,
            completionHistory: [],
            isCompleted: false
          }
        ];
        
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
          habits: existingHabits,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        }));
        AsyncStorage.setItem.mockResolvedValue();

        const result = await deleteHabit('1');
        
        expect(result).toBe(true);
      });

      it('should return false for non-existent habit', async () => {
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
          habits: [],
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        }));

        const result = await deleteHabit('non-existent');
        
        expect(result).toBe(false);
      });
    });

    describe('clearAllHabits', () => {
      it('should clear all habits successfully', async () => {
        AsyncStorage.setItem.mockResolvedValue();

        const result = await clearAllHabits();
        
        expect(result).toBe(true);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEYS.HABITS,
          expect.stringContaining('[]')
        );
      });
    });
  });
});