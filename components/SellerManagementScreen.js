import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SellerManagementScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <Text style={styles.title}>إدارة البائعين</Text>
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchBar} placeholder="بحث عن البائعين" />
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>تصفية</Text>
        </TouchableOpacity>
      </View>

      {/* Seller Performance Overview */}
      <View style={styles.performanceContainer}>
        <Text style={styles.performanceText}>120 بائع نشط</Text>
        <Text style={styles.performanceText}>15 جديد هذا الشهر</Text>
        <View style={styles.sellerCard}>
          <Text style={styles.storeName}>اسم المتجر</Text>
          <Text style={styles.totalSales}>$30,000</Text>
          <Text style={styles.productsSold}>المنتجات المباعة</Text>
        </View>
        {/* Add more seller cards as needed */}
      </View>

      {/* Actionable Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>إخطار البائعين</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>إضافة بائع جديد</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>عرض التقارير</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  filterButton: {
    backgroundColor: '#3d4785',
    padding: 10,
    borderRadius: 20,
  },
  filterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  performanceContainer: {
    marginBottom: 20,
  },
  performanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sellerCard: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalSales: {
    fontSize: 14,
    color: 'gray',
  },
  productsSold: {
    fontSize: 14,
    color: 'gray',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SellerManagementScreen;