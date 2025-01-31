import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import SellerHomeScreen from './SellerHomeScreen';
import StatisticsScreen from './StatisticsScreen';
import ProductsScreen from './SellerProductsScreen';
import StoreSellerProfileScreen from './StoreSellerProfileScreen';
import StoreSettingsScreen from './StoreSettingsScreen';
import EditStoreProfileScreen from './EditStoreProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const StoreSettingsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Settings" component={StoreSettingsScreen} />
      <Stack.Screen name="EditStoreProfile" component={EditStoreProfileScreen} />
    </Stack.Navigator>
  );
};

const SellerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'SellerHome') {
            iconName = 'home-outline';
          } else if (route.name === 'Statistics') {
            iconName = 'stats-chart-outline';
          } else if (route.name === 'Products') {
            iconName = 'pricetags-outline';
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
      <Tab.Screen name="SellerHome" component={SellerHomeScreen} options={{ title: 'الرئيسية' , headerShown: false }} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} options={{ title: 'الإحصائيات' , headerShown: false }} />
      <Tab.Screen name="Products" component={ProductsScreen} options={{ title: 'المنتجات' , headerShown: false }} />
      <Tab.Screen name="Profile" component={StoreSellerProfileScreen} options={{ title: 'الملف الشخصي' , headerShown: false }} />
      <Tab.Screen name="Settings" component={StoreSettingsStack} options={{ title: 'الإعدادات' , headerShown: false }} />
    </Tab.Navigator>
  );
};

export default SellerTabs;