import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, StatusBar, Image, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import Svg, { Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  // Initialize all animation values at the start
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Create interpolations
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const scale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2]
  });

  useEffect(() => {
    // Start all animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    navigation.replace('Auth');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Animated Shapes */}
      <View style={styles.shapesContainer}>
        {/* Top Right Circle */}
        <Animated.View style={[styles.shape, styles.topRightCircle, {
          transform: [{ scale }]
        }]}>
          <LinearGradient
            colors={['rgba(0,74,173,0.2)', 'rgba(0,74,173,0.05)']}
            style={styles.shapeGradient}
          />
        </Animated.View>

        {/* Bottom Left Square */}
        <Animated.View style={[styles.shape, styles.bottomLeftSquare, {
          transform: [
            { rotate: spin },
            { scale }
          ]
        }]}>
          <LinearGradient
            colors={['rgba(146,172,236,0.2)', 'rgba(146,172,236,0.05)']}
            style={styles.shapeGradient}
          />
        </Animated.View>

        {/* Middle Triangle */}
        <Animated.View style={[styles.shape, styles.middleTriangle, {
          transform: [
            { rotate: spin },
            { scale }
          ]
        }]}>
          <LinearGradient
            colors={['rgba(250,196,67,0.2)', 'rgba(250,196,67,0.05)']}
            style={styles.triangleGradient}
          />
        </Animated.View>

        {/* Floating Dots */}
        {[...Array(5)].map((_, i) => (
          <Animatable.View
            key={`dot-${i}`}
            animation="pulse"
            easing="ease-in-out"
            iterationCount="infinite"
            duration={2000 + (i * 300)}
            style={[
              styles.floatingDot,
              {
                top: `${20 + (i * 15)}%`,
                left: `${10 + (i * 20)}%`,
                backgroundColor: i % 2 === 0 ? '#FAC443' : '#92ACEC',
              }
            ]}
          />
        ))}
      </View>

      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        {[...Array(20)].map((_, i) => (
          <Animatable.View
            key={i}
            animation="pulse"
            easing="ease-out"
            iterationCount="infinite"
            duration={2000 + (i * 200)}
            style={[
              styles.patternItem,
              {
                top: Math.random() * height,
                left: Math.random() * width,
                opacity: 0.03,
                transform: [{ rotate: `${Math.random() * 360}deg` }]
              }
            ]}
          >
            <FontAwesome5 
              name={['shopping-cart', 'shopping-bag', 'store'][Math.floor(Math.random() * 3)]} 
              size={30} 
              color="#004AAD" 
            />
          </Animatable.View>
        ))}
      </View>

      {/* Curved Line */}
      <Animated.View style={[styles.curvedLine, { transform: [{ rotate: spin }] }]}>
        <Svg height={height * 1.5} width={width * 1.5} style={{ position: 'absolute', top: -height * 0.25, left: -width * 0.25 }}>
          <Circle
            cx={width * 0.75}
            cy={height * 0.75}
            r={width * 0.6}
            stroke="#FAC443"
            strokeWidth="1"
            fill="none"
            opacity={0.2}
          />
          <Circle
            cx={width * 0.75}
            cy={height * 0.75}
            r={width * 0.7}
            stroke="#92ACEC"
            strokeWidth="1"
            fill="none"
            opacity={0.1}
          />
        </Svg>
      </Animated.View>

      {/* Main Content */}
      <Animated.View 
        style={[styles.content, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}
      >
        {/* Product Image */}
        <Animatable.View 
          animation="fadeIn" 
          delay={800} 
          style={styles.imageContainer}
        >
          <Animatable.Image
            animation="pulse"
            iterationCount="infinite"
            duration={3000}
            source={require('../assets/loogo.png')}
            style={styles.productImage}
          />
        </Animatable.View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Animatable.Text 
            animation="fadeInUp" 
            delay={1000} 
            style={styles.bigTitle}
          >
            Bi3LY
          </Animatable.Text>
          <Animatable.Text 
            animation="fadeInUp" 
            delay={1200} 
            style={[styles.bigTitle, styles.secondTitle]}
          >
            تجربة تسوق مميزة
          </Animatable.Text>
          
          <Animatable.Text 
            animation="fadeInUp" 
            delay={1400} 
            style={styles.subtitle}
          >
            اكتشف عالماً من المنتجات المميزة
          </Animatable.Text>
        </View>

        {/* Get Started Button */}
        <Animatable.View 
          animation="fadeInUp" 
          delay={1600} 
          style={styles.buttonContainer}
        >
          <TouchableOpacity 
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FAC443', '#F9A826']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>ابدأ التسوق</Text>
              <FontAwesome5 name="arrow-left" size={16} color="#004AAD" />
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternItem: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  curvedLine: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: height * 0.05,
  },
  productImage: {
    width: width * 0.7,
    height: width * 0.7,
    resizeMode: 'contain',
  },
  textContent: {
    marginTop: height * 0.05,
  },
  bigTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#004AAD',
    textAlign: 'right',
    lineHeight: 60,
  },
  secondTitle: {
    color: '#92ACEC',
    fontSize: 42,
  },
  subtitle: {
    fontSize: 18,
    color: '#004AAD',
    marginTop: 16,
    textAlign: 'right',
    opacity: 0.8,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 40,
  },
  button: {
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#FAC443',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004AAD',
  },
  shapesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shape: {
    position: 'absolute',
    overflow: 'hidden',
  },
  shapeGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  triangleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    transform: [{ rotate: '45deg' }],
  },
  topRightCircle: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    top: -width * 0.1,
    right: -width * 0.1,
  },
  bottomLeftSquare: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: 30,
    bottom: width * 0.1,
    left: -width * 0.1,
  },
  middleTriangle: {
    width: width * 0.25,
    height: width * 0.25,
    right: width * 0.2,
    top: height * 0.4,
  },
  floatingDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.3,
  },
});

export default WelcomeScreen; 