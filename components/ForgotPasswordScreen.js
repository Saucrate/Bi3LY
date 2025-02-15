import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from './CustomAlert';
import { authService } from '../services/authService';
import LoadingSpinner from './LoadingSpinner';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const codeInputs = useRef([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailVerification = async () => {
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      setStep(2);
    } catch (error) {
      setAlertMessage(error.toString());
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerification = async () => {
    try {
      setLoading(true);
      // Kodu doğrulama işlemi backend'de resetPassword sırasında yapılacak
      setStep(3);
    } catch (error) {
      setAlertMessage(error.toString());
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      setAlertMessage('كلمات المرور غير متطابقة');
      setAlertVisible(true);
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(email, verificationCode.join(''), newPassword);
      navigation.replace('Login');
    } catch (error) {
      setAlertMessage(error.toString());
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text, index) => {
    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);

    if (text && index < codeInputs.current.length - 1) {
      codeInputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0) {
      const newCode = [...verificationCode];
      newCode[index - 1] = '';
      setVerificationCode(newCode);
      codeInputs.current[index - 1].focus();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollView}>
      <View style={styles.container}>
        {loading && <LoadingSpinner />}
        {step > 1 && (
          <TouchableOpacity style={styles.backArrow} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        )}
        <Animated.Image
          source={require('../assets/icon.png')}
          style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
        />
        {step === 1 && (
          <View style={styles.inputContainer}>
            <View style={styles.inputSection}>
              <Ionicons name="mail-outline" size={20} color="#4a4a4a" />
              <TextInput
                style={styles.input}
                placeholder="البريد الإلكتروني"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>
            <TouchableOpacity style={styles.verifyButton} onPress={handleEmailVerification}>
              <Text style={styles.buttonText}>تحقق</Text>
            </TouchableOpacity>
          </View>
        )}
        {step === 2 && (
          <View style={styles.inputContainer}>
            <Text style={styles.verificationLabel}>أدخل رمز التحقق</Text>
            <View style={styles.codeInputContainer}>
              {verificationCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => (codeInputs.current[index] = el)}
                  style={styles.codeInput}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  onFocus={() => {
                    codeInputs.current[index].setNativeProps({
                      style: { borderColor: '#3d4785' },
                    });
                  }}
                  onBlur={() => {
                    codeInputs.current[index].setNativeProps({
                      style: { borderColor: '#000' },
                    });
                  }}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.verifyButton} onPress={handleCodeVerification}>
              <Text style={styles.buttonText}>تحقق</Text>
            </TouchableOpacity>
          </View>
        )}
        {step === 3 && (
          <>
            <View style={styles.inputContainer}>
              <View style={styles.inputSection}>
                <Ionicons name="lock-closed-outline" size={20} color="#4a4a4a" />
                <TextInput
                  style={styles.input}
                  placeholder="كلمة المرور الجديدة"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.inputSection}>
                <Ionicons name="lock-closed-outline" size={20} color="#4a4a4a" />
                <TextInput
                  style={styles.input}
                  placeholder="تأكيد كلمة المرور"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>
            <TouchableOpacity style={styles.loginButton} onPress={handlePasswordReset}>
              <Text style={styles.loginButtonText}>إعادة تعيين كلمة المرور</Text>
            </TouchableOpacity>
          </>
        )}
        <CustomAlert
          visible={alertVisible}
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'hsl(218, 50%, 91%)',
  },
  scrollView: {
    backgroundColor: 'hsl(218, 50%, 91%)',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
    paddingBottom: 100,
  },
  backArrow: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
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
  verificationLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  codeInputContainer: {
    flexDirection: 'row-reverse', // RTL support
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
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
  verifyButton: {
    backgroundColor: '#3d4785',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
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
});

export default ForgotPasswordScreen; 