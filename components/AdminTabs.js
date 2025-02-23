import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import AdminHomeScreen from './AdminHomeScreen';
import AdminStatisticsScreen from './AdminStatisticsScreen';
import UserManagementScreen from './UserManagementScreen';
import SellerManagementScreen from './SellerManagementScreen';
import SellerDetailsScreen from './SellerDetailsScreen';
import AdminProfileScreen from './AdminProfileScreen';
import SettingsScreen from './SettingsScreen';
import UserDetailsScreen from './UserDetailsScreen';
import ProductDetailScreen from './ProductDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Seller Stack Navigator
const SellerStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SellerList" 
        component={SellerManagementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SellerDetails" 
        component={SellerDetailsScreen}
        options={{
          headerTitle: 'تفاصيل البائع',
          headerStyle: {
            backgroundColor: '#3d4785',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

// User Stack Navigator
const UserStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="UserList" 
        component={UserManagementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="UserDetails" 
        component={UserDetailsScreen}
        options={{
          headerTitle: 'تفاصيل المستخدم',
          headerStyle: {
            backgroundColor: '#3d4785',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

// AdminHome Stack Navigator
const AdminHomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AdminHomeScreen" 
        component={AdminHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{
          headerTitle: 'تفاصيل المنتج',
          headerStyle: {
            backgroundColor: '#3d4785',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="SellerDetails" 
        component={SellerDetailsScreen}
        options={{
          headerTitle: 'تفاصيل البائع',
          headerStyle: {
            backgroundColor: '#3d4785',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

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
            iconName = 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3d4785',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 60,
          backgroundColor: '#ffffff',
        },
        tabBarLabelStyle: {
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen 
        name="AdminHome" 
        component={AdminHomeStack} 
        options={{ title: 'الرئيسية', headerShown: false }} 
      />
      <Tab.Screen name="Statistics" component={AdminStatisticsScreen} options={{ title: 'الإحصائيات', headerShown: false }} />
      <Tab.Screen 
        name="ClientManagement" 
        component={UserStack}
        options={{ 
          title: 'إدارة العملاء',
          headerShown: false 
        }}
      />
      <Tab.Screen 
        name="SellerManagement" 
        component={SellerStack} 
        options={{ 
          title: 'إدارة البائعين',
          headerShown: false 
        }} 
      />
      <Tab.Screen name="Profile" component={AdminProfileScreen} options={{ title: 'الملف الشخصي', headerShown: false }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'الإعدادات', headerShown: false }} />
    </Tab.Navigator>
  );
};

export default AdminTabs;