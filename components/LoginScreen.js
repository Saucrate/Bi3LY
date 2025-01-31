import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from './CustomAlert';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(0)).current; // Initial scale value

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleLogin = () => {
    if (username === 'saucrate' && password === '12341234') {
      navigation.replace('ClientMain');
    } else if (username === 'osama' && password === '12341234') {
      navigation.replace('SellerMain');
    } else if (username === 'admin' && password === 'admin123') {
      navigation.replace('AdminMain');
    } else {
      setAlertVisible(true);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/icon.png')}
        style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
      />
      <View style={styles.inputContainer}>
        <Text style={styles.label}>اسم المستخدم</Text>
        <View style={styles.inputSection}>
          <Ionicons name="mail-outline" size={20} color="#4a4a4a" />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>كلمة المرور</Text>
        <View style={styles.inputSection}>
          <Ionicons name="lock-closed-outline" size={20} color="#4a4a4a" />
          <TextInput
            style={styles.input}
            placeholder="············"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#4a4a4a" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
      </TouchableOpacity>
      <CustomAlert
        visible={alertVisible}
        message="اسم المستخدم أو كلمة المرور غير صحيحة"
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'hsl(218, 50%, 91%)',
    padding: 20,
    paddingBottom: 100,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    color: '#4a4a4a',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    marginLeft: 10,
  },
  loginButton: {
    backgroundColor: '#3d4785',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
  },
  footerText: {
    color: '#4a4a4a',
    fontSize: 14,
  },
});

export default LoginScreen; 