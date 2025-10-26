import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, componentStyles, animations } from '../styles/globalStyles';

/**
 * Reusable Button component with multiple variants and states
 * Supports primary, secondary, and floating button styles
 * Includes loading, disabled states, and accessibility features
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
  children,
  ...props
}) => {
  // Determine button styles based on variant
  const getButtonStyles = () => {
    const baseStyle = [componentStyles.button.base];
    
    switch (variant) {
      case 'secondary':
        return [...baseStyle, componentStyles.button.secondary];
      case 'floating':
        return [componentStyles.button.floating];
      case 'primary':
      default:
        return [...baseStyle, componentStyles.button.primary];
    }
  };

  // Determine text styles based on state
  const getTextStyles = () => {
    if (disabled) {
      return [componentStyles.button.textDisabled, textStyle];
    }
    return [componentStyles.button.text, textStyle];
  };

  // Get gradient colors based on variant
  const getGradientColors = () => {
    if (disabled) {
      return [colors.disabled, colors.disabled];
    }
    
    switch (variant) {
      case 'secondary':
        return colors.gradients.secondary;
      case 'floating':
      case 'primary':
      default:
        return colors.gradients.primary;
    }
  };

  // Handle button press with haptic feedback
  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  // Render button content (text or children)
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={colors.cardBackground}
            testID={`${testID}-loading`}
          />
          {title && (
            <Text style={[getTextStyles(), styles.loadingText]}>
              {title}
            </Text>
          )}
        </View>
      );
    }

    if (children) {
      return children;
    }

    return (
      <Text style={getTextStyles()} numberOfLines={1}>
        {title}
      </Text>
    );
  };

  // Apply disabled styles if needed
  const buttonStyles = [
    ...getButtonStyles(),
    disabled && componentStyles.button.disabled,
    style
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading
      }}
      {...props}
    >
      {/* Use LinearGradient for non-floating buttons when not disabled */}
      {variant !== 'floating' && !disabled ? (
        <LinearGradient
          colors={getGradientColors()}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      ) : null}
      
      {/* Floating button gradient */}
      {variant === 'floating' && !disabled ? (
        <LinearGradient
          colors={getGradientColors()}
          style={[StyleSheet.absoluteFillObject, { borderRadius: 28 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      ) : null}
      
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
});

export default Button;