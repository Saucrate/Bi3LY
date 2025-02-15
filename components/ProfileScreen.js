import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons'; // Ensure you have this icon library installed
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { authService } from '../services/authService'; // import { } içine alındı

const ProfileScreen = () => {
  const navigation = useNavigation(); // Use the hook to get navigation
  const [profileName, setProfileName] = useState('اسم المستخدم');
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [activeRole, setActiveRole] = useState('client');

  const predefinedImages = [
    'https://i.pravatar.cc/150?img=6',
    'https://i.pravatar.cc/150?img=20',
    'https://i.pravatar.cc/150?img=33',
  ];

  const changeProfileImage = (imageUri) => {
    setProfileImage(imageUri);
  };

  const handleNameChange = (newName) => {
    setProfileName(newName);
  };

  const saveProfile = () => {
    alert('تم الحفظ', 'تم تحديث ملف التعريف بنجاح!');
  };

  const confirmLogout = () => {
    setLogoutModalVisible(true);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      // Token ve kullanıcı bilgilerini temizle
      await AsyncStorage.multiRemove([
        'token',
        'userId',
        'activeRole',
        'availableRoles'
      ]);
      setLogoutModalVisible(false);
      navigation.replace('Auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const switchRole = async () => {
    try {
      const availableRoles = JSON.parse(await AsyncStorage.getItem('availableRoles'));
      const currentRole = await AsyncStorage.getItem('activeRole');
      
      if (availableRoles.includes('seller')) {
        const newRole = currentRole === 'client' ? 'seller' : 'client';
        await AsyncStorage.setItem('activeRole', newRole);
        
        // Yeni role göre yönlendirme
        if (newRole === 'seller') {
          navigation.replace('SellerMain');
        } else {
          navigation.replace('ClientMain');
        }
      }
    } catch (error) {
      console.error('Role switch error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={confirmLogout} style={styles.logoutIcon}>
          <FontAwesome name="sign-out" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.profileHeader}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
        <TextInput
          style={styles.profileName}
          value={profileName}
          onChangeText={handleNameChange}
          placeholder="أدخل اسمك"
        />
      </View>
      <View style={styles.imageSelection}>
        <Text style={styles.sectionTitle}>اختر صورة الملف الشخصي</Text>
        <View style={styles.imageOptions}>
          {predefinedImages.map((imageUri, index) => (
            <TouchableOpacity key={index} onPress={() => changeProfileImage(imageUri)}>
              <Image source={{ uri: imageUri }} style={styles.optionImage} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.profileDetails}>
        <Text style={styles.sectionTitle}>تفاصيل الحساب</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>البريد الإلكتروني:</Text>
          <Text style={styles.detailValue}>23039@supnum.mr</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>رقم الهاتف:</Text>
          <Text style={styles.detailValue}>+222 27582750</Text>
        </View>
      </View>
      <View style={styles.settings}>
        <Text style={styles.sectionTitle}>الإعدادات</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>تغيير كلمة المرور</Text>
          <FontAwesome name="angle-left" size={16} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>إعدادات الإشعارات</Text>
          <FontAwesome name="angle-left" size={16} color="#666" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
        <Text style={styles.saveButtonText}>حفظ التغييرات</Text>
      </TouchableOpacity>

      {/* Custom Logout Modal */}
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
              <TouchableOpacity style={styles.modalButton} onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
                <Text style={styles.modalButtonText}>نعم</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {availableRoles.includes('seller') && (
        <TouchableOpacity style={styles.switchButton} onPress={switchRole}>
          <Text style={styles.switchButtonText}>
            {activeRole === 'client' ? 'التبديل إلى حساب البائع' : 'التبديل إلى حساب المستخدم'}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'hsl(218, 50%, 91%)',
    padding: 16,
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
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    width: '80%',
    textAlign: 'center',
  },
  imageSelection: {
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
  },
  imageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ccc',
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
  detailRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  settingText: {
    fontSize: 14,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
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
  },
  modalMessage: {
    fontSize: 14,
    color: '#333',
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
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#3d4785',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
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
  },
});

export default ProfileScreen; 