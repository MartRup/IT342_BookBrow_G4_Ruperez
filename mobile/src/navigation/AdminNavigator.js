import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminManageBooksScreen from '../screens/admin/AdminManageBooksScreen';
import AdminBorrowingRecordsScreen from '../screens/admin/AdminBorrowingRecordsScreen';
import AdminMenuScreen from '../screens/admin/AdminMenuScreen';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'AdminDashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'AdminBooks') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'AdminRecords') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'AdminMenu') {
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
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="AdminBooks"
        component={AdminManageBooksScreen}
        options={{ tabBarLabel: 'Books' }}
      />
      <Tab.Screen
        name="AdminRecords"
        component={AdminBorrowingRecordsScreen}
        options={{ tabBarLabel: 'Records' }}
      />
      <Tab.Screen
        name="AdminMenu"
        component={AdminMenuScreen}
        options={{ tabBarLabel: 'More' }}
      />
    </Tab.Navigator>
  );
}
