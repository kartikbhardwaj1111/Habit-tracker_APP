import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Header from '../Header';

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 0, left: 0, right: 0 }),
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }) => <Text {...props}>{name}</Text>,
  };
});

describe('Header Component', () => {
  const mockNavigation = {
    canGoBack: jest.fn(() => true),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    mockNavigation.canGoBack.mockClear();
    mockNavigation.goBack.mockClear();
  });

  it('renders title correctly', () => {
    const { getByText } = render(
      <Header title="Test Header" />
    );
    
    expect(getByText('Test Header')).toBeTruthy();
  });

  it('shows back button when showBackButton is true', () => {
    const { getByTestId } = render(
      <Header 
        title="Test Header" 
        showBackButton={true}
        testID="test-header"
      />
    );
    
    expect(getByTestId('test-header-back-button')).toBeTruthy();
  });

  it('calls navigation.goBack when back button is pressed', () => {
    const { getByTestId } = render(
      <Header 
        title="Test Header" 
        showBackButton={true}
        navigation={mockNavigation}
        testID="test-header"
      />
    );
    
    const backButton = getByTestId('test-header-back-button');
    fireEvent.press(backButton);
    
    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('calls custom onBackPress when provided', () => {
    const mockOnBackPress = jest.fn();
    const { getByTestId } = render(
      <Header 
        title="Test Header" 
        showBackButton={true}
        onBackPress={mockOnBackPress}
        testID="test-header"
      />
    );
    
    const backButton = getByTestId('test-header-back-button');
    fireEvent.press(backButton);
    
    expect(mockOnBackPress).toHaveBeenCalledTimes(1);
    expect(mockNavigation.goBack).not.toHaveBeenCalled();
  });

  it('renders right component when provided', () => {
    const RightComponent = () => <Text>Right Component</Text>;
    
    const { getByText } = render(
      <Header 
        title="Test Header" 
        rightComponent={<RightComponent />}
      />
    );
    
    expect(getByText('Right Component')).toBeTruthy();
  });

  it('has proper accessibility attributes', () => {
    const { getByTestId } = render(
      <Header 
        title="Accessible Header"
        testID="test-header"
        accessibilityLabel="Custom header label"
      />
    );
    
    const header = getByTestId('test-header');
    expect(header.props.accessibilityLabel).toBe('Custom header label');
    
    const title = getByTestId('test-header-title');
    expect(title.props.accessibilityRole).toBe('header');
  });
});