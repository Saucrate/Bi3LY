import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const StoreSellerProfileScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Image source={{ uri: 'https://static.vecteezy.com/system/resources/thumbnails/000/701/690/small/abstract-polygonal-banner-background.jpg' }} style={styles.storeBanner} />
        <View style={styles.profileHeader}>
          <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.storeLogo} />
          <Text style={styles.storeName}>متجر الأناقة الأوروبية</Text>
          <Text style={styles.sellerInfo}>محمد العتيبي - الرياض، السعودية</Text>
          <Text style={styles.storeCategory}>عطور وملابس</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>٣٢٥ طلب</Text>
            <Text style={styles.statLabel}>إجمالي المبيعات</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>١٥٠ منتج</Text>
            <Text style={styles.statLabel}>المنتجات النشطة</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>٢١٠٠ متابع</Text>
            <Text style={styles.statLabel}>المتابعين</Text>
          </View>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>إدارة المنتجات</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>إضافة منتج جديد</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>العروض والخصومات</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={styles.tabButton}>
            <Text style={styles.tabButtonText}>المنتجات</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton}>
            <Text style={styles.tabButtonText}>التقييمات</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton}>
            <Text style={styles.tabButtonText}>الطلبات</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.productsContainer}>
          {/* Example product items */}
          <View style={styles.productItem}>
            <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.productImage} />
            <Text style={styles.productName}>منتج 1</Text>
          </View>
          <View style={styles.productItem}>
            <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.productImage} />
            <Text style={styles.productName}>منتج 2</Text>
          </View>
          <View style={styles.productItem}>
            <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.productImage} />
            <Text style={styles.productName}>منتج 3</Text>
          </View>
          <View style={styles.productItem}>
            <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.productImage} />
            <Text style={styles.productName}>منتج 4</Text>
          </View>
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
});

export default StoreSellerProfileScreen;
