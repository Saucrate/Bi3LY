import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const SplashScreen = () => {
  const navigation = useNavigation();

  const checkAuthStatus = async () => {
    try {
      // Always navigate to Welcome screen first
      navigation.replace('Welcome');
      return;

      // Comment out or remove the rest of the auth logic for now
      /* const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      ... rest of the code ... */
      
    } catch (error) {
      console.error('Auth check error:', error);
      navigation.replace('Welcome');
    }
  };

  useEffect(() => {
    console.log('SplashScreen mounted');
    const timer = setTimeout(checkAuthStatus, 2000);
    return () => {
      console.log('SplashScreen cleanup');
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/icon.png')}
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});

export default SplashScreen;
