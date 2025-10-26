import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HabitCard from '../HabitCard';

// Mock LinearGradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }) => children,
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('HabitCard Component', () => {
  const mockHabit = {
    id: '1',
    name: 'Test Habit',
    frequency: 'daily',
    targetTime: '30 minutes',
    completedDays: 5,
    totalDays: 10,
    isCompleted: false,
  };

  const mockOnToggleComplete = jest.fn();

  beforeEach(() => {
    mockOnToggleComplete.mockClear();
  });

  it('renders habit information correctly', () => {
    const { getByText } = render(
      <HabitCard habit={mockHabit} onToggleComplete={mockOnToggleComplete} />
    );
    
    expect(getByText('Test Habit')).toBeTruthy();
    expect(getByText('Daily')).toBeTruthy();
    expect(getByText('5 of 10 days')).toBeTruthy();
    expect(getByText('Target: 30 minutes')).toBeTruthy();
  });

  it('calculates progress percentage correctly', () => {
    const { getByText } = render(
      <HabitCard habit={mockHabit} onToggleComplete={mockOnToggleComplete} />
    );
    
    // 5 out of 10 days = 50%
    expect(getByText('50%')).toBeTruthy();
  });

  it('calls onToggleComplete when toggle button is pressed', () => {
    const { getByTestId } = render(
      <HabitCard 
        habit={mockHabit} 
        onToggleComplete={mockOnToggleComplete}
        testID="test-habit-card"
      />
    );
    
    const toggleButton = getByTestId('test-habit-card-toggle');
    fireEvent.press(toggleButton);
    
    expect(mockOnToggleComplete).toHaveBeenCalledWith('1');
  });

  it('shows completed state correctly', () => {
    const completedHabit = { ...mockHabit, isCompleted: true };
    
    const { getByTestId } = render(
      <HabitCard 
        habit={completedHabit} 
        onToggleComplete={mockOnToggleComplete}
        testID="test-habit-card"
      />
    );
    
    const toggleButton = getByTestId('test-habit-card-toggle');
    expect(toggleButton.props.accessibilityLabel).toContain('Mark Test Habit as incomplete');
  });

  it('shows incomplete state correctly', () => {
    const { getByTestId } = render(
      <HabitCard 
        habit={mockHabit} 
        onToggleComplete={mockOnToggleComplete}
        testID="test-habit-card"
      />
    );
    
    const toggleButton = getByTestId('test-habit-card-toggle');
    expect(toggleButton.props.accessibilityLabel).toContain('Mark Test Habit as complete');
  });

  it('handles zero progress correctly', () => {
    const zeroProgressHabit = { ...mockHabit, completedDays: 0, totalDays: 0 };
    
    const { getByText } = render(
      <HabitCard habit={zeroProgressHabit} onToggleComplete={mockOnToggleComplete} />
    );
    
    expect(getByText('0%')).toBeTruthy();
    expect(getByText('0 of 0 days')).toBeTruthy();
  });

  it('handles habit without target time', () => {
    const habitWithoutTarget = { ...mockHabit, targetTime: undefined };
    
    const { queryByText } = render(
      <HabitCard habit={habitWithoutTarget} onToggleComplete={mockOnToggleComplete} />
    );
    
    expect(queryByText('Target:')).toBeNull();
  });

  it('has proper accessibility attributes', () => {
    const { getByTestId } = render(
      <HabitCard 
        habit={mockHabit} 
        onToggleComplete={mockOnToggleComplete}
        testID="test-habit-card"
        accessibilityLabel="Custom habit card label"
      />
    );
    
    const card = getByTestId('test-habit-card');
    expect(card.props.accessibilityLabel).toBe('Custom habit card label');
    
    const toggleButton = getByTestId('test-habit-card-toggle');
    expect(toggleButton.props.accessibilityRole).toBe('button');
    expect(toggleButton.props.accessibilityState.checked).toBe(false);
  });
});