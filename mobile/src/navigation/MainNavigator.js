import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import HomeScreen from '../screens/main/HomeScreen';
import BrowseScreen from '../screens/main/BrowseScreen';
import MyBooksScreen from '../screens/main/MyBooksScreen';
import MenuScreen from '../screens/main/MenuScreen';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Browse') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'MyBooks') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Menu') {
            iconName = focused ? 'menu' : 'menu-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Browse" 
        component={BrowseScreen}
        options={{ tabBarLabel: 'Browse' }}
      />
      <Tab.Screen 
        name="MyBooks" 
        component={MyBooksScreen}
        options={{ tabBarLabel: 'My Books' }}
      />
      <Tab.Screen 
        name="Menu" 
        component={MenuScreen}
        options={{ tabBarLabel: 'More' }}
      />
    </Tab.Navigator>
  );
}
