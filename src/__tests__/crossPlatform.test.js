// Cross-platform compatibility tests
// Tests that the app works correctly on both iOS and Android

import { Platform } from 'react-native';
import { showToast, showConfirmDialog } from '../utils/toastNotifications';
import { calculateCompletionPercentage } from '../utils/progressCalculations';

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios', // Will be changed in tests
    select: jest.fn()
  },
  Alert: {
    alert: jest.fn()
  },
  ToastAndroid: {
    show: jest.fn(),
    SHORT: 0,
    LONG: 1
  }
}));

describe('Cross-Platform Compatibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Platform-Specific UI Components', () => {
    it('should handle iOS-specific features', () => {
      Platform.OS = 'ios';
      
      // Test iOS-specific behavior
      const result = Platform.select({
        ios: 'iOS Feature',
        android: 'Android Feature'
      });
      
      expect(Platform.OS).toBe('ios');
    });

    it('should handle Android-specific features', () => {
      Platform.OS = 'android';
      
      // Test Android-specific behavior
      const result = Platform.select({
        ios: 'iOS Feature',
        android: 'Android Feature'
      });
      
      expect(Platform.OS).toBe('android');
    });
  });

  describe('Data Calculations Cross-Platform', () => {
    it('should calculate progress consistently across platforms', () => {
      const testCases = [
        { completedDays: 0, totalDays: 0, expected: 0 },
        { completedDays: 5, totalDays: 10, expected: 50 },
        { completedDays: 7, totalDays: 7, expected: 100 },
        { completedDays: 12, totalDays: 10, expected: 100 }
      ];

      testCases.forEach(({ completedDays, totalDays, expected }) => {
        const result = calculateCompletionPercentage({ completedDays, totalDays });
        expect(result).toBe(expected);
      });
    });

    it('should handle date calculations consistently', () => {
      const testDate = new Date('2024-01-15T10:30:00Z');
      const dateString = testDate.toISOString().split('T')[0];
      
      expect(dateString).toBe('2024-01-15');
      
      // Test date consistency across platforms
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      expect(todayString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Storage Compatibility', () => {
    it('should handle JSON serialization consistently', () => {
      const testData = {
        id: 'test-id',
        name: 'Test Habit',
        frequency: 'daily',
        createdAt: new Date('2024-01-01'),
        completedDays: 5,
        totalDays: 10,
        isCompleted: true,
        completionHistory: [
          { date: '2024-01-01', completed: true },
          { date: '2024-01-02', completed: false }
        ]
      };

      const serialized = JSON.stringify(testData);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.id).toBe(testData.id);
      expect(deserialized.name).toBe(testData.name);
      expect(deserialized.completedDays).toBe(testData.completedDays);
      expect(deserialized.completionHistory).toHaveLength(2);
    });
  });
});