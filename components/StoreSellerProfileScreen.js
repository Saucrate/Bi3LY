import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { sellerService } from '../services/sellerService';
import * as ImagePicker from 'expo-image-picker';

const StoreSellerProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStoreProfile();
  }, []);

  const loadStoreProfile = async () => {
    try {
      setLoading(true);
      const response = await sellerService.getStoreProfile();
      console.log('Store profile response:', response); // Debug için

      if (response.success) {
        // response.data direkt store objesi olduğu için düzeltme
        setStore(response.data);
        // Stats verisi store içinden alınacak
        setStats({
          totalOrders: response.data.totalOrders || 0,
          activeProducts: response.data.activeProducts || 0,
          totalFollowers: response.data.followers?.length || 0
        });
      }
    } catch (error) {
      console.error('Load store profile error:', error);
      Alert.alert('Error', error.message || 'Failed to load store profile');
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
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Image source={{ uri: store?.banner || 'https://via.placeholder.com/1200x300' }} style={styles.storeBanner} />
        <View style={styles.profileHeader}>
          <Image source={{ uri: store?.logo || 'https://via.placeholder.com/150' }} style={styles.storeLogo} />
          <Text style={styles.storeName}>{store?.name}</Text>
          <Text style={styles.sellerInfo}>{store?.owner?.name} - {store?.location}</Text>
          <Text style={styles.storeCategory}>{store?.category}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.totalOrders || 0}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.activeProducts || 0}</Text>
            <Text style={styles.statLabel}>Active Products</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.totalFollowers || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditStoreProfile', { store })}
          >
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 80,
  },
  storeBanner: {
    width: '100%',
    height: 150,
    marginBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  storeLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#3d4785',
    marginBottom: 10,
  },
  storeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sellerInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  storeCategory: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff0000',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tabButton: {
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#3d4785',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#3d4785',
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  productItem: {
    width: '45%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StoreSellerProfileScreen;
