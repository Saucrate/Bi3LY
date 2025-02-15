import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from './CustomAlert';
import { authService } from '../services/authService';
import LoadingSpinner from './LoadingSpinner';
import { useNavigation } from '@react-navigation/native';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [role, setRole] = useState('client');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sellerInfo, setSellerInfo] = useState({
    idNumber: '',
    businessNumber: ''
  });
  const codeInputs = useRef([]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCodeChange = (text, index) => {
    if (text.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = text;
      setVerificationCode(newCode);

      // Sonraki input'a geç
      if (text.length === 1 && index < 5) {
        codeInputs.current[index + 1].focus();
      }
    }
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      const code = verificationCode.join('');

      if (code.length !== 6) {
        setAlertMessage('يرجى إدخال جميع الأرقام');
        setAlertVisible(true);
        return;
      }

      await authService.verifyEmail(email, code);
      setAlertMessage('تم التحقق بنجاح');
      setAlertVisible(true);
      
      setTimeout(() => {
        navigation.navigate('تسجيل الدخول');
      }, 2000);

    } catch (error) {
      setAlertMessage(error.toString());
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      // Form validasyonu
      if (!name || !email || !password || !phoneNumber) {
        setAlertMessage('يرجى ملء جميع الحقول المطلوبة');
        setAlertVisible(true);
        return;
      }

      if (!isValidEmail(email)) {
        setAlertMessage('يرجى إدخال بريد إلكتروني صالح');
        setAlertVisible(true);
        return;
      }

      setLoading(true);

      // Debug için
      console.log('Sending registration data:', {
        name,
        email,
        password,
        role,
        phoneNumber,
        sellerInfo: role === 'seller' ? sellerInfo : undefined
      });

      const response = await authService.register({
        name,
        email,
        password,
        role,
        phoneNumber,
        sellerInfo: role === 'seller' ? sellerInfo : undefined
      });
      
      if (response.success) {
        setAlertMessage('تم التسجيل بنجاح وتم إرسال رمز التحقق');
        setAlertVisible(true);
        setTimeout(() => {
          setStep(3);
        }, 1500);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAlertMessage(error.response?.data?.error || 'حدث خطأ في عملية التسجيل');
      setAlertVisible(true);
    } finally {
      setLoading(false);
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

  const handleNextStep = () => {
    // Tüm gerekli alanların kontrolü
    if (!name || !phoneNumber || !password || !confirmPassword) {
      setAlertMessage('يرجى ملء جميع الحقول المطلوبة');
      setAlertVisible(true);
      return;
    }

    // Şifre kontrolü
    if (password !== confirmPassword) {
      setAlertMessage('كلمات المرور غير متطابقة');
      setAlertVisible(true);
      return;
    }

    // Şifre uzunluğu kontrolü
    if (password.length < 6) {
      setAlertMessage('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      setAlertVisible(true);
      return;
    }

    // Satıcı rolü için ek kontroller
    if (role === 'seller') {
      if (!sellerInfo.idNumber || !sellerInfo.businessNumber) {
        setAlertMessage('يرجى إدخال جميع المعلومات المطلوبة');
        setAlertVisible(true);
        return;
      }

      // Kimlik numarası kontrolü (örnek: 11 haneli)
      if (sellerInfo.idNumber.length !== 11) {
        setAlertMessage('رقم الهوية يجب أن يكون 11 رقمًا');
        setAlertVisible(true);
        return;
      }

      // İş/Ticari sicil numarası kontrolü (örnek: en az 5 haneli)
      if (sellerInfo.businessNumber.length < 5) {
        setAlertMessage('رقم السجل التجاري يجب أن يكون 5 أرقام على الأقل');
        setAlertVisible(true);
        return;
      }
    }

    setStep(2);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Seller bilgileri için input alanları
  const renderSellerFields = () => {
    if (role !== 'seller') return null;

    return (
      <View style={[styles.inputContainer, styles.sellerContainer]}>
        <Text style={styles.documentsTitle}>معلومات البائع المطلوبة</Text>
        
        <View style={styles.inputSection}>
          <Ionicons name="card-outline" size={20} color="#4a4a4a" />
          <TextInput
            style={styles.input}
            placeholder="رقم الهوية (11 رقم)"
            value={sellerInfo.idNumber}
            onChangeText={(text) => setSellerInfo(prev => ({...prev, idNumber: text}))}
            keyboardType="numeric"
            maxLength={11}
          />
        </View>

        <View style={[styles.inputSection, { marginTop: 15 }]}>
          <Ionicons name="business-outline" size={20} color="#4a4a4a" />
          <TextInput
            style={styles.input}
            placeholder="رقم السجل التجاري"
            value={sellerInfo.businessNumber}
            onChangeText={(text) => setSellerInfo(prev => ({...prev, businessNumber: text}))}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>
      </View>
    );
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
        <Image
          source={require('../assets/icon.png')}
          style={styles.logo}
        />

        {/* İlk Adım - Kişisel Bilgiler */}
        {step === 1 && (
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
            <TouchableOpacity style={styles.loginButton} onPress={handleNextStep}>
              <Text style={styles.loginButtonText}>التالي</Text>
            </TouchableOpacity>
          </>
        )}

        {/* İkinci Adım - Email Girişi */}
        {step === 2 && (
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

        {/* Üçüncü Adım - Doğrulama Kodu */}
        {step === 3 && (
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
            <View style={styles.verificationActions}>
              <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyCode}>
                <Text style={styles.buttonText}>تحقق</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.resendButton} 
                onPress={async () => {
                  try {
                    setLoading(true);
                    await authService.sendVerificationCode(email);
                    setVerificationCode(['', '', '', '', '', '']); // Inputları temizle
                    setAlertMessage('تم إرسال رمز جديد');
                    setAlertVisible(true);
                  } catch (error) {
                    setAlertMessage(error.toString());
                    setAlertVisible(true);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <Text style={styles.resendButtonText}>إعادة إرسال الرمز</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <CustomAlert
          visible={alertVisible}
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
        />
        {role === 'seller' && renderSellerFields()}
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  codeInput: {
    width: 45,
    height: 45,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
    marginHorizontal: 2,
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
  verificationActions: {
    alignItems: 'center',
    gap: 10,
  },
  resendButton: {
    marginTop: 10,
    padding: 5,
  },
  resendButtonText: {
    color: '#3d4785',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  sellerContainer: {
    marginTop: 10,
    width: '90%',
  },
  documentsTitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  documentPreview: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginLeft: 'auto'
  },
  documentUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  documentUploaded: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  documentText: {
    marginLeft: 10,
    color: '#333',
    fontSize: 14,
  },
});

export default SignUpScreen;