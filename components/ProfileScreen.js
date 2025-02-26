import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, ScrollView, Platform, Dimensions, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clientService } from '../services/clientService';
import * as ImagePicker from 'expo-image-picker';
import CustomAlert from './CustomAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';
import { StatusBar } from 'expo-status-bar';
import { SharedElement } from 'react-navigation-shared-element';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shadow } from 'react-native-shadow-2';
import { Easing } from 'react-native-reanimated';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Animated } from 'react-native';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 280;

const AnimatedBackground = () => (
  <Animatable.View
    animation="fadeIn"
    duration={1500}
    style={[StyleSheet.absoluteFill, styles.animatedBg]}
  >
    <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['rgba(61,71,133,0.3)', 'rgba(146,172,236,0.3)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </BlurView>
  </Animatable.View>
);

const ProfileScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: 'https://via.placeholder.com/150'
  });
  const [addresses, setAddresses] = useState([]);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [activeRole, setActiveRole] = useState('client');
  const [isEditing, setIsEditing] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    fullName: '',
    phoneNumber: '',
    wilaya: '',
    moughataa: '',
    street: '',
    buildingNo: '',
    apartmentNo: '',
    additionalDirections: ''
  });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showAlert, setShowAlert] = useState({
    visible: false,
    message: '',
    type: 'info'
  });
  const [secureTextEntries, setSecureTextEntries] = useState({
    current: true,
    new: true,
    confirm: true
  });
  const [focusedInput, setFocusedInput] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressData, setAddressData] = useState({
    title: '',
    fullName: '',
    phoneNumber: '',
    wilaya: '',
    moughataa: '',
    street: '',
    buildingNo: '',
    apartmentNo: '',
    additionalDirections: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showAddresses, setShowAddresses] = useState(false);

  useEffect(() => {
    loadProfile();
    loadRoles();
    loadAddresses();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await clientService.getProfile();
      if (response.success) {
        const { name, email, phoneNumber, avatar } = response.data;
        setUserData({
          name: name || '',
          email: email || '',
          phone: phoneNumber || '',
          avatar: avatar || 'https://via.placeholder.com/150'
        });
      }
    } catch (error) {
      console.error('Load profile error:', error);
      setShowAlert({
        visible: true,
        message: 'حدث خطأ أثناء تحميل الملف الشخصي',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const roles = await AsyncStorage.getItem('availableRoles');
      const role = await AsyncStorage.getItem('activeRole');
      if (roles) setAvailableRoles(JSON.parse(roles));
      if (role) setActiveRole(role);
    } catch (error) {
      console.error('Load roles error:', error);
    }
  };

  const loadAddresses = async () => {
    try {
      const response = await clientService.getAddresses();
      if (response.success) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error('Load addresses error:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل العناوين');
    }
  };

  const handleAddAddress = async () => {
    try {
      setLoading(true);
      const response = await clientService.addAddress(addressData);
      if (response.success) {
        setShowAlert({
          visible: true,
          message: 'تمت إضافة العنوان بنجاح',
          type: 'success'
        });
        loadAddresses();
        setShowAddressModal(false);
        resetAddressForm();
      }
    } catch (error) {
      setShowAlert({
        visible: true,
        message: 'حدث خطأ أثناء إضافة العنوان',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = async () => {
    try {
      setLoading(true);
      const response = await clientService.updateAddress(selectedAddress._id, addressData);
      if (response.success) {
        setShowAlert({
          visible: true,
          message: 'تم تحديث العنوان بنجاح',
          type: 'success'
        });
        loadAddresses();
        setShowAddressModal(false);
        resetAddressForm();
      }
    } catch (error) {
      setShowAlert({
        visible: true,
        message: 'حدث خطأ أثناء تحديث العنوان',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      setLoading(true);
      const response = await clientService.deleteAddress(addressId);
      if (response.success) {
        setShowAlert({
          visible: true,
          message: 'تم حذف العنوان بنجاح',
          type: 'success'
        });
        loadAddresses();
      }
    } catch (error) {
      setShowAlert({
        visible: true,
        message: 'حدث خطأ أثناء حذف العنوان',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      setLoading(true);
      const response = await clientService.setDefaultAddress(addressId);
      if (response.success) {
        setShowAlert({
          visible: true,
          message: 'تم تعيين العنوان الافتراضي بنجاح',
          type: 'success'
        });
        loadAddresses();
      }
    } catch (error) {
      setShowAlert({
        visible: true,
        message: 'حدث خطأ أثناء تعيين العنوان الافتراضي',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAddressForm = () => {
    setAddressData({
      title: '',
      fullName: '',
      phoneNumber: '',
      wilaya: '',
      moughataa: '',
      street: '',
      buildingNo: '',
      apartmentNo: '',
      additionalDirections: ''
    });
    setSelectedAddress(null);
    setValidationErrors({});
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const formData = new FormData();
        formData.append('image', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        });

        setLoading(true);
        const response = await clientService.updateProfile(formData);
        
        if (response.success) {
          setUserData(prev => ({
            ...prev,
            avatar: response.data.avatar
          }));
          setShowAlert({
            visible: true,
            message: 'تم تحديث الصورة الشخصية بنجاح',
            type: 'success'
          });
        }
      }
    } catch (error) {
      console.error('Update avatar error:', error);
      setShowAlert({
        visible: true,
        message: 'حدث خطأ أثناء تحديث الصورة الشخصية',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    setPasswordStrength(score);
  };

  const handleChangePassword = async () => {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData;
      
      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        setShowAlert({
          visible: true,
          message: 'جميع الحقول مطلوبة',
          type: 'error'
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        setShowAlert({
          visible: true,
          message: 'كلمة المرور الجديدة غير متطابقة',
          type: 'error'
        });
        return;
      }

      if (newPassword.length < 6) {
        setShowAlert({
          visible: true,
          message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل',
          type: 'error'
        });
        return;
      }

      setLoading(true);
      const response = await clientService.changePassword({
        currentPassword,
        newPassword
      });

      if (response.success) {
        setShowAlert({
          visible: true,
          message: 'تم تغيير كلمة المرور بنجاح',
          type: 'success'
        });
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setShowAlert({
        visible: true,
        message: error.message || 'حدث خطأ أثناء تغيير كلمة المرور',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', userData.name);
      
      const response = await clientService.updateProfile(formData);
      if (response.success) {
        setShowAlert({
          visible: true,
          message: 'تم تحديث الاسم بنجاح',
          type: 'success'
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Save profile error:', error);
      setShowAlert({
        visible: true,
        message: 'حدث خطأ أثناء تحديث الاسم',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      setShowAlert({
        visible: true,
        message: 'حدث خطأ أثناء تسجيل الخروج',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setLogoutModalVisible(false);
    }
  };

  const switchRole = async () => {
    try {
      const newRole = activeRole === 'client' ? 'seller' : 'client';
        await AsyncStorage.setItem('activeRole', newRole);
      navigation.replace(newRole === 'seller' ? 'SellerMain' : 'ClientMain');
    } catch (error) {
      console.error('Role switch error:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تبديل الدور');
    }
  };

  const doPasswordsMatch = () => {
    return passwordData.newPassword && 
           passwordData.confirmPassword && 
           passwordData.newPassword === passwordData.confirmPassword;
  };

  const renderPasswordModal = () => (
    <Modal
      visible={showPasswordModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowPasswordModal(false)}
    >
      <View style={styles.logoutModalContainer}>
        <Animatable.View 
          animation="zoomIn" 
          duration={300}
          style={[styles.logoutModalContent, styles.passwordModalContent]}
        >
          <Animatable.View 
            animation={loading ? "pulse" : null}
            iterationCount="infinite"
            style={styles.passwordIconContainer}
          >
            <LinearGradient
              colors={['#3d4785', '#92ACEC']}
              style={styles.passwordIconGradient}
            >
              <MaterialIcons name="lock" size={32} color="#fff" />
            </LinearGradient>
          </Animatable.View>

          <Text style={styles.passwordTitle}>تغيير كلمة المرور</Text>
          
          <View style={styles.passwordInputContainer}>
            <Animatable.View 
              animation={focusedInput === 'current' ? 'pulse' : null}
              style={[
                styles.inputWrapper,
                focusedInput === 'current' && styles.inputWrapperFocused
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="كلمة المرور الحالية"
                secureTextEntry={secureTextEntries.current}
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
                placeholderTextColor="#666"
                onFocus={() => setFocusedInput('current')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity 
                onPress={() => setSecureTextEntries(prev => ({ ...prev, current: !prev.current }))}
                style={styles.eyeIcon}
              >
                <MaterialIcons 
                  name={secureTextEntries.current ? "visibility-off" : "visibility"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
              <MaterialIcons name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
            </Animatable.View>

            <Animatable.View 
              animation={focusedInput === 'new' ? 'pulse' : null}
              style={[
                styles.inputWrapper,
                focusedInput === 'new' && styles.inputWrapperFocused
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="كلمة المرور الجديدة"
                secureTextEntry={secureTextEntries.new}
                value={passwordData.newPassword}
                onChangeText={(text) => {
                  setPasswordData(prev => ({ ...prev, newPassword: text }));
                  checkPasswordStrength(text);
                }}
                placeholderTextColor="#666"
                onFocus={() => setFocusedInput('new')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity 
                onPress={() => setSecureTextEntries(prev => ({ ...prev, new: !prev.new }))}
                style={styles.eyeIcon}
              >
                <MaterialIcons 
                  name={secureTextEntries.new ? "visibility-off" : "visibility"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
              <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
            </Animatable.View>

            {passwordData.newPassword.length > 0 && (
              <Animatable.View 
                animation="fadeIn"
                style={styles.strengthContainer}
              >
                <View style={styles.strengthBar}>
                  <Animatable.View 
                    animation="fadeIn"
                    duration={500}
                    style={[
                      styles.strengthFill,
                      { width: `${passwordStrength}%` },
                      passwordStrength <= 25 && styles.strengthWeak,
                      passwordStrength <= 50 && passwordStrength > 25 && styles.strengthMedium,
                      passwordStrength <= 75 && passwordStrength > 50 && styles.strengthGood,
                      passwordStrength > 75 && styles.strengthStrong,
                    ]}
                  />
                </View>
                <Animatable.Text 
                  animation="fadeIn" 
                  style={styles.strengthText}
                >
                  {passwordStrength <= 25 && 'ضعيف'}
                  {passwordStrength <= 50 && passwordStrength > 25 && 'متوسط'}
                  {passwordStrength <= 75 && passwordStrength > 50 && 'جيد'}
                  {passwordStrength > 75 && 'قوي'}
                </Animatable.Text>
              </Animatable.View>
            )}

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="تأكيد كلمة المرور الجديدة"
                secureTextEntry={secureTextEntries.confirm}
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
                placeholderTextColor="#666"
                onFocus={() => setFocusedInput('confirm')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity 
                onPress={() => setSecureTextEntries(prev => ({ ...prev, confirm: !prev.confirm }))}
                style={styles.eyeIcon}
              >
                <MaterialIcons 
                  name={secureTextEntries.confirm ? "visibility-off" : "visibility"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
              <Animatable.View
                animation={doPasswordsMatch() ? "pulse" : undefined}
                iterationCount="infinite"
                duration={1500}
                style={[
                  styles.checkIconContainer,
                  doPasswordsMatch() && styles.checkIconContainerActive
                ]}
              >
                <MaterialIcons 
                  name="check-circle" 
                  size={22} 
                  color={doPasswordsMatch() ? '#4CAF50' : '#ddd'} 
                />
              </Animatable.View>
            </View>
          </View>

          <View style={styles.passwordButtons}>
            <TouchableOpacity 
              style={styles.passwordCancelButton}
              onPress={() => setShowPasswordModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.passwordCancelText}>إلغاء</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.passwordConfirmButton}
              onPress={handleChangePassword}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.passwordConfirmText}>تغيير</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  const renderHeader = () => (
    <Animatable.View 
      animation="fadeIn" 
      duration={800} 
      style={styles.header}
    >
      <LinearGradient
        colors={['#3d4785', '#92ACEC']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={handleImagePick} 
            style={styles.avatarContainer}
          >
            <Animatable.Image 
              animation="fadeIn"
              duration={600}
              source={{ uri: userData.avatar }} 
              style={styles.avatar}
            />
            <View style={styles.editAvatarButton}>
              <MaterialIcons name="camera-alt" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={userData.name}
                onChangeText={(text) => setUserData(prev => ({ ...prev, name: text }))}
                placeholder="أدخل اسمك"
                placeholderTextColor="rgba(255,255,255,0.7)"
              />
            ) : (
              <Text style={styles.userName}>{userData.name}</Text>
            )}
            <Text style={styles.userEmail}>{userData.email}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animatable.View>
  );

  const renderStats = () => (
    <Animatable.View 
      animation="fadeInUp"
      delay={300}
      duration={600}
      style={styles.statsCard}
    >
      <BlurView intensity={80} tint="light" style={styles.statsContent}>
        <StatItem 
          label="الطلبات" 
          value="12" 
          icon="shopping-bag"
        />
        <View style={styles.statDivider} />
        <StatItem 
          label="المفضلة" 
          value="5" 
          icon="favorite"
        />
        <View style={styles.statDivider} />
        <StatItem 
          label="العناوين" 
          value={addresses.length.toString()}
          icon="location-on"
          onPress={() => setShowAddresses(true)}
        />
      </BlurView>
    </Animatable.View>
  );

  const StatItem = ({ label, value, icon, onPress }) => (
    <TouchableOpacity 
      style={styles.statItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.statIconContainer}>
        <LinearGradient
          colors={['#3d4785', '#92ACEC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statIconGradient}
        >
          <MaterialIcons name={icon} size={22} color="#fff" />
        </LinearGradient>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderSettings = () => (
    <Animatable.View 
      animation="fadeInUp"
      delay={400}
      duration={600}
      style={styles.settingsContainer}
    >
      <Text style={styles.sectionTitle}>الإعدادات</Text>
      <View style={styles.settingsCard}>
        <SettingItem 
          title="تعديل الملف الشخصي"
          icon="person"
          onPress={() => setIsEditing(true)}
        />
        <SettingItem 
          title="تغيير كلمة المرور"
          icon="lock-closed"
          onPress={() => setShowPasswordModal(true)}
        />
        <SettingItem 
          title="العناوين المحفوظة"
          icon="location"
          onPress={() => setShowAddressModal(true)}
        />
        {availableRoles.includes('seller') && (
          <SettingItem 
            title={activeRole === 'client' ? 'التبديل إلى حساب البائع' : 'التبديل إلى حساب المستخدم'}
            icon="swap-horizontal"
            onPress={switchRole}
          />
        )}
        <SettingItem 
          title="تسجيل الخروج"
          icon="log-out"
          onPress={() => setLogoutModalVisible(true)}
          color="#ff6b6b"
        />
      </View>
    </Animatable.View>
  );

  const SettingItem = ({ title, icon, onPress, color = '#3d4785' }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.settingText}>{title}</Text>
      <View style={[styles.settingIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
    </TouchableOpacity>
  );

  const renderLogoutModal = () => (
    <Modal
      transparent={true}
      visible={isLogoutModalVisible}
      animationType="fade"
      onRequestClose={() => setLogoutModalVisible(false)}
    >
      <View style={styles.logoutModalContainer}>
        <Animatable.View 
          animation="zoomIn" 
          duration={300}
          style={styles.logoutModalContent}
        >
          <View style={styles.logoutIconContainer}>
            <LinearGradient
              colors={['#ff6b6b', '#ff8787']}
              style={styles.logoutIconGradient}
            >
              <MaterialIcons name="logout" size={32} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.logoutTitle}>تسجيل الخروج</Text>
          <Text style={styles.logoutMessage}>
            هل أنت متأكد أنك تريد تسجيل الخروج من التطبيق؟
          </Text>

          <View style={styles.logoutButtons}>
            <TouchableOpacity 
              style={styles.logoutCancelButton}
              onPress={() => setLogoutModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutCancelText}>إلغاء</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.logoutConfirmButton}
              onPress={handleLogout}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.logoutConfirmText}>تأكيد</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  const renderEditProfileModal = () => (
    <Modal
      visible={isEditing}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setIsEditing(false)}
    >
      <View style={styles.logoutModalContainer}>
        <Animatable.View 
          animation="zoomIn" 
          duration={300}
          style={[styles.logoutModalContent, styles.editProfileContent]}
        >
          <View style={styles.editProfileIconContainer}>
            <LinearGradient
              colors={['#3d4785', '#92ACEC']}
              style={styles.editProfileIconGradient}
            >
              <MaterialIcons name="edit" size={32} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.editProfileTitle}>تعديل الملف الشخصي</Text>

          <View style={styles.editProfileInputs}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.editProfileInput}
                value={userData.name}
                onChangeText={(text) => setUserData(prev => ({ ...prev, name: text }))}
                placeholder="الاسم الكامل"
                placeholderTextColor="#666"
              />
              <MaterialIcons name="person" size={20} color="#666" style={styles.inputIcon} />
            </View>

            <View style={[styles.inputWrapper, styles.disabledInput]}>
              <TextInput
                style={styles.editProfileInput}
                value={userData.email}
                editable={false}
                placeholder="البريد الإلكتروني"
                placeholderTextColor="#666"
              />
              <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.editProfileInput}
                value={userData.phone}
                onChangeText={(text) => setUserData(prev => ({ ...prev, phone: text }))}
                placeholder="رقم الهاتف"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={handleKeyboardDone}
              />
              <MaterialIcons name="phone" size={20} color="#666" style={styles.inputIcon} />
            </View>
          </View>

          <View style={styles.editProfileButtons}>
            <TouchableOpacity 
              style={styles.editProfileCancelButton}
              onPress={() => setIsEditing(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.editProfileCancelText}>إلغاء</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.editProfileSaveButton}
              onPress={saveProfile}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.editProfileSaveText}>حفظ</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  const renderAddressModal = () => (
    <Modal
      visible={showAddressModal}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCloseAddressModal}
    >
      <View style={styles.addressesModalContainer}>
        <Animatable.View 
          animation="slideInUp"
          duration={300}
          style={styles.addressesModalContent}
        >
          <View style={styles.addressesHeader}>
            <TouchableOpacity 
              onPress={handleCloseAddressModal}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.addressesTitle}>
              {selectedAddress ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
            </Text>
            <View style={{ width: 40 }} /> {/* For balance */}
          </View>

          <ScrollView 
            style={styles.addressFormContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Title Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>عنوان العنوان</Text>
              <View style={[styles.formInput, focusedInput === 'title' && styles.formInputFocused]}>
                <TextInput
                  value={addressData.title}
                  onChangeText={(text) => setAddressData(prev => ({ ...prev, title: text }))}
                  placeholder="مثال: المنزل، العمل"
                  placeholderTextColor="#999"
                  style={styles.input}
                  onFocus={() => setFocusedInput('title')}
                  onBlur={() => setFocusedInput(null)}
                />
                <MaterialIcons name="home" size={20} color="#666" />
              </View>
              {validationErrors.title && (
                <Text style={styles.errorText}>{validationErrors.title}</Text>
              )}
            </View>

            {/* Full Name Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>الاسم الكامل</Text>
              <View style={[styles.formInput, focusedInput === 'fullName' && styles.formInputFocused]}>
                <TextInput
                  value={addressData.fullName}
                  onChangeText={(text) => setAddressData(prev => ({ ...prev, fullName: text }))}
                  placeholder="الاسم الكامل للمستلم"
                  placeholderTextColor="#999"
                  style={styles.input}
                  onFocus={() => setFocusedInput('fullName')}
                  onBlur={() => setFocusedInput(null)}
                />
                <MaterialIcons name="person" size={20} color="#666" />
              </View>
              {validationErrors.fullName && (
                <Text style={styles.errorText}>{validationErrors.fullName}</Text>
              )}
            </View>

            {/* Phone Number Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>رقم الهاتف</Text>
              <View style={[styles.formInput, focusedInput === 'phone' && styles.formInputFocused]}>
                <TextInput
                  value={addressData.phoneNumber}
                  onChangeText={(text) => setAddressData(prev => ({ ...prev, phoneNumber: text }))}
                  placeholder="رقم هاتف المستلم"
                  placeholderTextColor="#999"
                  style={styles.input}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                />
                <MaterialIcons name="phone" size={20} color="#666" />
              </View>
              {validationErrors.phoneNumber && (
                <Text style={styles.errorText}>{validationErrors.phoneNumber}</Text>
              )}
            </View>

            {/* Location Details */}
            <View style={styles.locationSection}>
              <Text style={styles.sectionTitle}>تفاصيل الموقع</Text>
              
              {/* Wilaya Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>الولاية</Text>
                <View style={[styles.formInput, focusedInput === 'wilaya' && styles.formInputFocused]}>
                  <TextInput
                    value={addressData.wilaya}
                    onChangeText={(text) => setAddressData(prev => ({ ...prev, wilaya: text }))}
                    placeholder="اختر الولاية"
                    placeholderTextColor="#999"
                    style={styles.input}
                    onFocus={() => setFocusedInput('wilaya')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <MaterialIcons name="location-city" size={20} color="#666" />
                </View>
                {validationErrors.wilaya && (
                  <Text style={styles.errorText}>{validationErrors.wilaya}</Text>
                )}
              </View>

              {/* Moughataa Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>المقاطعة</Text>
                <View style={[styles.formInput, focusedInput === 'moughataa' && styles.formInputFocused]}>
                  <TextInput
                    value={addressData.moughataa}
                    onChangeText={(text) => setAddressData(prev => ({ ...prev, moughataa: text }))}
                    placeholder="اختر المقاطعة"
                    placeholderTextColor="#999"
                    style={styles.input}
                    onFocus={() => setFocusedInput('moughataa')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <MaterialIcons name="location-on" size={20} color="#666" />
                </View>
                {validationErrors.moughataa && (
                  <Text style={styles.errorText}>{validationErrors.moughataa}</Text>
                )}
              </View>

              {/* Street Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>الشارع</Text>
                <View style={[styles.formInput, focusedInput === 'street' && styles.formInputFocused]}>
                  <TextInput
                    value={addressData.street}
                    onChangeText={(text) => setAddressData(prev => ({ ...prev, street: text }))}
                    placeholder="اسم أو رقم الشارع"
                    placeholderTextColor="#999"
                    style={styles.input}
                    onFocus={() => setFocusedInput('street')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <MaterialIcons name="add-road" size={20} color="#666" />
                </View>
                {validationErrors.street && (
                  <Text style={styles.errorText}>{validationErrors.street}</Text>
                )}
              </View>
            </View>

            {/* Additional Details */}
            <View style={styles.additionalSection}>
              <Text style={styles.sectionTitle}>تفاصيل إضافية</Text>
              
              {/* Building Number */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>رقم المبنى</Text>
                <View style={[styles.formInput, focusedInput === 'building' && styles.formInputFocused]}>
                  <TextInput
                    value={addressData.buildingNo}
                    onChangeText={(text) => setAddressData(prev => ({ ...prev, buildingNo: text }))}
                    placeholder="رقم المبنى (اختياري)"
                    placeholderTextColor="#999"
                    style={styles.input}
                    onFocus={() => setFocusedInput('building')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <MaterialIcons name="apartment" size={20} color="#666" />
                </View>
              </View>

              {/* Apartment Number */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>رقم الشقة</Text>
                <View style={[styles.formInput, focusedInput === 'apartment' && styles.formInputFocused]}>
                  <TextInput
                    value={addressData.apartmentNo}
                    onChangeText={(text) => setAddressData(prev => ({ ...prev, apartmentNo: text }))}
                    placeholder="رقم الشقة (اختياري)"
                    placeholderTextColor="#999"
                    style={styles.input}
                    onFocus={() => setFocusedInput('apartment')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <MaterialIcons name="meeting-room" size={20} color="#666" />
                </View>
              </View>

              {/* Additional Directions */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>توجيهات إضافية</Text>
                <View style={[styles.formInput, styles.textAreaInput, focusedInput === 'directions' && styles.formInputFocused]}>
                  <TextInput
                    value={addressData.additionalDirections}
                    onChangeText={(text) => setAddressData(prev => ({ ...prev, additionalDirections: text }))}
                    placeholder="علامات مميزة أو توجيهات إضافية (اختياري)"
                    placeholderTextColor="#999"
                    style={[styles.input, styles.textArea]}
                    multiline={true}
                    numberOfLines={3}
                    onFocus={() => setFocusedInput('directions')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <MaterialIcons name="info-outline" size={20} color="#666" style={styles.textAreaIcon} />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCloseAddressModal}
            >
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSaveAddress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {selectedAddress ? 'تحديث' : 'حفظ'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  // Add this function to handle keyboard done press
  const handleKeyboardDone = () => {
    Keyboard.dismiss();
  };

  // Add this component for rendering individual address cards
  const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      style={styles.addressCard}
    >
      <View style={styles.addressHeader}>
        <View style={styles.addressTitleContainer}>
          <MaterialIcons 
            name={address.isDefault ? "star" : "location-on"} 
            size={24} 
            color={address.isDefault ? "#FFD700" : "#3d4785"} 
          />
          <Text style={styles.addressTitle}>{address.title}</Text>
        </View>
        <View style={styles.addressActions}>
          <TouchableOpacity 
            onPress={() => onEdit(address)}
            style={[styles.addressAction, styles.editAction]}
          >
            <MaterialIcons name="edit" size={20} color="#3d4785" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => onDelete(address._id)}
            style={[styles.addressAction, styles.deleteAction]}
          >
            <MaterialIcons name="delete" size={20} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.addressDetails}>
        <Text style={styles.addressText}>{address.fullName}</Text>
        <Text style={styles.addressText}>{address.phoneNumber}</Text>
        <Text style={styles.addressText}>
          {`${address.wilaya}, ${address.moughataa}, ${address.street}`}
        </Text>
        {address.buildingNo && (
          <Text style={styles.addressText}>
            {`مبنى رقم: ${address.buildingNo}`}
            {address.apartmentNo && `, شقة رقم: ${address.apartmentNo}`}
          </Text>
        )}
        {address.additionalDirections && (
          <Text style={styles.addressDirections}>
            {address.additionalDirections}
          </Text>
        )}
      </View>

      {!address.isDefault && (
        <TouchableOpacity 
          style={styles.setDefaultButton}
          onPress={() => onSetDefault(address._id)}
        >
          <MaterialIcons name="star-outline" size={20} color="#3d4785" />
          <Text style={styles.setDefaultText}>تعيين كعنوان افتراضي</Text>
        </TouchableOpacity>
      )}
    </Animatable.View>
  );

  // Add this component for the address list view
  const AddressList = () => {
    const renderAddressList = () => {
      if (addresses.length === 0) {
        return (
          <Animatable.View 
            animation="fadeIn" 
            style={styles.noAddressContainer}
          >
            <MaterialIcons name="location-off" size={48} color="#666" />
            <Text style={styles.noAddressText}>لا توجد عناوين محفوظة</Text>
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={() => {
                resetAddressForm();
                setShowAddressModal(true);
              }}
            >
              <MaterialIcons name="add-location" size={24} color="#fff" />
              <Text style={styles.addAddressText}>إضافة عنوان جديد</Text>
            </TouchableOpacity>
          </Animatable.View>
        );
      }

      return addresses.map((address, index) => (
        <SwipeableAddressCard 
          key={address._id} 
          address={address}
          index={index}
        />
      ));
    };

    return (
      <ScrollView 
        style={styles.addressListContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderAddressList()}
      </ScrollView>
    );
  };

  // Add this component for swipeable address cards
  const SwipeableAddressCard = ({ address, index }) => {
    const swipeableRef = useRef(null);

    const renderRightActions = (progress, dragX) => {
      const scale = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      });

      return (
        <View style={styles.swipeActionContainer}>
          <TouchableOpacity
            style={[styles.swipeAction, styles.deleteSwipeAction]}
            onPress={() => {
              swipeableRef.current?.close();
              Alert.alert(
                'حذف العنوان',
                'هل أنت متأكد من حذف هذا العنوان؟',
                [
                  { text: 'إلغاء', style: 'cancel' },
                  { 
                    text: 'حذف',
                    style: 'destructive',
                    onPress: () => handleDeleteAddress(address._id)
                  }
                ]
              );
            }}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <MaterialIcons name="delete" size={24} color="#fff" />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.swipeAction, styles.editSwipeAction]}
            onPress={() => {
              swipeableRef.current?.close();
              handleEditPress(address);
            }}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <MaterialIcons name="edit" size={24} color="#fff" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 100}
      >
        <Swipeable
          ref={swipeableRef}
          renderRightActions={renderRightActions}
          rightThreshold={40}
        >
          <AddressCard
            address={address}
            onEdit={handleEditPress}
            onDelete={handleDeleteAddress}
            onSetDefault={handleSetDefaultAddress}
          />
        </Swipeable>
      </Animatable.View>
    );
  };

  // Add these validation functions
  const validateAddress = (data) => {
    const errors = {};
    
    if (!data.title?.trim()) errors.title = 'عنوان العنوان مطلوب';
    if (!data.fullName?.trim()) errors.fullName = 'الاسم الكامل مطلوب';
    if (!data.phoneNumber?.trim()) errors.phoneNumber = 'رقم الهاتف مطلوب';
    if (!data.wilaya?.trim()) errors.wilaya = 'الولاية مطلوبة';
    if (!data.moughataa?.trim()) errors.moughataa = 'المقاطعة مطلوبة';
    if (!data.street?.trim()) errors.street = 'الشارع مطلوب';

    // Phone number validation
    const phoneRegex = /^[0-9]{8}$/;
    if (data.phoneNumber && !phoneRegex.test(data.phoneNumber)) {
      errors.phoneNumber = 'رقم الهاتف يجب أن يتكون من 8 أرقام';
    }

    return errors;
  };

  // Add these handler functions
  const handleEditPress = (address) => {
    setSelectedAddress(address);
    setAddressData({
      title: address.title,
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      wilaya: address.wilaya,
      moughataa: address.moughataa,
      street: address.street,
      buildingNo: address.buildingNo,
      apartmentNo: address.apartmentNo,
      additionalDirections: address.additionalDirections
    });
    setShowAddressModal(true);
  };

  // Add this function to handle address modal close
  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    resetAddressForm();
  };

  // Add this function to handle address save
  const handleSaveAddress = async () => {
    const errors = validateAddress(addressData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setLoading(true);
      if (selectedAddress) {
        await handleEditAddress();
      } else {
        await handleAddAddress();
      }
    } catch (error) {
      console.error('Save address error:', error);
      setShowAlert({
        visible: true,
        message: 'حدث خطأ أثناء حفظ العنوان',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add this component for the addresses modal
  const AddressesModal = () => (
    <Modal
      visible={showAddresses}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddresses(false)}
    >
      <View style={styles.addressesModalContainer}>
        <Animatable.View 
          animation="slideInUp"
          duration={300}
          style={styles.addressesModalContent}
        >
          <View style={styles.addressesHeader}>
            <TouchableOpacity 
              onPress={() => setShowAddresses(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.addressesTitle}>العناوين المحفوظة</Text>
            <TouchableOpacity 
              onPress={() => {
                setShowAddresses(false);
                setShowAddressModal(true);
              }}
              style={styles.addButton}
            >
              <MaterialIcons name="add" size={24} color="#3d4785" />
            </TouchableOpacity>
          </View>

          {addresses.length === 0 ? (
            <View style={styles.emptyAddresses}>
              <MaterialIcons name="location-off" size={64} color="#ddd" />
              <Text style={styles.emptyText}>لا توجد عناوين محفوظة</Text>
              <TouchableOpacity 
                style={styles.addFirstAddress}
                onPress={() => {
                  setShowAddresses(false);
                  setShowAddressModal(true);
                }}
              >
                <MaterialIcons name="add-location" size={24} color="#fff" />
                <Text style={styles.addFirstAddressText}>إضافة عنوان جديد</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView 
              style={styles.addressesList}
              showsVerticalScrollIndicator={false}
            >
              {addresses.map((address, index) => (
                <Animatable.View
                  key={address._id}
                  animation="fadeInUp"
                  delay={index * 100}
                >
                  <View style={styles.addressCard}>
                    <View style={styles.addressCardHeader}>
                      <View style={styles.addressTitleRow}>
                        <MaterialIcons 
                          name={address.isDefault ? "star" : "location-on"} 
                          size={24} 
                          color={address.isDefault ? "#FFD700" : "#3d4785"} 
                        />
                        <Text style={styles.addressCardTitle}>{address.title}</Text>
                      </View>
                      <View style={styles.addressActions}>
                        <TouchableOpacity 
                          onPress={() => handleEditPress(address)}
                          style={[styles.addressAction, styles.editAction]}
                        >
                          <MaterialIcons name="edit" size={20} color="#3d4785" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => handleDeleteAddress(address._id)}
                          style={[styles.addressAction, styles.deleteAction]}
                        >
                          <MaterialIcons name="delete" size={20} color="#ff6b6b" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.addressInfo}>
                      <View style={styles.addressRow}>
                        <MaterialIcons name="person" size={18} color="#666" />
                        <Text style={styles.addressText}>{address.fullName}</Text>
                      </View>
                      <View style={styles.addressRow}>
                        <MaterialIcons name="phone" size={18} color="#666" />
                        <Text style={styles.addressText}>{address.phoneNumber}</Text>
                      </View>
                      <View style={styles.addressRow}>
                        <MaterialIcons name="location-on" size={18} color="#666" />
                        <Text style={styles.addressText}>
                          {`${address.wilaya}، ${address.moughataa}، ${address.street}`}
                        </Text>
                      </View>
                    </View>

                    {!address.isDefault && (
                      <TouchableOpacity 
                        style={styles.setDefaultButton}
                        onPress={() => handleSetDefaultAddress(address._id)}
                      >
                        <MaterialIcons name="star-outline" size={18} color="#3d4785" />
                        <Text style={styles.setDefaultText}>تعيين كعنوان افتراضي</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Animatable.View>
              ))}
            </ScrollView>
          )}
        </Animatable.View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3d4785" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#3d4785', '#92ACEC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBackground}
      />
      <LinearGradient
        colors={['#f8f9fa', '#fff']}
        style={styles.contentBackground}
      />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderStats()}
        {renderSettings()}
      </ScrollView>

      <AddressesModal />
      {renderPasswordModal()}
      {renderLogoutModal()}
      {renderEditProfileModal()}
      {renderAddressModal()}

      <CustomAlert
        visible={showAlert.visible}
        message={showAlert.message}
        type={showAlert.type}
        onClose={() => setShowAlert(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT + 50,
  },
  
  contentBackground: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
  },

  headerGradient: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    height: HEADER_HEIGHT,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    paddingBottom: 4,
    marginBottom: 8,
  },
  statsCard: {
    margin: 16,
    marginTop: -40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconGradient: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 15,
  },
  settingsContainer: {
    padding: 20,
    marginTop: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    marginRight: 4,
  },
  settingsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'right',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  confirmModalButton: {
    backgroundColor: '#3d4785',
  },
  cancelModalButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    width: '100%',
    textAlign: 'right',
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  saveButton: {
    backgroundColor: '#3d4785',
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#f0f2f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 4,
  },
  passwordInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#eee',
  },
  changePasswordButton: {
    backgroundColor: '#3d4785',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  changePasswordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModalContent: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
  },
  logoutIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
    shadowColor: '#ff6b6b',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  logoutIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  logoutMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  logoutButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  logoutCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
  },
  logoutConfirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
  },
  logoutCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  logoutConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  passwordModalContent: {
    width: '90%',
    padding: 24,
  },
  passwordIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
    shadowColor: '#3d4785',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  passwordIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 24,
    textAlign: 'center',
  },
  passwordInputContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginLeft: 12,
  },
  passwordButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  passwordCancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
  },
  passwordConfirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#3d4785',
    alignItems: 'center',
  },
  passwordCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  passwordConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  inputWrapperFocused: {
    borderColor: '#3d4785',
    backgroundColor: '#fff',
    shadowColor: '#3d4785',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  strengthContainer: {
    width: '100%',
    marginTop: -8,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthWeak: {
    backgroundColor: '#ff6b6b',
  },
  strengthMedium: {
    backgroundColor: '#ffd93d',
  },
  strengthGood: {
    backgroundColor: '#6bcb77',
  },
  strengthStrong: {
    backgroundColor: '#4d96ff',
  },
  strengthText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  checkIconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderRadius: 15,
  },
  checkIconContainerActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  editProfileContent: {
    width: '90%',
    padding: 24,
  },
  editProfileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
    shadowColor: '#3d4785',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  editProfileIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editProfileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 24,
    textAlign: 'center',
  },
  editProfileInputs: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  editProfileInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    textAlign: 'right',
    color: '#2c3e50',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  editProfileButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  editProfileCancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
  },
  editProfileSaveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#3d4785',
    alignItems: 'center',
  },
  editProfileCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  editProfileSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  addressesModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  addressesModalContent: {
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 20,
  },
  addressesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  addressesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
  },
  emptyAddresses: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  addFirstAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3d4785',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstAddressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addressesList: {
    flex: 1,
  },
  addressFormContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'right',
  },
  formInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 16,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    color: '#2c3e50',
    paddingVertical: 8,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  locationSection: {
    marginBottom: 24,
  },
  additionalSection: {
    marginBottom: 24,
  },
  textAreaInput: {
    height: 100,
    alignItems: 'flex-start',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  textAreaIcon: {
    marginTop: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3d4785',
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 4,
  },
});

export default ProfileScreen; 