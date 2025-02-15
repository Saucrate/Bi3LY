import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { sellerService } from '../services/sellerService';

const SellerHomeScreen = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    ratingsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await sellerService.getStoreStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ في تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#3d4785" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStats}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>مرحباً بك في لوحة التحكم الخاصة بالمتجر</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <FontAwesome5 name="shopping-bag" size={24} color="#3d4785" />
            <Text style={styles.statNumber}>{stats.productsCount}</Text>
            <Text style={styles.statLabel}>المنتجات</Text>
        </View>
          
          <View style={styles.statBox}>
            <FontAwesome5 name="shopping-cart" size={24} color="#3d4785" />
            <Text style={styles.statNumber}>{stats.ordersCount}</Text>
            <Text style={styles.statLabel}>الطلبات</Text>
      </View>
          
          <View style={styles.statBox}>
            <FontAwesome5 name="star" size={24} color="#3d4785" />
            <Text style={styles.statNumber}>{stats.ratingsCount}</Text>
            <Text style={styles.statLabel}>التقييمات</Text>
      </View>
        </View>

        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => navigation.navigate('ClientMain')}
        >
          <FontAwesome5 name="exchange-alt" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>التبديل إلى حساب المستخدم</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3d4785',
    textAlign: 'center',
    marginBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    width: '30%',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3d4785',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  switchButton: {
    flexDirection: 'row',
    backgroundColor: '#3d4785',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3d4785',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  }
});

export default SellerHomeScreen;