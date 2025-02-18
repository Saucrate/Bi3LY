import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clientService } from '../services/clientService';
import * as ImagePicker from 'expo-image-picker';
import CustomAlert from './CustomAlert';

const ProfileScreen = () => {
  const navigation = useNavigation();
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
      if (!newAddress.fullName || !newAddress.phoneNumber || !newAddress.wilaya || 
          !newAddress.moughataa || !newAddress.street || !newAddress.title) {
        Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      setLoading(true);
      const response = await clientService.addAddress(newAddress);
      if (response.success) {
        setAddresses(response.data);
        setShowAddressModal(false);
        setNewAddress({
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
        Alert.alert('نجاح', 'تمت إضافة العنوان بنجاح');
      }
    } catch (error) {
      console.error('Add address error:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ في إضافة العنوان');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await clientService.deleteAddress(addressId);
      if (response.success) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error('Delete address error:', error);
      Alert.alert('خطأ', 'حدث خطأ في حذف العنوان');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await clientService.setDefaultAddress(addressId);
      if (response.success) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error('Set default address error:', error);
      Alert.alert('خطأ', 'حدث خطأ في تعيين العنوان الافتراضي');
    }
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

  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        Alert.alert('خطأ', 'كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين');
        return;
      }

      setLoading(true);
      const response = await clientService.changePassword(passwordData);
      
      if (response.success) {
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        Alert.alert('نجاح', 'تم تغيير كلمة المرور بنجاح');
      }
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء تغيير كلمة المرور');
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
      const response = await clientService.logout();
      if (response.success) {
      setLogoutModalVisible(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }]
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الخروج');
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

  const renderPasswordModal = () => (
    <Modal
      visible={showPasswordModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPasswordModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>تغيير كلمة المرور</Text>
          
          <TextInput
            style={styles.modalInput}
            placeholder="كلمة المرور الحالية"
            secureTextEntry
            value={passwordData.currentPassword}
            onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
          />
          
          <TextInput
            style={styles.modalInput}
            placeholder="كلمة المرور الجديدة"
            secureTextEntry
            value={passwordData.newPassword}
            onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
          />
          
          <TextInput
            style={styles.modalInput}
            placeholder="تأكيد كلمة المرور الجديدة"
            secureTextEntry
            value={passwordData.confirmPassword}
            onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleChangePassword}
            >
              <Text style={styles.saveButtonText}>حفظ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowPasswordModal(false)}
            >
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
          <TouchableOpacity onPress={() => setLogoutModalVisible(true)} style={styles.logoutIcon}>
          <FontAwesome name="sign-out" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleImagePick}>
            <Image source={{ uri: userData.avatar }} style={styles.profileImage} />
            <View style={styles.editIconContainer}>
              <FontAwesome name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          
          {isEditing ? (
        <TextInput
          style={styles.profileName}
              value={userData.name}
              onChangeText={(text) => setUserData(prev => ({ ...prev, name: text }))}
          placeholder="أدخل اسمك"
        />
          ) : (
            <Text style={styles.profileName}>{userData.name}</Text>
          )}
        </View>

      <View style={styles.profileDetails}>
        <Text style={styles.sectionTitle}>تفاصيل الحساب</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>البريد الإلكتروني:</Text>
            <Text style={styles.detailValue}>{userData.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>رقم الهاتف:</Text>
            <Text style={styles.detailValue}>{userData.phone}</Text>
          </View>
        </View>

      <View style={styles.settings}>
        <Text style={styles.sectionTitle}>الإعدادات</Text>
          <TouchableOpacity style={styles.settingItem} onPress={() => setShowPasswordModal(true)}>
          <Text style={styles.settingText}>تغيير كلمة المرور</Text>
          <FontAwesome name="angle-left" size={16} color="#666" />
        </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('NotificationSettings')}>
          <Text style={styles.settingText}>إعدادات الإشعارات</Text>
          <FontAwesome name="angle-left" size={16} color="#666" />
        </TouchableOpacity>
      </View>

        {isEditing ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
      <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
        <Text style={styles.saveButtonText}>حفظ التغييرات</Text>
      </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>تعديل الملف الشخصي</Text>
          </TouchableOpacity>
        )}

        {availableRoles.includes('seller') && (
          <TouchableOpacity style={styles.switchButton} onPress={switchRole}>
            <Text style={styles.switchButtonText}>
              {activeRole === 'client' ? 'التبديل إلى حساب البائع' : 'التبديل إلى حساب المستخدم'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.addressesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>العناوين</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddressModal(true)}
            >
              <Text style={styles.addButtonText}>إضافة عنوان</Text>
            </TouchableOpacity>
          </View>

          {addresses.map((address) => (
            <View key={address._id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressTitle}>{address.title}</Text>
                {address.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>افتراضي</Text>
                  </View>
                )}
              </View>
              <Text style={styles.addressText}>{address.fullName}</Text>
              <Text style={styles.addressText}>{address.phoneNumber}</Text>
              <Text style={styles.addressText}>
                {`${address.wilaya}, ${address.moughataa}, ${address.street}`}
              </Text>
              <View style={styles.addressActions}>
                {!address.isDefault && (
                  <TouchableOpacity
                    style={styles.setDefaultButton}
                    onPress={() => handleSetDefaultAddress(address._id)}
                  >
                    <Text style={styles.setDefaultText}>تعيين كافتراضي</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAddress(address._id)}
                >
                  <MaterialIcons name="delete" size={20} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إضافة عنوان جديد</Text>
            
            <TextInput
              style={styles.modalInput}
              value={newAddress.title}
              onChangeText={(text) => setNewAddress({ ...newAddress, title: text })}
              placeholder="عنوان العنوان (مثال: المنزل، العمل)"
            />
            <TextInput
              style={styles.modalInput}
              value={newAddress.fullName}
              onChangeText={(text) => setNewAddress({ ...newAddress, fullName: text })}
              placeholder="الاسم الكامل"
            />
            <TextInput
              style={styles.modalInput}
              value={newAddress.phoneNumber}
              onChangeText={(text) => setNewAddress({ ...newAddress, phoneNumber: text })}
              placeholder="رقم الهاتف"
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.modalInput}
              value={newAddress.wilaya}
              onChangeText={(text) => setNewAddress({ ...newAddress, wilaya: text })}
              placeholder="الولاية"
            />
            <TextInput
              style={styles.modalInput}
              value={newAddress.moughataa}
              onChangeText={(text) => setNewAddress({ ...newAddress, moughataa: text })}
              placeholder="المقاطعة"
            />
            <TextInput
              style={styles.modalInput}
              value={newAddress.street}
              onChangeText={(text) => setNewAddress({ ...newAddress, street: text })}
              placeholder="الشارع"
            />
            <TextInput
              style={styles.modalInput}
              value={newAddress.buildingNo}
              onChangeText={(text) => setNewAddress({ ...newAddress, buildingNo: text })}
              placeholder="رقم المبنى"
            />
            <TextInput
              style={styles.modalInput}
              value={newAddress.apartmentNo}
              onChangeText={(text) => setNewAddress({ ...newAddress, apartmentNo: text })}
              placeholder="رقم الشقة"
            />
            <TextInput
              style={styles.modalInput}
              value={newAddress.additionalDirections}
              onChangeText={(text) => setNewAddress({ ...newAddress, additionalDirections: text })}
              placeholder="توجيهات إضافية"
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddAddress}
              >
                <Text style={styles.saveButtonText}>حفظ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddressModal(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={isLogoutModalVisible}
        animationType="slide"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>تأكيد تسجيل الخروج</Text>
            <Text style={styles.modalMessage}>هل أنت متأكد أنك تريد تسجيل الخروج؟</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelModalButton]} 
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmModalButton]} 
                onPress={handleLogout}
              >
                <Text style={styles.modalButtonText}>نعم</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {renderPasswordModal()}

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
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  logoutIcon: {
    padding: 10,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#3d4785',
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#3d4785',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  profileDetails: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  detailInput: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 2,
  },
  settings: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  settingText: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#3d4785',
  },
  editButton: {
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#3d4785',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  switchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
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
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressesSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#3d4785',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  addressCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  addressHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  defaultText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 8,
    textAlign: 'right',
    lineHeight: 22,
  },
  addressActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  setDefaultButton: {
    backgroundColor: '#3d4785',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 15,
  },
  setDefaultText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    padding: 8,
    borderRadius: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    maxHeight: '90%',
    borderRadius: 20,
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 8,
    elevation: 2,
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
    backgroundColor: '#f5f5f5',
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
});

export default ProfileScreen; 