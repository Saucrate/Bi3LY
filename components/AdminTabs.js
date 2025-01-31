import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminHomeScreen from './AdminHomeScreen';
import AdminStatisticsScreen from './AdminStatisticsScreen';
import UserManagementScreen from './UserManagementScreen';
import SellerManagementScreen from './SellerManagementScreen';
import AdminProfileScreen from './AdminProfileScreen';
import SettingsScreen from './SettingsScreen'; // Import the new SettingsScreen

const Tab = createBottomTabNavigator();

const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'AdminHome') {
            iconName = 'home-outline';
          } else if (route.name === 'Statistics') {
            iconName = 'stats-chart-outline';
          } else if (route.name === 'ClientManagement') {
            iconName = 'people-outline';
          } else if (route.name === 'SellerManagement') {
            iconName = 'storefront-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = 'settings-outline'; // Icon for Settings
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3d4785',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.12,
          shadowRadius: 5,
          elevation: 5,
          overflow: 'hidden',
        },
        tabBarLabelStyle: {
          paddingBottom: 10,
        },
      })}
    >
      <Tab.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'الرئيسية' , headerShown: false }} />
      <Tab.Screen name="Statistics" component={AdminStatisticsScreen} options={{ title: 'الإحصائيات' , headerShown: false }} />
      <Tab.Screen name="ClientManagement" component={UserManagementScreen} options={{ title: 'إدارة العملاء' , headerShown: false }} />
      <Tab.Screen name="SellerManagement" component={SellerManagementScreen} options={{ title: 'إدارة البائعين' , headerShown: false }} />
      <Tab.Screen name="Profile" component={AdminProfileScreen} options={{ title: 'الملف الشخصي' , headerShown: false }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'الإعدادات' , headerShown: false }} />
    </Tab.Navigator>
  );
};

export default AdminTabs;