import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue 
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Svg, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const LoginIcon = ({ active }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M8.9 7.56c.31-3.6 2.16-5.07 6.21-5.07h.13c4.47 0 6.26 1.79 6.26 6.26v6.52c0 4.47-1.79 6.26-6.26 6.26h-.13c-4.02 0-5.87-1.45-6.2-4.99"
      stroke={active ? "#004AAD" : "#92ACEC"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 12h12.88"
      stroke={active ? "#FAC443" : "#92ACEC"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12.65 8.65 16 12l-3.35 3.35"
      stroke={active ? "#FAC443" : "#92ACEC"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SignUpIcon = ({ active }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
      fill={active ? "#004AAD" : "transparent"}
      stroke={active ? "#004AAD" : "#92ACEC"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.41 22c0-3.87 3.85-7 8.59-7 .96 0 1.89.13 2.76.37"
      stroke={active ? "#FAC443" : "#92ACEC"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ResetIcon = ({ active }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12.6 3.1c-.3-.09-.7-.09-1.2 0C8.48 3.86 6 6.34 6 9.27c0 2.89 2.4 5.32 5.4 5.32s5.4-2.43 5.4-5.32c0-2.93-2.48-5.41-4.2-6.17Z"
      fill={active ? "#004AAD" : "transparent"}
      stroke={active ? "#004AAD" : "#92ACEC"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.81 18.85C4.49 20.15 3 21.8 3 23.6h18c0-1.8-1.49-3.45-3.81-4.75"
      stroke={active ? "#FAC443" : "#92ACEC"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const activeIndex = useSharedValue(state.index);

  React.useEffect(() => {
    activeIndex.value = state.index;
  }, [state.index]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={50} tint="light" style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.tabBar}>
            {state.routes.map((route, index) => {
              const isFocused = state.index === index;
              
              const animatedStyle = useAnimatedStyle(() => {
                const isActive = activeIndex.value === index;
                return {
                  transform: [
                    { scale: withSpring(isActive ? 1 : 0.9, { damping: 15 }) },
                    { translateY: withSpring(isActive ? -8 : 0, { damping: 15 }) }
                  ]
                };
              });

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={() => navigation.navigate(route.name)}
                  style={styles.tab}
                >
                  <Animated.View style={animatedStyle}>
                    <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                      {getAuthIcon(route.name, isFocused)}
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const getAuthIcon = (routeName, active) => {
  switch (routeName) {
    case 'تسجيل الدخول':
      return <LoginIcon active={active} />;
    case 'إنشاء حساب':
      return <SignUpIcon active={active} />;
    case 'إعادة تعيين كلمة المرور':
      return <ResetIcon active={active} />;
    default:
      return null;
  }
};

const AuthTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen name="تسجيل الدخول" component={LoginScreen} />
      <Tab.Screen name="إنشاء حساب" component={SignUpScreen} />
      <Tab.Screen name="إعادة تعيين كلمة المرور" component={ForgotPasswordScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    backgroundColor: 'transparent',
  },
  blurContainer: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(146,172,236,0.2)',
  },
  gradient: {
    borderRadius: 32,
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255,255,255,1)',
    shadowColor: '#004AAD',
    shadowOpacity: 0.2,
    shadowRadius: 4.84,
    borderTopWidth: 3,
    borderTopColor: '#004AAD',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  indicator: {
    position: 'absolute',
    bottom: -2,
    width: 20,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  indicatorGradient: {
    width: '100%',
    height: '100%',
  }
});

export default AuthTabs; 
