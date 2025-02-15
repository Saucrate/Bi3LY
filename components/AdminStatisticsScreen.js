import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CircularProgress from 'react-native-circular-progress-indicator';
import { adminService } from '../services/adminService';
import { FontAwesome5 } from '@expo/vector-icons';

const AdminStatisticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    activeSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    monthlyStats: {
      sales: 0,
      target: 200000
    }
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل الإحصائيات');
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
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>مرحبًا، المدير!</Text>
          <TouchableOpacity onPress={loadStatistics}>
            <FontAwesome5 name="sync" size={20} color="#3d4785" />
          </TouchableOpacity>
        </View>

        {/* Main Statistics */}
        <View style={styles.statisticsContainer}>
          <CircularProgress
            value={stats.monthlyStats.sales}
            radius={120}
            maxValue={stats.monthlyStats.target}
            title={'إجمالي المبيعات\nهذا الشهر'}
            titleColor={'#3d4785'}
            titleStyle={{ 
              fontWeight: 'bold',
              fontSize: 18,
              textAlign: 'center'
            }}
            activeStrokeColor={'#3d4785'}
            inActiveStrokeColor={'#e0e0e0'}
            inActiveStrokeOpacity={0.2}
            valueSuffix={' MRU'}
            valueFormatter={(value) => {
              return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }}
          />
          <Text style={styles.goalText}>
            {stats.monthlyStats.sales.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} / {' '}
            {stats.monthlyStats.target.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} MRU
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricBox}>
            <FontAwesome5 name="store" size={24} color="#3d4785" />
            <Text style={styles.metricValue}>{stats.activeSellers}</Text>
            <Text style={styles.metricLabel}>البائعين النشطين</Text>
          </View>
          <View style={styles.metricBox}>
            <FontAwesome5 name="box" size={24} color="#3d4785" />
            <Text style={styles.metricValue}>{stats.totalProducts}</Text>
            <Text style={styles.metricLabel}>إجمالي المنتجات</Text>
          </View>
          <View style={styles.metricBox}>
            <FontAwesome5 name="shopping-cart" size={24} color="#3d4785" />
            <Text style={styles.metricValue}>{stats.totalOrders}</Text>
            <Text style={styles.metricLabel}>إجمالي الطلبات</Text>
          </View>
          <View style={styles.metricBox}>
            <FontAwesome5 name="users" size={24} color="#3d4785" />
            <Text style={styles.metricValue}>{stats.totalUsers}</Text>
            <Text style={styles.metricLabel}>إجمالي العملاء</Text>
          </View>
        </View>

        {/* Additional Statistics */}
        <View style={styles.additionalStats}>
          <Text style={styles.sectionTitle}>إحصائيات إضافية</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>إجمالي البائعين:</Text>
            <Text style={styles.statValue}>{stats.totalSellers}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>نسبة البائعين النشطين:</Text>
            <Text style={styles.statValue}>
              {((stats.activeSellers / stats.totalSellers) * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>متوسط المنتجات لكل بائع:</Text>
            <Text style={styles.statValue}>
              {(stats.totalProducts / stats.activeSellers).toFixed(1)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3d4785',
  },
  statisticsContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  goalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#3d4785',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 15,
  },
  metricBox: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3d4785',
    marginVertical: 5,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  additionalStats: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    margin: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d4785',
  },
});

export default AdminStatisticsScreen;
