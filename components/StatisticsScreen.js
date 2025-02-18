import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { ProgressCircle } from 'react-native-svg-charts';
import { sellerService } from '../services/sellerService';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  useShadowColorFromDataset: false // optional
};

const products = [
  { name: 'منتج 1', image: 'https://via.placeholder.com/100' },
  { name: 'منتج 2', image: 'https://via.placeholder.com/100' },
  { name: 'منتج 3', image: 'https://via.placeholder.com/100' },
  { name: 'منتج 4', image: 'https://via.placeholder.com/100' }
];

const clients = [
  { name: 'عميل 1', image: 'https://via.placeholder.com/100' },
  { name: 'عميل 2', image: 'https://via.placeholder.com/100' },
  { name: 'عميل 3', image: 'https://via.placeholder.com/100' },
  { name: 'عميل 4', image: 'https://via.placeholder.com/100' }
];

const StatisticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    basicStats: {
      productsCount: 0,
      customersCount: 0,
      followersCount: 0,
      rating: 0,
      soldProductsCount: 0,
      favoritesCount: 0
    },
    monthlyStats: [],
    topProducts: [],
    topCustomers: [],
    comparison: {
      currentMonth: {
        sales: 0,
        customers: 0,
        rewards: 0
      },
      lastMonth: {
        sales: 0,
        customers: 0,
        rewards: 0
      }
    },
    pendingOrders: 0
  });
  const [selectedStat, setSelectedStat] = useState('soldProducts');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    loadStats();
    loadOrders();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await sellerService.getDetailedStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ في تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await sellerService.getOrders();
      if (response.success) {
        setOrders(response.data);
        console.log('Orders loaded in StatisticsScreen:', response.data);
      }
    } catch (err) {
      console.error('Error loading orders in StatisticsScreen:', err);
    }
  };

  const handleStatClick = (stat) => {
    setSelectedStat(stat);
    setSelectedProduct(null);
    setSelectedClient(null);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleClientClick = (client) => {
    setSelectedClient(client);
  };

  const getChartData = () => {
    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    const last6Months = [];
    const monthlyData = new Array(6).fill(0);
    const labels = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthIndex = d.getMonth();
      labels.push(arabicMonths[monthIndex]);
      last6Months.push(monthIndex + 1);
    }

    // Her istatistik türü için uygun veriyi seç
    stats.monthlyStats.forEach(stat => {
      const monthIndex = last6Months.indexOf(stat._id);
      if (monthIndex !== -1) {
        switch (selectedStat) {
          case 'soldProducts':
            monthlyData[monthIndex] = stat.count || 0; // Satılan ürün sayısı
            break;
          case 'revenue':
            monthlyData[monthIndex] = stat.total || 0; // Toplam gelir
            break;
          case 'orders':
            monthlyData[monthIndex] = stat.ordersCount || 0; // Sipariş sayısı
            break;
          case 'rating':
            monthlyData[monthIndex] = stat.rating || 0; // Ortalama değerlendirme
            break;
        }
      }
    });

    return {
      labels,
      datasets: [{
        data: monthlyData,
        color: (opacity = 1) => `rgba(61, 71, 133, ${opacity})`,
        strokeWidth: 2
      }],
      legend: [getTitle()]
    };
  };

  const getTitle = () => {
    switch (selectedStat) {
      case 'soldProducts':
        return 'المنتجات المباعة';
      case 'revenue':
        return 'الإيرادات';
      case 'orders':
        return 'الطلبات';
      case 'rating':
        return 'التقييمات';
      default:
        return '';
    }
  };

  const getSectionContent = () => {
    switch (selectedStat) {
      case 'soldProducts':
      case 'revenue':
      case 'orders':
      case 'rating':
        return '';
      default:
        return '';
    }
  };

  const getComparisonData = () => ({
    labels: ['المبيعات', 'العملاء', 'المكافآت'],
    datasets: [
      {
        data: [
          stats.comparison.currentMonth.sales,
          stats.comparison.currentMonth.customers,
          stats.comparison.currentMonth.rewards
        ],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2
      },
      {
        data: [
          stats.comparison.lastMonth.sales,
          stats.comparison.lastMonth.customers,
          stats.comparison.lastMonth.rewards
        ],
        color: (opacity = 1) => `rgba(244, 65, 134, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ['هذا الشهر', 'الشهر الماضي']
  });

  // Progress değerlerini hesapla
  const getProgress = (stat) => {
    switch (stat) {
      case 'products':
        return stats.basicStats.productsCount / 100; // Maksimum 100 ürün
      case 'customers':
        return stats.basicStats.customersCount / 100; // Maksimum 100 müşteri
      case 'followers':
        return stats.basicStats.followersCount / 100; // Maksimum 100 takipçi
      case 'rating':
        return stats.basicStats.rating / 5; // 5 üzerinden
      case 'soldProducts':
        return stats.basicStats.soldProductsCount / 100; // Maksimum 100 satış
      case 'favorites':
        return stats.basicStats.favoritesCount / 100; // Maksimum 100 favori
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3d4785" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          <TouchableOpacity onPress={() => handleStatClick('soldProducts')}>
            <View style={styles.circleChartContainer}>
              <ProgressCircle 
                style={styles.circleChart} 
                progress={stats.basicStats.soldProductsCount / 100}
                progressColor={'#4682b4'} 
              />
              <Text style={styles.circleChartText}>المبيعات</Text>
              <Text style={styles.circleChartValue}>{stats.basicStats.soldProductsCount}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleStatClick('revenue')}>
            <View style={styles.circleChartContainer}>
              <ProgressCircle 
                style={styles.circleChart} 
                progress={stats.comparison.currentMonth.sales / 10000}
                progressColor={'#32cd32'} 
              />
              <Text style={styles.circleChartText}>الإيرادات</Text>
              <Text style={styles.circleChartValue}>{stats.comparison.currentMonth.sales}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleStatClick('orders')}>
            <View style={styles.circleChartContainer}>
              <ProgressCircle 
                style={styles.circleChart} 
                progress={stats.pendingOrders / 50}
                progressColor={'#ffa500'} 
              />
              <Text style={styles.circleChartText}>الطلبات</Text>
              <Text style={styles.circleChartValue}>{stats.pendingOrders}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleStatClick('rating')}>
            <View style={styles.circleChartContainer}>
              <ProgressCircle 
                style={styles.circleChart} 
                progress={stats.basicStats.rating / 5}
                progressColor={'#ff6347'} 
              />
              <Text style={styles.circleChartText}>التقييم</Text>
              <Text style={styles.circleChartValue}>{stats.basicStats.rating.toFixed(1)}</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getTitle()}</Text>
          <LineChart
            data={getChartData()}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
          <Text style={styles.sectionContent}>{getSectionContent()}</Text>
        </View>

        {/* Karşılaştırma grafiği */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مقارنة مع الشهر السابق</Text>
          <BarChart
            data={getComparisonData()}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollViewContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  horizontalScroll: {
    marginVertical: 10,
  },
  circleChartContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  circleChart: {
    height: 100,
    width: 100,
  },
  circleChartText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  circleChartValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  productText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  section: {
    marginVertical: 10,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  chart: {
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default StatisticsScreen;