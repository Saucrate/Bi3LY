import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Animated, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from './CustomAlert';
import * as ImagePicker from 'expo-image-picker';

const SignUpScreen = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '']);
  const [name, setName] = useState('');
  const [role, setRole] = useState('client');
  const [idCardImage, setIdCardImage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sellerProofImage, setSellerProofImage] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const codeInputs = useRef([]);
  const [showImagePickerAlert, setShowImagePickerAlert] = useState(false);
  const [currentImageSetter, setCurrentImageSetter] = useState(null);
  const [image, setImage] = useState(null);

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

  const handleVerifyEmail = () => {
    if (!email) {
      setAlertMessage('يرجى إدخال البريد الإلكتروني');
      setAlertVisible(true);
    } else if (!isValidEmail(email)) {
      setAlertMessage('يرجى إدخال بريد إلكتروني صالح');
      setAlertVisible(true);
    } else {
      setStep(2);
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode.join('') === '00001') {
      setStep(3);
    } else {
      setAlertMessage('رمز التحقق غير صحيح');
      setAlertVisible(true);
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

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      setAlertMessage('كلمات المرور غير متطابقة');
      setAlertVisible(true);
    } else {
      // Handle sign-up logic here
    }
  };

  const pickImage = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photo library to select photos.');
      return;
    }

    // Launch image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request permission to access camera
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your camera to take photos.');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const showImagePickerOptions = (setImage) => {
    setCurrentImageSetter(() => (uri) => {
      if (setImage === setIdCardImage) {
        setIdCardImage({ uri });
      } else if (setImage === setSellerProofImage) {
        setSellerProofImage({ uri });
      }
    });
    setShowImagePickerAlert(true);
  };

  const selectImage = (setImage) => {
    showImagePickerOptions(setImage);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    // <KeyboardAvoidingView
    //   // style={{ flex: 1 }}
    //   // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    //   // keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    // >
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollView}>
        <View style={styles.container}>
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
              <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyEmail}>
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
              <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyCode}>
                <Text style={styles.buttonText}>تحقق</Text>
              </TouchableOpacity>
            </View>
          )}
          {step === 3 && (
            <>
              <View style={styles.inputContainer}>
                <View style={styles.inputSection}>
                  <Ionicons name="person-outline" size={20} color="#4a4a4a" />
                  <TextInput
                    style={styles.input}
                    placeholder="الاسم"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputSection}>
                  <Ionicons name="call-outline" size={20} color="#4a4a4a" />
                  <TextInput
                    style={styles.input}
                    placeholder="رقم الهاتف"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.roleText}>اختر دورك:</Text>
                <View style={styles.roleContainer}>
                  <TouchableOpacity
                    style={[styles.roleButton, role === 'client' && styles.selectedRole]}
                    onPress={() => setRole('client')}
                  >
                    <Text style={styles.buttonText}>عميل</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleButton, role === 'seller' && styles.selectedRole]}
                    onPress={() => setRole('seller')}
                  >
                    <Text style={styles.buttonText}>بائع</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {role === 'seller' && (
                <>
                  <View style={styles.inputContainer}>
                    <TouchableOpacity 
                      style={styles.imagePicker} 
                      onPress={() => {
                        console.log('ID Card Image Picker Clicked');
                        showImagePickerOptions(setIdCardImage);
                      }}
                    >
                      <Ionicons name="card-outline" size={20} color="#fff" />
                      <Text style={styles.buttonText}>اختر صورة الهوية</Text>
                    </TouchableOpacity>
                    {idCardImage && idCardImage.uri && (
                      <Image source={{ uri: idCardImage.uri }} style={styles.imagePreview} />
                    )}
                  </View>
                  <View style={styles.inputContainer}>
                    <TouchableOpacity 
                      style={styles.imagePicker} 
                      onPress={() => {
                        console.log('Seller Proof Image Picker Clicked');
                        showImagePickerOptions(setSellerProofImage);
                      }}
                    >
                      <Ionicons name="document-outline" size={20} color="#fff" />
                      <Text style={styles.buttonText}>اختر إثبات البائع</Text>
                    </TouchableOpacity>
                    {sellerProofImage && sellerProofImage.uri && (
                      <Image source={{ uri: sellerProofImage.uri }} style={styles.imagePreview} />
                    )}
                  </View>
                </>
              )}
              <View style={styles.inputContainer}>
                <View style={styles.inputSection}>
                  <Ionicons name="lock-closed-outline" size={20} color="#4a4a4a" />
                  <TextInput
                    style={styles.input}
                    placeholder="كلمة المرور"
                    value={password}
                    onChangeText={setPassword}
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
              <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
                <Text style={styles.loginButtonText}>تسجيل</Text>
              </TouchableOpacity>
            </>
          )}
          <CustomAlert
            visible={showImagePickerAlert}
            message={
              <View style={styles.alertOptions}>
                <TouchableOpacity 
                  style={styles.alertOption} 
                  onPress={pickImage}
                >
                  <Ionicons name="image" size={24} color="#3d4785" />
                  <Text style={styles.alertOptionText}>اختيار من المعرض</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.alertOption} 
                  onPress={takePhoto}
                >
                  <Ionicons name="camera" size={24} color="#3d4785" />
                  <Text style={styles.alertOptionText}>التقاط صورة</Text>
                </TouchableOpacity>
              </View>
            }
            onClose={() => setShowImagePickerAlert(false)}
          />
          <CustomAlert
            visible={alertVisible}
            message={alertMessage}
            onClose={() => setAlertVisible(false)}
          />
          {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
        </View>
      </ScrollView>
    // </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'hsl(218, 50%, 91%)',
    paddingBottom: 20,
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
    flexDirection: 'row', // Changed from 'row-reverse' to 'row'
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
  roleText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  roleButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  selectedRole: {
    backgroundColor: '#3d4785',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
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
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3d4785',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginTop: 10,
    alignSelf: 'center',
    borderRadius: 10,
  },
  alertOptions: {
    width: '100%',
    alignItems: 'center',
  },
  alertOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    width: '100%',
    justifyContent: 'center',
  },
  alertOptionText: {
    fontSize: 16,
    color: '#3d4785',
    marginLeft: 10,
    textAlign: 'center',
  },
});

export default SignUpScreen;