import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CircularProgress from 'react-native-circular-progress-indicator';

const AdminStatisticsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.greeting}>مرحبًا، المدير!</Text>
        <Image source={{ uri: 'https://example.com/profile.jpg' }} style={styles.profileIcon} />
      </View>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>$124.5</Text>
        <TouchableOpacity style={styles.topUpButton}>
          <Text style={styles.topUpButtonText}>إضافة رصيد</Text>
        </TouchableOpacity>
      </View>

      {/* Main Statistics */}
      <View style={styles.statisticsContainer}>
        <CircularProgress
          value={150000}
          radius={100}
          maxValue={200000}
          title={'إجمالي المبيعات هذا الشهر'}
          titleColor={'#3d4785'}
          titleStyle={{ fontWeight: 'bold' }}
          activeStrokeColor={'#3d4785'}
          inActiveStrokeColor={'#e0e0e0'}
          inActiveStrokeOpacity={0.2}
          valueSuffix={'$'}
        />
        <Text style={styles.goalText}>$150,000 / $200,000 الهدف</Text>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>120</Text>
          <Text style={styles.metricLabel}>البائعين النشطين</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>8,500</Text>
          <Text style={styles.metricLabel}>إجمالي المنتجات</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>5,000</Text>
          <Text style={styles.metricLabel}>إجمالي الطلبات</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>10,500</Text>
          <Text style={styles.metricLabel}>إجمالي العملاء</Text>
        </View>
      </View>

      {/* Popular Products */}
      <View style={styles.popularProductsContainer}>
        <View style={styles.productCard}>
          <Text style={styles.productName}>سماعات لاسلكية</Text>
          <Text style={styles.productSales}>1,200 وحدة</Text>
          <Text style={styles.productPrice}>$99.99</Text>
        </View>
        {/* Add more product cards as needed */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  topUpButton: {
    backgroundColor: '#3d4785',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  topUpButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statisticsContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  goalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  metricBox: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 14,
    color: 'gray',
  },
  popularProductsContainer: {
    marginVertical: 20,
  },
  productCard: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productSales: {
    fontSize: 14,
    color: 'gray',
  },
  productPrice: {
    fontSize: 14,
    color: 'gray',
  },
});

export default AdminStatisticsScreen;
