import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens (will be created in later tasks)
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import AddHabitScreen from '../screens/AddHabitScreen';
import InsightsScreen from '../screens/InsightsScreen';
import AchievementsScreen from '../screens/AchievementsScreen';

import { colors } from '../styles/globalStyles';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'My Habits' }}
        />
        <Stack.Screen 
          name="AddHabit" 
          component={AddHabitScreen}
          options={{ title: 'Add New Habit' }}
        />
        <Stack.Screen 
          name="Insights" 
          component={InsightsScreen}
          options={{ title: 'AI Insights' }}
        />
        <Stack.Screen 
          name="Achievements" 
          component={AchievementsScreen}
          options={{ title: 'Achievements' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;