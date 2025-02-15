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

const SellerManagementScreen = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSellers();
      setSellers(response.data);
    } catch (error) {
      console.error('Error loading sellers:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل قائمة البائعين');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (sellerId, newStatus) => {
    try {
      await adminService.updateSellerStatus(sellerId, newStatus);
      Alert.alert('نجاح', 'تم تحديث حالة البائع بنجاح');
      loadSellers(); // Yeniden yükle
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating seller status:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث حالة البائع');
    }
  };

  const renderSellerItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.sellerCard}
      onPress={() => navigation.navigate('SellerDetails', { 
        sellerId: item._id,
        seller: item,
        storeId: item.store?._id
      })}
    >
      <View style={styles.sellerHeader}>
        <Text style={styles.sellerName}>{item.name}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.isSellerVerified ? '#4CAF50' : '#FFA000' }
        ]}>
          <Text style={styles.statusText}>
            {item.isSellerVerified ? 'نشط' : 'في الانتظار'}
          </Text>
        </View>
      </View>
      
      <View style={styles.sellerInfo}>
        <Text style={styles.infoText}>البريد: {item.email}</Text>
        <Text style={styles.infoText}>الهاتف: {item.phoneNumber}</Text>
        <Text style={styles.infoText}>
          تاريخ التسجيل: {new Date(item.createdAt).toLocaleDateString('ar-EG')}
        </Text>
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
        <Text style={styles.title}>إدارة البائعين</Text>
        <TouchableOpacity onPress={loadSellers}>
          <FontAwesome5 name="sync" size={20} color="#3d4785" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="البحث عن بائع..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={sellers.filter(seller => 
          seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          seller.email.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        renderItem={renderSellerItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
      />
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
  sellerCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  sellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sellerName: {
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
  sellerInfo: {
    marginTop: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  blockButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#3d4785',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SellerManagementScreen;