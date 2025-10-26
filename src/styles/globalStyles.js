import { Dimensions, Platform } from 'react-native';

// Get device dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Global style constants for the AI Habit Tracker app
export const colors = {
  primary: '#6C63FF',      // Main brand color
  secondary: '#FF6B6B',    // Accent color
  success: '#4ECDC4',      // Completion indicators
  warning: '#FFE66D',      // Attention states
  background: '#F8F9FA',   // App background
  cardBackground: '#FFFFFF', // Card backgrounds
  text: '#2D3436',         // Primary text
  textSecondary: '#636E72', // Secondary text
  border: '#DDD6FE',       // Borders and dividers
  
  // Gradient colors for buttons and progress bars
  gradients: {
    primary: ['#6C63FF', '#9C88FF'],
    secondary: ['#FF6B6B', '#FF8E8E'],
    success: ['#4ECDC4', '#7FDBDA'],
    progress: ['#6C63FF', '#4ECDC4']
  },
  
  // Opacity variants
  overlay: 'rgba(0, 0, 0, 0.5)',
  disabled: 'rgba(108, 99, 255, 0.3)',
  transparent: 'transparent'
};

export const typography = {
  h1: { 
    fontSize: screenWidth > 375 ? 28 : 26, 
    fontWeight: 'bold',
    lineHeight: screenWidth > 375 ? 34 : 32
  },
  h2: { 
    fontSize: screenWidth > 375 ? 24 : 22, 
    fontWeight: '600',
    lineHeight: screenWidth > 375 ? 30 : 28
  },
  h3: { 
    fontSize: screenWidth > 375 ? 20 : 18, 
    fontWeight: '600',
    lineHeight: screenWidth > 375 ? 26 : 24
  },
  body: { 
    fontSize: 16, 
    fontWeight: 'normal',
    lineHeight: 22
  },
  caption: { 
    fontSize: 14, 
    fontWeight: 'normal',
    lineHeight: 18
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Screen-based spacing
  screenPadding: screenWidth > 375 ? 20 : 16,
  cardMargin: screenWidth > 375 ? 16 : 12
};

export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  round: 50
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 8,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8.30,
    elevation: 12,
  }
};

// Responsive design utilities
export const responsive = {
  screenWidth,
  screenHeight,
  isSmallScreen: screenWidth < 375,
  isMediumScreen: screenWidth >= 375 && screenWidth < 414,
  isLargeScreen: screenWidth >= 414,
  
  // Responsive dimensions
  buttonHeight: screenWidth > 375 ? 48 : 44,
  inputHeight: screenWidth > 375 ? 50 : 46,
  headerHeight: Platform.OS === 'ios' ? 88 : 64,
  
  // Responsive spacing
  getSpacing: (base) => screenWidth > 375 ? base : Math.max(base * 0.8, 4),
  getFontSize: (base) => screenWidth > 375 ? base : Math.max(base - 2, 12)
};

// Common UI patterns
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenPadding
  },
  
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  fullWidth: {
    width: '100%'
  },
  
  textCenter: {
    textAlign: 'center'
  },
  
  // Safe area handling
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 0
  }
};

// Base component styles
export const componentStyles = {
  // Card styling with shadows and rounded corners
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.cardMargin,
    ...shadows.small
  },
  
  cardLarge: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    marginVertical: spacing.md,
    marginHorizontal: spacing.cardMargin,
    ...shadows.medium
  },
  
  // Button gradient styles and interaction states
  button: {
    base: {
      height: responsive.buttonHeight,
      borderRadius: borderRadius.small,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      minWidth: 120
    },
    
    primary: {
      backgroundColor: colors.primary,
      ...shadows.small
    },
    
    secondary: {
      backgroundColor: colors.secondary,
      ...shadows.small
    },
    
    floating: {
      width: 56,
      height: 56,
      borderRadius: borderRadius.round,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: spacing.lg,
      right: spacing.lg,
      ...shadows.medium
    },
    
    disabled: {
      backgroundColor: colors.disabled,
      shadowOpacity: 0,
      elevation: 0
    },
    
    text: {
      color: colors.cardBackground,
      ...typography.button
    },
    
    textDisabled: {
      color: colors.textSecondary,
      ...typography.button
    }
  },
  
  // Progress bar styling with animations
  progressBar: {
    container: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: borderRadius.small,
      overflow: 'hidden',
      marginVertical: spacing.sm
    },
    
    fill: {
      height: '100%',
      backgroundColor: colors.success,
      borderRadius: borderRadius.small,
      minWidth: 2
    },
    
    animated: {
      height: '100%',
      borderRadius: borderRadius.small,
      minWidth: 2
    },
    
    gradient: {
      height: '100%',
      borderRadius: borderRadius.small
    }
  },
  
  // Input field styling
  input: {
    container: {
      marginVertical: spacing.sm
    },
    
    field: {
      height: responsive.inputHeight,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.small,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.cardBackground,
      fontSize: typography.body.fontSize,
      color: colors.text
    },
    
    focused: {
      borderColor: colors.primary,
      borderWidth: 2
    },
    
    error: {
      borderColor: colors.secondary,
      borderWidth: 2
    },
    
    label: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing.xs
    },
    
    errorText: {
      ...typography.caption,
      color: colors.secondary,
      marginTop: spacing.xs
    }
  },
  
  // Header styling
  header: {
    container: {
      height: responsive.headerHeight,
      backgroundColor: colors.cardBackground,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingTop: Platform.OS === 'ios' ? 44 : 0,
      ...shadows.small
    },
    
    title: {
      ...typography.h3,
      color: colors.text,
      flex: 1,
      textAlign: 'center'
    },
    
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center'
    },
    
    rightComponent: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center'
    }
  },
  
  // List item styling
  listItem: {
    container: {
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.medium,
      padding: spacing.md,
      marginVertical: spacing.xs,
      marginHorizontal: spacing.cardMargin,
      ...shadows.small
    },
    
    content: {
      flex: 1
    },
    
    title: {
      ...typography.body,
      color: colors.text,
      marginBottom: spacing.xs
    },
    
    subtitle: {
      ...typography.caption,
      color: colors.textSecondary
    },
    
    action: {
      marginLeft: spacing.md
    }
  },
  
  // Loading and empty states
  loading: {
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl
    },
    
    text: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.md,
      textAlign: 'center'
    }
  },
  
  emptyState: {
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl
    },
    
    title: {
      ...typography.h3,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.sm
    },
    
    description: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22
    }
  }
};

// Animation configurations
export const animations = {
  // Standard timing for most animations
  timing: {
    duration: 250,
    useNativeDriver: true
  },
  
  // Slower timing for complex animations
  slow: {
    duration: 400,
    useNativeDriver: true
  },
  
  // Fast timing for micro-interactions
  fast: {
    duration: 150,
    useNativeDriver: true
  },
  
  // Spring animation for bouncy effects
  spring: {
    tension: 100,
    friction: 8,
    useNativeDriver: true
  },
  
  // Progress bar animation
  progress: {
    duration: 500,
    useNativeDriver: false
  }
};