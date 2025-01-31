import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const AuthTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'تسجيل الدخول') {
            iconName = 'log-in-outline';
          } else if (route.name === 'إنشاء حساب') {
            iconName = 'person-add-outline';
          } else if (route.name === 'إعادة تعيين كلمة المرور') {
            iconName = 'key-outline';
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
        headerShown: false,
      })}
    >
      <Tab.Screen name="تسجيل الدخول" component={LoginScreen} />
      <Tab.Screen name="إنشاء حساب" component={SignUpScreen} />
      <Tab.Screen name="إعادة تعيين كلمة المرور" component={ForgotPasswordScreen} />
    </Tab.Navigator>
  );
};

export default AuthTabs; 