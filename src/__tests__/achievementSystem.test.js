// Achievement System Tests
import { 
  calculateUserStats, 
  checkAchievements, 
  getAchievementProgress,
  ACHIEVEMENTS 
} from '../utils/achievementSystem';

describe('Achievement System Tests', () => {
  const mockHabits = [
    {
      id: 'habit-1',
      name: 'Morning Exercise',
      frequency: 'daily',
      completedDays: 10,
      totalDays: 12,
      completionHistory: [
        { date: '2024-01-01', completed: true },
        { date: '2024-01-02', completed: true },
        { date: '2024-01-03', completed: false },
        { date: '2024-01-04', completed: true },
        { date: '2024-01-05', completed: true },
        { date: '2024-01-06', completed: true },
        { date: '2024-01-07', completed: true },
        { date: '2024-01-08', completed: true },
        { date: '2024-01-09', completed: false },
        { date: '2024-01-10', completed: true },
        { date: '2024-01-11', completed: true },
        { date: '2024-01-12', completed: true }
      ],
      targetTime: '07:00'
    },
    {
      id: 'habit-2',
      name: 'Evening Reading',
      frequency: 'daily',
      completedDays: 5,
      totalDays: 12,
      completionHistory: [
        { date: '2024-01-01', completed: true },
        { date: '2024-01-02', completed: false },
        { date: '2024-01-03', completed: true },
        { date: '2024-01-04', completed: false },
        { date: '2024-01-05', completed: true },
        { date: '2024-01-06', completed: true },
        { date: '2024-01-07', completed: false },
        { date: '2024-01-08', completed: true },
        { date: '2024-01-09', completed: false },
        { date: '2024-01-10', completed: false },
        { date: '2024-01-11', completed: false },
        { date: '2024-01-12', completed: false }
      ],
      targetTime: '21:00'
    }
  ];

  describe('calculateUserStats', () => {
    it('should calculate correct user statistics', () => {
      const stats = calculateUserStats(mockHabits);
      
      expect(stats.totalHabits).toBe(2);
      expect(stats.totalCompletions).toBe(15); // 10 + 5
      expect(stats.overallCompletionRate).toBe(63); // 15/24 = 62.5% rounded to 63%
      expect(stats.longestStreak).toBeGreaterThan(0);
    });

    it('should handle empty habits array', () => {
      const stats = calculateUserStats([]);
      
      expect(stats.totalHabits).toBe(0);
      expect(stats.totalCompletions).toBe(0);
      expect(stats.overallCompletionRate).toBe(0);
      expect(stats.longestStreak).toBe(0);
    });
  });

  describe('checkAchievements', () => {
    it('should unlock First Steps achievement', () => {
      const result = checkAchievements(mockHabits, []);
      
      expect(result.allUnlocked).toContain('first_steps');
      expect(result.newAchievements.some(a => a.id === 'first_steps')).toBe(true);
    });

    it('should unlock Habit Collector achievement with enough habits', () => {
      const manyHabits = Array.from({ length: 5 }, (_, i) => ({
        ...mockHabits[0],
        id: `habit-${i + 1}`,
        name: `Habit ${i + 1}`
      }));
      
      const result = checkAchievements(manyHabits, []);
      
      expect(result.allUnlocked).toContain('habit_collector');
    });

    it('should not return already unlocked achievements as new', () => {
      const currentAchievements = ['first_steps'];
      const result = checkAchievements(mockHabits, currentAchievements);
      
      expect(result.newAchievements.some(a => a.id === 'first_steps')).toBe(false);
      expect(result.allUnlocked).toContain('first_steps');
    });
  });

  describe('getAchievementProgress', () => {
    it('should calculate progress for locked achievements', () => {
      const progress = getAchievementProgress(mockHabits, ['first_steps']);
      
      expect(progress.length).toBeGreaterThan(0);
      expect(progress[0]).toHaveProperty('achievement');
      expect(progress[0]).toHaveProperty('currentValue');
      expect(progress[0]).toHaveProperty('targetValue');
      expect(progress[0]).toHaveProperty('progressPercentage');
    });

    it('should not include unlocked achievements in progress', () => {
      const unlockedAchievements = ['first_steps', 'habit_collector'];
      const progress = getAchievementProgress(mockHabits, unlockedAchievements);
      
      const hasUnlockedAchievement = progress.some(p => 
        unlockedAchievements.includes(p.achievement.id)
      );
      
      expect(hasUnlockedAchievement).toBe(false);
    });
  });

  describe('Achievement Definitions', () => {
    it('should have all required achievement properties', () => {
      Object.values(ACHIEVEMENTS).forEach(achievement => {
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('title');
        expect(achievement).toHaveProperty('description');
        expect(achievement).toHaveProperty('icon');
        expect(achievement).toHaveProperty('category');
        expect(achievement).toHaveProperty('condition');
        expect(typeof achievement.condition).toBe('function');
      });
    });

    it('should have unique achievement IDs', () => {
      const ids = Object.values(ACHIEVEMENTS).map(a => a.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(ids.length).toBe(uniqueIds.length);
    });
  });
});