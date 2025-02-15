import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { adminService } from '../services/adminService';

const AdminProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdminProfile();
      setProfile(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await adminService.updateAdminProfile(formData);
      Alert.alert('نجاح', 'تم تحديث الملف الشخصي بنجاح');
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('خطأ', 'كلمة المرور الجديدة غير متطابقة');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert('خطأ', 'يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل');
      return;
    }

    try {
      setLoading(true);
      await adminService.updateAdminPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      Alert.alert('نجاح', 'تم تحديث كلمة المرور بنجاح');
      setPasswordModalVisible(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('خطأ', error.error || 'حدث خطأ أثناء تحديث كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3d4785" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: profile?.avatar || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
          <Text style={styles.role}>مدير النظام</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setEditing(!editing)}
            >
              <FontAwesome5 
                name={editing ? 'times' : 'edit'} 
                size={20} 
                color="#3d4785" 
              />
            </TouchableOpacity>
          </View>

          {editing ? (
            // Edit Form
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>الاسم</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="أدخل اسمك"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>البريد الإلكتروني</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="أدخل بريدك الإلكتروني"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>رقم الهاتف</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                  placeholder="أدخل رقم هاتفك"
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity 
                style={styles.updateButton}
                onPress={handleUpdate}
              >
                <Text style={styles.updateButtonText}>حفظ التغييرات</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Display Info
            <View style={styles.info}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>الاسم:</Text>
                <Text style={styles.infoValue}>{profile.name}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>البريد الإلكتروني:</Text>
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>رقم الهاتف:</Text>
                <Text style={styles.infoValue}>
                  {profile.phoneNumber || 'غير محدد'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>تاريخ الانضمام:</Text>
                <Text style={styles.infoValue}>
                  {new Date(profile.createdAt).toLocaleDateString('ar-EG')}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Şifre Değiştirme Modal */}
        <Modal
          visible={passwordModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>تغيير كلمة المرور</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>كلمة المرور الحالية</Text>
                <TextInput
                  style={styles.input}
                  value={passwordForm.currentPassword}
                  onChangeText={(text) => setPasswordForm({
                    ...passwordForm,
                    currentPassword: text
                  })}
                  placeholder="أدخل كلمة المرور الحالية"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>كلمة المرور الجديدة</Text>
                <TextInput
                  style={styles.input}
                  value={passwordForm.newPassword}
                  onChangeText={(text) => setPasswordForm({
                    ...passwordForm,
                    newPassword: text
                  })}
                  placeholder="أدخل كلمة المرور الجديدة"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>تأكيد كلمة المرور الجديدة</Text>
                <TextInput
                  style={styles.input}
                  value={passwordForm.confirmPassword}
                  onChangeText={(text) => setPasswordForm({
                    ...passwordForm,
                    confirmPassword: text
                  })}
                  placeholder="أدخل كلمة المرور الجديدة مرة أخرى"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleUpdatePassword}
              >
                <Text style={styles.updateButtonText}>تحديث كلمة المرور</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.closeButton, { marginTop: 10 }]}
                onPress={() => {
                  setPasswordModalVisible(false);
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
              >
                <Text style={styles.closeButtonText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Güvenlik Bölümü */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الأمان</Text>
          <TouchableOpacity 
            style={styles.securityButton}
            onPress={() => setPasswordModalVisible(true)}
          >
            <FontAwesome5 name="key" size={20} color="#3d4785" />
            <Text style={styles.securityButtonText}>تغيير كلمة المرور</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  role: {
    fontSize: 18,
    color: '#3d4785',
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d4785',
  },
  editButton: {
    padding: 5,
  },
  info: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  form: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  securityButtonText: {
    fontSize: 16,
    color: '#3d4785',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#3d4785',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminProfileScreen;
