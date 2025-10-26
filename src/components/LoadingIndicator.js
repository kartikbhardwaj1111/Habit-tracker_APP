import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal
} from 'react-native';
import {
  colors,
  typography,
  spacing,
  commonStyles
} from '../styles/globalStyles';

/**
 * LoadingIndicator component for showing loading states
 * Can be used as overlay or inline component
 */
const LoadingIndicator = ({
  visible = true,
  message = 'Loading...',
  overlay = false,
  size = 'large',
  color = colors.primary,
  style,
  textStyle,
  testID,
  ...props
}) => {
  const content = (
    <View
      style={[
        overlay ? styles.overlayContainer : styles.inlineContainer,
        style
      ]}
      testID={testID}
      {...props}
    >
      <ActivityIndicator
        size={size}
        color={color}
        testID={`${testID}-spinner`}
      />
      {message && (
        <Text
          style={[
            overlay ? styles.overlayText : styles.inlineText,
            textStyle
          ]}
          testID={`${testID}-text`}
        >
          {message}
        </Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={visible}
        testID={`${testID}-modal`}
      >
        {content}
      </Modal>
    );
  }

  return visible ? content : null;
};

/**
 * Inline loading component for use within screens
 */
export const InlineLoading = ({ message = 'Loading...', ...props }) => (
  <LoadingIndicator
    overlay={false}
    message={message}
    {...props}
  />
);

/**
 * Overlay loading component for full-screen loading
 */
export const OverlayLoading = ({ message = 'Loading...', ...props }) => (
  <LoadingIndicator
    overlay={true}
    message={message}
    {...props}
  />
);

/**
 * Small loading indicator for buttons or small spaces
 */
export const SmallLoading = ({ color = colors.cardBackground, ...props }) => (
  <ActivityIndicator
    size="small"
    color={color}
    {...props}
  />
);

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    ...commonStyles.centerContent,
    padding: spacing.xl,
  },
  
  inlineContainer: {
    ...commonStyles.centerContent,
    padding: spacing.lg,
  },
  
  overlayText: {
    ...typography.body,
    color: colors.cardBackground,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  
  inlineText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default LoadingIndicator;