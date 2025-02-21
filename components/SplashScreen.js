import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const SplashScreen = () => {
  const navigation = useNavigation();

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token);

      if (!token) {
        console.log('No token found, redirecting to ClientMain');
        navigation.replace('ClientMain');
        return;
      }

      try {
        console.log('Making profile request with token...');
        const response = await axios.get('http://192.168.100.219:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Profile response:', response.data);

        if (response.data.success) {
          const userRole = response.data.data.role;
          console.log('User role from backend:', userRole);

          await AsyncStorage.setItem('activeRole', userRole);

          switch (userRole) {
            case 'admin':
              console.log('Redirecting to AdminMain');
              navigation.replace('AdminMain');
              break;
            case 'seller':
              console.log('Redirecting to SellerMain');
              navigation.replace('SellerMain');
              break;
            default:
              console.log('Redirecting to ClientMain');
              navigation.replace('ClientMain');
          }
        } else {
          console.log('Invalid response from server, redirecting to ClientMain');
          await AsyncStorage.multiRemove(['token', 'activeRole']);
          navigation.replace('ClientMain');
        }
      } catch (error) {
        console.error('Profile request error:', error.response?.data || error.message);
        await AsyncStorage.multiRemove(['token', 'activeRole']);
        navigation.replace('ClientMain');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      navigation.replace('ClientMain');
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
