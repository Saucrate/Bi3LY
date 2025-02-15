import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Image,
  FlatList 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { adminService } from '../services/adminService';

const UserDetailsScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    canceledOrders: 0,
    totalSpent: 0,
    recentOrders: [],
    favoriteCategories: [],
    lastActive: null
  });

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const [userResponse, statsResponse] = await Promise.all([
        adminService.getUserDetails(userId),
        adminService.getUserStats(userId)
      ]);
      setUser(userResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading user details:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل تفاصيل المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async () => {
    try {
      await adminService.updateUserStatus(userId, user.isBlocked ? 'active' : 'blocked');
      Alert.alert('نجاح', 'تم تحديث حالة المستخدم بنجاح');
      loadUserDetails();
    } catch (error) {
      console.error('Error updating user status:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث حالة المستخدم');
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>طلب #{item.orderNumber}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <Text style={styles.orderDate}>
        {new Date(item.createdAt).toLocaleDateString('ar-EG')}
      </Text>
      <Text style={styles.orderTotal}>
        {item.totalAmount.toLocaleString()} MRU
      </Text>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FFA000';
      case 'canceled': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'pending': return 'قيد الانتظار';
      case 'canceled': return 'ملغي';
      default: return status;
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3d4785" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: user.avatar || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: user.isBlocked ? '#f44336' : '#4CAF50' }
            ]}>
              <Text style={styles.statusText}>
                {user.isBlocked ? 'محظور' : 'نشط'}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الاتصال</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>البريد الإلكتروني:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>رقم الهاتف:</Text>
            <Text style={styles.infoValue}>{user.phoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>تاريخ التسجيل:</Text>
            <Text style={styles.infoValue}>
              {new Date(user.createdAt).toLocaleDateString('ar-EG')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>آخر نشاط:</Text>
            <Text style={styles.infoValue}>
              {stats.lastActive ? new Date(stats.lastActive).toLocaleDateString('ar-EG') : 'غير متوفر'}
            </Text>
          </View>
        </View>

        {/* Order Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إحصائيات الطلبات</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>إجمالي الطلبات</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.completedOrders}</Text>
              <Text style={styles.statLabel}>الطلبات المكتملة</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.canceledOrders}</Text>
              <Text style={styles.statLabel}>الطلبات الملغاة</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.totalSpent.toLocaleString()} MRU
              </Text>
              <Text style={styles.statLabel}>إجمالي الإنفاق</Text>
            </View>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>آخر الطلبات</Text>
          <FlatList
            data={stats.recentOrders}
            renderItem={renderOrderItem}
            keyExtractor={item => item._id}
            scrollEnabled={false}
          />
        </View>

        {/* Favorite Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>التصنيفات المفضلة</Text>
          {stats.favoriteCategories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>
                {category.count} طلب
              </Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: user.isBlocked ? '#4CAF50' : '#f44336' }
            ]}
            onPress={handleBlockUser}
          >
            <Text style={styles.buttonText}>
              {user.isBlocked ? 'إلغاء الحظر' : 'حظر المستخدم'}
            </Text>
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
  profileSection: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  orderNumber: {
    fontSize: 16,
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
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  categoryCount: {
    fontSize: 16,
    color: '#666',
  },
  actionButtons: {
    padding: 20,
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserDetailsScreen; 