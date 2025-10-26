import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

// Mock LinearGradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }) => children,
}));

describe('Button Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders with title correctly', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByRole } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    const button = getByRole('button');
    fireEvent.press(button);
    
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByRole } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled={true} />
    );
    
    const button = getByRole('button');
    fireEvent.press(button);
    
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    const { getByTestId } = render(
      <Button title="Test Button" onPress={mockOnPress} loading={true} testID="test-button" />
    );
    
    expect(getByTestId('test-button-loading')).toBeTruthy();
  });

  it('renders different variants correctly', () => {
    const { rerender, getByRole } = render(
      <Button title="Primary" onPress={mockOnPress} variant="primary" />
    );
    
    let button = getByRole('button');
    expect(button).toBeTruthy();
    
    rerender(<Button title="Secondary" onPress={mockOnPress} variant="secondary" />);
    button = getByRole('button');
    expect(button).toBeTruthy();
    
    rerender(<Button title="Floating" onPress={mockOnPress} variant="floating" />);
    button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('has proper accessibility attributes', () => {
    const { getByRole } = render(
      <Button 
        title="Accessible Button" 
        onPress={mockOnPress}
        accessibilityLabel="Custom accessibility label"
        accessibilityHint="Custom hint"
      />
    );
    
    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Custom accessibility label');
    expect(button.props.accessibilityHint).toBe('Custom hint');
  });
});