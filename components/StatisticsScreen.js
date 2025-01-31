import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { ProgressCircle } from 'react-native-svg-charts';

const screenWidth = Dimensions.get('window').width;

const data = {
  labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43],
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
      strokeWidth: 2 // optional
    }
  ],
  legend: ['مبيعات الشهر'] // optional
};

const comparisonData = {
  labels: ['المبيعات', 'العملاء', 'المكافآت'],
  datasets: [
    {
      data: [80, 50, 5],
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
      strokeWidth: 2 // optional
    },
    {
      data: [60, 40, 3],
      color: (opacity = 1) => `rgba(244, 65, 134, ${opacity})`, // optional
      strokeWidth: 2 // optional
    }
  ],
  legend: ['هذا الشهر', 'الشهر الماضي'] // optional
};

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
  const [selectedStat, setSelectedStat] = useState('soldProducts');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

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
    if (selectedProduct) {
      return {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
        datasets: [
          {
            data: [10, 20, 30, 40, 50, 60],
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
            strokeWidth: 2
          }
        ],
        legend: [`مبيعات ${selectedProduct.name}`]
      };
    }
    if (selectedClient) {
      return {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
        datasets: [
          {
            data: [5, 15, 25, 35, 45, 55],
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
            strokeWidth: 2
          }
        ],
        legend: [`مشتريات ${selectedClient.name}`]
      };
    }
    switch (selectedStat) {
      case 'clients':
        return {
          labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
          datasets: [
            {
              data: [5, 10, 15, 20, 25, 30],
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
              strokeWidth: 2
            }
          ],
          legend: ['عدد العملاء']
        };
      case 'averageRating':
        return {
          labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
          datasets: [
            {
              data: [3, 3.5, 4, 4.5, 5, 4.8],
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
              strokeWidth: 2
            }
          ],
          legend: ['متوسط التقييم']
        };
      case 'favorites':
        return {
          labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
          datasets: [
            {
              data: [10, 20, 30, 40, 50, 60],
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
              strokeWidth: 2
            }
          ],
          legend: ['المفضلة']
        };
      default:
        return data;
    }
  };

  const getTitle = () => {
    if (selectedProduct) {
      return `إحصائيات ${selectedProduct.name}`;
    }
    if (selectedClient) {
      return `مشتريات ${selectedClient.name}`;
    }
    switch (selectedStat) {
      case 'clients':
        return 'عدد العملاء';
      case 'averageRating':
        return 'متوسط التقييم';
      case 'favorites':
        return 'المفضلة';
      default:
        return 'المنتجات المباعة';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          <TouchableOpacity onPress={() => handleStatClick('products')}>
            <View style={styles.circleChartContainer}>
              <ProgressCircle style={styles.circleChart} progress={0.7} progressColor={'#4682b4'} />
              <Text style={styles.circleChartText}>عدد المنتجات</Text>
              <Text style={styles.circleChartValue}>70</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleStatClick('clients')}>
            <View style={styles.circleChartContainer}>
              <ProgressCircle style={styles.circleChart} progress={0.5} progressColor={'#32cd32'} />
              <Text style={styles.circleChartText}>عدد العملاء</Text>
              <Text style={styles.circleChartValue}>50</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleStatClick('followers')}>
            <View style={styles.circleChartContainer}>
              <ProgressCircle style={styles.circleChart} progress={0.6} progressColor={'#4682b4'} />
              <Text style={styles.circleChartText}>المتابعين</Text>
              <Text style={styles.circleChartValue}>60</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleStatClick('averageRating')}>
            <View style={styles.circleChartContainer}>
              <ProgressCircle style={styles.circleChart} progress={0.8} progressColor={'#ffa500'} />
              <Text style={styles.circleChartText}>متوسط التقييم</Text>
              <Text style={styles.circleChartValue}>4.0</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleStatClick('soldProducts')}>
            <View style={styles.circleChartContainer}>
              <ProgressCircle style={styles.circleChart} progress={0.6} progressColor={'#ff6347'} />
              <Text style={styles.circleChartText}>المنتجات المباعة</Text>
              <Text style={styles.circleChartValue}>60</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleStatClick('favorites')}>
            <View style={styles.circleChartContainer}>
              <ProgressCircle style={styles.circleChart} progress={0.4} progressColor={'#4682b4'} />
              <Text style={styles.circleChartText}>المفضلة</Text>
              <Text style={styles.circleChartValue}>40</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
        {selectedStat === 'products' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {products.map((product, index) => (
              <TouchableOpacity key={index} onPress={() => handleProductClick(product)}>
                <View style={styles.productContainer}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <Text style={styles.productText}>{product.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {selectedStat === 'clients' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {clients.map((client, index) => (
              <TouchableOpacity key={index} onPress={() => handleClientClick(client)}>
                <View style={styles.productContainer}>
                  <Image source={{ uri: client.image }} style={styles.productImage} />
                  <Text style={styles.productText}>{client.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getTitle()}</Text>
          <LineChart
            data={getChartData()}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مقارنة الشهر الحالي بالشهر الماضي</Text>
          <BarChart
            data={comparisonData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المكافآت</Text>
          <FontAwesome name="gift" size={24} color="#ff6347" />
          <Text style={styles.sectionContent}>لديك 5 مكافآت جديدة!</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الطلبات</Text>
          <FontAwesome name="list-alt" size={24} color="#32cd32" />
          <Text style={styles.sectionContent}>لديك 10 طلبات جديدة.</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اقتراحات</Text>
          <FontAwesome name="lightbulb-o" size={24} color="#ffa500" />
          <Text style={styles.sectionContent}>نقترح عليك تحسين وصف المنتجات لزيادة المبيعات.</Text>
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
});

export default StatisticsScreen;