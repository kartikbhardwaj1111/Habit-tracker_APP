import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, componentStyles, typography, spacing } from '../styles/globalStyles';

/**
 * Reusable Header component for consistent navigation and branding
 * Supports title, optional back button, and right component slot
 * Integrates with React Navigation and handles safe area
 */
const Header = ({
  title,
  showBackButton = false,
  rightComponent,
  onBackPress,
  navigation,
  style,
  titleStyle,
  backgroundColor = colors.cardBackground,
  testID,
  accessibilityLabel,
  ...props
}) => {
  const insets = useSafeAreaInsets();

  // Handle back button press
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // Calculate header height including safe area
  const headerHeight = componentStyles.header.container.height + insets.top;

  return (
    <>
      {/* Status bar configuration */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor={backgroundColor}
        translucent={Platform.OS === 'android'}
      />
      
      <View
        style={[
          styles.container,
          {
            height: headerHeight,
            paddingTop: insets.top,
            backgroundColor
          },
          style
        ]}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        {...props}
      >
        {/* Left side - Back button or spacer */}
        <View style={styles.leftContainer}>
          {showBackButton ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
              testID={`${testID}-back-button`}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              accessibilityHint="Navigate to the previous screen"
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.spacer} />
          )}
        </View>

        {/* Center - Title */}
        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, titleStyle]}
            numberOfLines={1}
            ellipsizeMode="tail"
            testID={`${testID}-title`}
            accessibilityRole="header"
          >
            {title}
          </Text>
        </View>

        {/* Right side - Custom component or spacer */}
        <View style={styles.rightContainer}>
          {rightComponent ? (
            <View
              style={styles.rightComponent}
              testID={`${testID}-right-component`}
            >
              {rightComponent}
            </View>
          ) : (
            <View style={styles.spacer} />
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    ...componentStyles.header.container,
    // Override height as it will be calculated dynamically
    height: undefined,
  },
  
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  
  rightComponent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  spacer: {
    width: 40,
    height: 40,
  },
});

export default Header;