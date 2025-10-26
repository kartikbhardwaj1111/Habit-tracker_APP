import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  commonStyles,
  componentStyles,
  borderRadius
} from '../styles/globalStyles';
import Header from '../components/Header';
import Button from '../components/Button';
import { addHabit } from '../utils/storage';
import { showHabitCreationFeedback, showErrorToast } from '../utils/toastNotifications';

const AddHabitScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'daily',
    targetTime: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Validate habit name
    if (!formData.name.trim()) {
      newErrors.name = 'Habit name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Habit name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Habit name must be less than 50 characters';
    }

    // Validate frequency (should always be valid from picker)
    if (!['daily', 'weekly'].includes(formData.frequency)) {
      newErrors.frequency = 'Please select a valid frequency';
    }

    // Validate target time (optional)
    if (formData.targetTime && formData.targetTime.trim()) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.targetTime.trim())) {
        newErrors.targetTime = 'Please enter time in HH:MM format (e.g., 09:30)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const habitData = {
        name: formData.name.trim(),
        frequency: formData.frequency,
        targetTime: formData.targetTime.trim() || null
      };

      const newHabit = await addHabit(habitData);
      
      if (newHabit) {
        showHabitCreationFeedback(newHabit);
        // Navigate back after a short delay to let user see the toast
        setTimeout(() => navigation.goBack(), 1000);
      } else {
        showErrorToast('Failed to create habit. Please check your input and try again.');
      }
    } catch (error) {
      console.error('Error creating habit:', error);
      showErrorToast('Failed to create habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle frequency selection
  const handleFrequencySelect = (frequency) => {
    handleInputChange('frequency', frequency);
  };

  // Render frequency selector
  const renderFrequencySelector = () => (
    <View style={styles.frequencyContainer}>
      <Text style={styles.label}>Frequency</Text>
      <View style={styles.frequencyOptions}>
        <TouchableOpacity
          style={[
            styles.frequencyOption,
            formData.frequency === 'daily' && styles.frequencyOptionSelected
          ]}
          onPress={() => handleFrequencySelect('daily')}
          testID="frequency-daily"
          accessibilityRole="button"
          accessibilityState={{ selected: formData.frequency === 'daily' }}
        >
          <Ionicons
            name="calendar"
            size={20}
            color={formData.frequency === 'daily' ? colors.cardBackground : colors.textSecondary}
          />
          <Text
            style={[
              styles.frequencyOptionText,
              formData.frequency === 'daily' && styles.frequencyOptionTextSelected
            ]}
          >
            Daily
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.frequencyOption,
            formData.frequency === 'weekly' && styles.frequencyOptionSelected
          ]}
          onPress={() => handleFrequencySelect('weekly')}
          testID="frequency-weekly"
          accessibilityRole="button"
          accessibilityState={{ selected: formData.frequency === 'weekly' }}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={formData.frequency === 'weekly' ? colors.cardBackground : colors.textSecondary}
          />
          <Text
            style={[
              styles.frequencyOptionText,
              formData.frequency === 'weekly' && styles.frequencyOptionTextSelected
            ]}
          >
            Weekly
          </Text>
        </TouchableOpacity>
      </View>
      {errors.frequency && (
        <Text style={styles.errorText}>{errors.frequency}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title="Add New Habit"
        showBackButton={true}
        navigation={navigation}
        testID="add-habit-header"
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Habit Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Habit Name *</Text>
            <TextInput
              style={[
                styles.input,
                errors.name && styles.inputError
              ]}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="e.g., Drink 8 glasses of water"
              placeholderTextColor={colors.textSecondary}
              maxLength={50}
              testID="habit-name-input"
              accessibilityLabel="Habit name"
              accessibilityHint="Enter the name of your habit"
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
          </View>

          {/* Frequency Selector */}
          {renderFrequencySelector()}

          {/* Target Time Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Target Time (Optional)</Text>
            <TextInput
              style={[
                styles.input,
                errors.targetTime && styles.inputError
              ]}
              value={formData.targetTime}
              onChangeText={(value) => handleInputChange('targetTime', value)}
              placeholder="e.g., 09:30"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={5}
              testID="target-time-input"
              accessibilityLabel="Target time"
              accessibilityHint="Enter target time in HH:MM format"
            />
            <Text style={styles.helperText}>
              Set a specific time to be reminded (HH:MM format)
            </Text>
            {errors.targetTime && (
              <Text style={styles.errorText}>{errors.targetTime}</Text>
            )}
          </View>

          {/* Save Button */}
          <Button
            title="Create Habit"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            testID="save-habit-button"
          />
        </View>

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips for Success</Text>
          <Text style={styles.tipsText}>
            • Start with small, achievable habits{'\n'}
            • Be specific about what you want to do{'\n'}
            • Choose a consistent time if possible{'\n'}
            • Track your progress daily
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  content: {
    flex: 1,
  },
  
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  
  // Form card
  formCard: {
    ...componentStyles.cardLarge,
    marginBottom: spacing.lg,
  },
  
  // Input styles
  inputContainer: {
    marginBottom: spacing.lg,
  },
  
  label: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  
  input: {
    ...componentStyles.input.field,
    fontSize: typography.body.fontSize,
  },
  
  inputError: {
    ...componentStyles.input.error,
  },
  
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  errorText: {
    ...componentStyles.input.errorText,
  },
  
  // Frequency selector
  frequencyContainer: {
    marginBottom: spacing.lg,
  },
  
  frequencyOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  
  frequencyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.small,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  
  frequencyOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  frequencyOptionText: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  
  frequencyOptionTextSelected: {
    color: colors.cardBackground,
  },
  
  // Save button
  saveButton: {
    marginTop: spacing.md,
  },
  
  // Tips card
  tipsCard: {
    ...componentStyles.card,
    backgroundColor: colors.success + '10', // Light success color
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  
  tipsTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  
  tipsText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default AddHabitScreen;