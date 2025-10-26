// Unit tests for types and validation functions
const {
  createDefaultHabit,
  generateUUID,
  validateHabit,
  validateStoredData,
  validateHabitCreation,
  STORAGE_KEYS,
  DEFAULT_VALUES
} = require('../types');

describe('Types and Validation', () => {
  describe('generateUUID', () => {
    it('should generate a valid UUID format', () => {
      const uuid = generateUUID();
      
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('createDefaultHabit', () => {
    it('should create a habit with required fields', () => {
      const habit = createDefaultHabit('Test Habit', 'daily');
      
      expect(habit).toHaveProperty('id');
      expect(habit).toHaveProperty('name', 'Test Habit');
      expect(habit).toHaveProperty('frequency', 'daily');
      expect(habit).toHaveProperty('targetTime', null);
      expect(habit).toHaveProperty('createdAt');
      expect(habit).toHaveProperty('completedDays', 0);
      expect(habit).toHaveProperty('totalDays', 0);
      expect(habit).toHaveProperty('completionHistory', []);
      expect(habit).toHaveProperty('isCompleted', false);
    });

    it('should create a habit with target time', () => {
      const habit = createDefaultHabit('Test Habit', 'weekly', '10:00');
      
      expect(habit.targetTime).toBe('10:00');
    });

    it('should use default frequency when not provided', () => {
      const habit = createDefaultHabit('Test Habit');
      
      expect(habit.frequency).toBe('daily');
    });
  });

  describe('validateHabit', () => {
    const validHabit = {
      id: '123',
      name: 'Test Habit',
      frequency: 'daily',
      targetTime: '10:00',
      createdAt: new Date(),
      completedDays: 5,
      totalDays: 10,
      completionHistory: [],
      isCompleted: false
    };

    it('should validate a correct habit', () => {
      const result = validateHabit(validHabit);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject habit without name', () => {
      const invalidHabit = { ...validHabit, name: '' };
      const result = validateHabit(invalidHabit);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Habit name is required and must be a non-empty string');
    });

    it('should reject habit with invalid frequency', () => {
      const invalidHabit = { ...validHabit, frequency: 'invalid' };
      const result = validateHabit(invalidHabit);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Frequency must be either "daily" or "weekly"');
    });

    it('should reject habit with negative completed days', () => {
      const invalidHabit = { ...validHabit, completedDays: -1 };
      const result = validateHabit(invalidHabit);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Completed days must be a non-negative number');
    });

    it('should reject habit with negative total days', () => {
      const invalidHabit = { ...validHabit, totalDays: -1 };
      const result = validateHabit(invalidHabit);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Total days must be a non-negative number');
    });

    it('should reject habit with non-array completion history', () => {
      const invalidHabit = { ...validHabit, completionHistory: 'not-array' };
      const result = validateHabit(invalidHabit);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Completion history must be an array');
    });

    it('should reject habit with non-boolean isCompleted', () => {
      const invalidHabit = { ...validHabit, isCompleted: 'not-boolean' };
      const result = validateHabit(invalidHabit);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('isCompleted must be a boolean');
    });
  });

  describe('validateStoredData', () => {
    const validStoredData = {
      habits: [
        {
          id: '123',
          name: 'Test Habit',
          frequency: 'daily',
          targetTime: null,
          createdAt: new Date(),
          completedDays: 0,
          totalDays: 0,
          completionHistory: [],
          isCompleted: false
        }
      ],
      lastUpdated: '2023-01-01T00:00:00.000Z',
      version: '1.0.0'
    };

    it('should validate correct stored data', () => {
      const result = validateStoredData(validStoredData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object data', () => {
      const result = validateStoredData('not-object');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data must be an object');
    });

    it('should reject data without habits array', () => {
      const invalidData = { ...validStoredData, habits: 'not-array' };
      const result = validateStoredData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Habits must be an array');
    });

    it('should reject data with invalid habits', () => {
      const invalidData = {
        ...validStoredData,
        habits: [{ invalid: 'habit' }]
      };
      const result = validateStoredData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject data without lastUpdated', () => {
      const invalidData = { ...validStoredData };
      delete invalidData.lastUpdated;
      const result = validateStoredData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('lastUpdated must be a string');
    });

    it('should reject data without version', () => {
      const invalidData = { ...validStoredData };
      delete invalidData.version;
      const result = validateStoredData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('version must be a string');
    });
  });

  describe('validateHabitCreation', () => {
    it('should validate correct habit creation data', () => {
      const habitData = {
        name: 'New Habit',
        frequency: 'daily'
      };
      const result = validateHabitCreation(habitData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject habit creation without name', () => {
      const habitData = {
        frequency: 'daily'
      };
      const result = validateHabitCreation(habitData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Habit name is required');
    });

    it('should reject habit creation with empty name', () => {
      const habitData = {
        name: '   ',
        frequency: 'daily'
      };
      const result = validateHabitCreation(habitData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Habit name is required');
    });

    it('should reject habit creation without frequency', () => {
      const habitData = {
        name: 'Test Habit'
      };
      const result = validateHabitCreation(habitData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Valid frequency is required (daily or weekly)');
    });

    it('should reject habit creation with invalid frequency', () => {
      const habitData = {
        name: 'Test Habit',
        frequency: 'invalid'
      };
      const result = validateHabitCreation(habitData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Valid frequency is required (daily or weekly)');
    });
  });

  describe('Constants', () => {
    it('should have correct storage keys', () => {
      expect(STORAGE_KEYS).toEqual({
        HABITS: '@habits',
        USER_PREFERENCES: '@user_preferences',
        AI_CACHE: '@ai_cache'
      });
    });

    it('should have correct default values', () => {
      expect(DEFAULT_VALUES).toEqual({
        HABITS: [],
        VERSION: '1.0.0',
        FREQUENCY_OPTIONS: ['daily', 'weekly']
      });
    });
  });
});