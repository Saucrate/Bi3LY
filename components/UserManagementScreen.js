import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  Modal,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { adminService } from '../services/adminService';
import { useNavigation } from '@react-navigation/native';

const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل قائمة المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await adminService.updateUserStatus(userId, newStatus, blockReason);
      Alert.alert('نجاح', 'تم تحديث حالة المستخدم بنجاح');
      loadUsers();
      setModalVisible(false);
      setBlockReason('');
    } catch (error) {
      console.error('Error updating user status:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث حالة المستخدم');
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => navigation.navigate('UserDetails', { userId: item._id })}
    >
      <View style={styles.userHeader}>
        <Text style={styles.userName}>{item.name}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.isBlocked ? '#f44336' : '#4CAF50' }
        ]}>
          <Text style={styles.statusText}>
            {item.isBlocked ? 'محظور' : 'نشط'}
          </Text>
        </View>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.infoText}>البريد: {item.email}</Text>
        <Text style={styles.infoText}>الهاتف: {item.phoneNumber}</Text>
        <Text style={styles.infoText}>
          تاريخ التسجيل: {new Date(item.createdAt).toLocaleDateString('ar-EG')}
        </Text>
        {item.isBlocked && item.blockReason && (
          <Text style={styles.blockReason}>
            سبب الحظر: {item.blockReason}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3d4785" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>إدارة المستخدمين</Text>
        <TouchableOpacity onPress={loadUsers}>
          <FontAwesome5 name="sync" size={20} color="#3d4785" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="البحث عن مستخدم..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={users.filter(user => 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        renderItem={renderUserItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedUser && (
              <>
                <Text style={styles.modalTitle}>تفاصيل المستخدم</Text>
                <Text style={styles.modalText}>الاسم: {selectedUser.name}</Text>
                <Text style={styles.modalText}>البريد: {selectedUser.email}</Text>
                <Text style={styles.modalText}>الهاتف: {selectedUser.phoneNumber}</Text>
                <Text style={styles.modalText}>
                  الحالة: {selectedUser.isBlocked ? 'محظور' : 'نشط'}
                </Text>

                {!selectedUser.isBlocked && (
                  <TextInput
                    style={styles.reasonInput}
                    placeholder="سبب الحظر..."
                    value={blockReason}
                    onChangeText={setBlockReason}
                    multiline
                  />
                )}

                <View style={styles.actionButtons}>
                  {!selectedUser.isBlocked ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.blockButton]}
                      onPress={() => handleUpdateStatus(selectedUser._id, 'blocked')}
                    >
                      <Text style={styles.buttonText}>حظر</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.unblockButton]}
                      onPress={() => handleUpdateStatus(selectedUser._id, 'active')}
                    >
                      <Text style={styles.buttonText}>إلغاء الحظر</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setModalVisible(false);
                    setBlockReason('');
                  }}
                >
                  <Text style={styles.closeButtonText}>إغلاق</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3d4785',
  },
  searchContainer: {
    padding: 15,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
  },
  userCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d4785',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userInfo: {
    marginTop: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  blockReason: {
    fontSize: 14,
    color: '#f44336',
    marginTop: 5,
    fontStyle: 'italic',
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
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  reasonInput: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    marginTop: 20,
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  blockButton: {
    backgroundColor: '#f44336',
  },
  unblockButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 15,
    backgroundColor: '#3d4785',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserManagementScreen;