import React from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  useSharedValue,
  useAnimatedReaction
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Svg, Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

// Import screens
import HomeScreen from './HomeScreen';
import FavoritesScreen from './FavoritesScreen';
import CartScreen from './CartScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const TabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const activeIndex = useSharedValue(state.index);

  // Update activeIndex when tab changes
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
                  onPress={() => {
                    const event = navigation.emit({
                      type: 'tabPress',
                      target: route.key,
                      canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                      navigation.navigate(route.name);
                    }
                  }}
                  style={styles.tab}
                >
                  <Animated.View style={animatedStyle}>
                    <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                      {getTabIcon(route.name, isFocused)}
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

const getTabIcon = (routeName, isFocused) => {
  const props = { active: isFocused };
  
  switch (routeName) {
    case 'Home':
      return <HomeIcon {...props} />;
    case 'Favorites':
      return <FavoritesIcon {...props} />;
    case 'Cart':
      return <CartIcon {...props} />;
    case 'Profile':
      return <ProfileIcon {...props} />;
    default:
      return null;
  }
};

// Custom Icon Components with professional design
const HomeIcon = ({ active }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M9.02 2.84l-5.39 4.2C2.73 7.74 2 9.23 2 10.36v7.41c0 2.32 1.89 4.22 4.21 4.22h11.58c2.32 0 4.21-1.9 4.21-4.21V10.5c0-1.21-.81-2.76-1.8-3.45l-6.18-4.33c-1.4-.98-3.65-.93-5 .12"
      fill="none"
      stroke={active ? "#004AAD" : "#92ACEC"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 17.99v-3"
      fill="none"
      stroke={active ? "#FAC443" : "#92ACEC"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FavoritesIcon = ({ active }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 0 1 4.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12Z"
      fill={active ? "#004AAD" : "transparent"}
      stroke={active ? "#004AAD" : "#92ACEC"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CartIcon = ({ active }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 2h1.74c1.08 0 1.93.93 1.84 2l-.83 9.96a2.796 2.796 0 0 0 2.79 3.03h10.65c1.44 0 2.7-1.18 2.81-2.61l.54-7.5c.12-1.66-1.14-3.01-2.81-3.01H5.82"
      fill="none"
      stroke={active ? "#004AAD" : "#92ACEC"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.25 22a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM8.25 22a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"
      fill={active ? "#FAC443" : "#92ACEC"}
      stroke="none"
    />
  </Svg>
);

const ProfileIcon = ({ active }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12.12 12.78a.963.963 0 0 0-.24 0 3.27 3.27 0 0 1-3.16-3.27c0-1.81 1.46-3.28 3.28-3.28a3.276 3.276 0 0 1 .12 6.55Z"
      fill={active ? "#004AAD" : "transparent"}
      stroke={active ? "#004AAD" : "#92ACEC"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.74 19.38A9.934 9.934 0 0 1 12 22c-2.6 0-4.96-.99-6.74-2.62.1-.94.7-1.86 1.77-2.58 2.74-1.82 7.22-1.82 9.94 0 1.07.72 1.67 1.64 1.77 2.58Z"
      fill={active ? "#004AAD" : "transparent"}
      stroke={active ? "#004AAD" : "#92ACEC"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
      fill="none"
      stroke={active ? "#004AAD" : "#92ACEC"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
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
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
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

export default function ClientTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          unmountOnBlur: true
        }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{
          unmountOnBlur: true
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          unmountOnBlur: true
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          unmountOnBlur: true
        }}
      />
    </Tab.Navigator>
  );
}