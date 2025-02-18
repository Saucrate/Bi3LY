import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  ScrollView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { storeService } from '../services/storeService';

const { width } = Dimensions.get('window');

const StoreScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { storeId } = route.params;

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    averageRating: 0,
    followers: 0
  });

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      const storeResponse = await storeService.getStoreDetails(storeId);
      console.log('Store Response:', storeResponse);
      
      if (storeResponse.success) {
        setStore(storeResponse.data);
        
        // Update follow status and follower count
        const followStatus = storeResponse.data.isFollowing;
        const followerCount = storeResponse.data.followerCount || 0;
        
        console.log('Initial Following:', followStatus, 'Initial Follower Count:', followerCount);
        
        setIsFollowing(followStatus);
        setStats({
          totalProducts: storeResponse.data.totalProducts || 0,
          totalSales: storeResponse.data.totalSales || 0,
          averageRating: storeResponse.data.rating || 0,
          followers: followerCount
        });
      }

      const productsResponse = await storeService.getStoreProducts(storeId);
      if (productsResponse.success) {
        setProducts(productsResponse.data);
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ في تحميل بيانات المتجر');
      console.error('Store loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowStore = async () => {
    try {
      const response = await storeService.toggleFollowStore(storeId);
      console.log('Toggle Follow Response:', response);
      
      if (response.success) {
        const { isFollowing, followerCount } = response.data;
        console.log('New Following Status:', isFollowing, 'New Follower Count:', followerCount);
        
        setIsFollowing(isFollowing);
        setStats(prev => ({
          ...prev,
          followers: followerCount
        }));
      }
    } catch (error) {
      console.error('Follow store error:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Image 
        source={{ uri: store?.banner }} 
        style={styles.coverImage}
        defaultSource={require('../assets/placeholder.jpeg')}
      />
      <View style={styles.storeInfo}>
        <Image 
          source={{ uri: store?.logo }} 
          style={styles.logo}
          defaultSource={require('../assets/placeholder.jpeg')}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.storeName}>{store?.name}</Text>
          <View style={styles.ratingContainer}>
            <AntDesign name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{stats.averageRating.toFixed(1)}</Text>
          </View>
          <Text style={styles.followers}>{stats.followers} متابع</Text>
        </View>
        <TouchableOpacity 
          style={[styles.followButton, isFollowing && styles.followingButton]}
          onPress={handleFollowStore}
        >
          <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
            {isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.totalProducts}</Text>
        <Text style={styles.statLabel}>منتج</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.totalSales}</Text>
        <Text style={styles.statLabel}>مبيعات</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.averageRating.toFixed(1)}</Text>
        <Text style={styles.statLabel}>تقييم</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.followers}</Text>
        <Text style={styles.statLabel}>متابع</Text>
      </View>
    </View>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetailScreen', { 
        productId: item._id,
        productName: item.name 
      })}
    >
      <Image 
        source={{ uri: item.images[0] }} 
        style={styles.productImage}
        defaultSource={require('../assets/placeholder.jpeg')}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceContainer}>
          {item.discountPrice ? (
            <>
              <Text style={styles.oldPrice}>{item.price} أوقية</Text>
              <Text style={styles.price}>{item.discountPrice} أوقية</Text>
            </>
          ) : (
            <Text style={styles.price}>{item.price} أوقية</Text>
          )}
        </View>
        <View style={styles.productRating}>
          <AntDesign name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({item.numReviews})</Text>
        </View>
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

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStoreData}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderStats()}
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد منتجات</Text>
            </View>
          }
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  coverImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  storeInfo: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
    marginTop: -40,
  },
  infoContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'right',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  rating: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  followers: {
    color: '#666',
    fontSize: 12,
  },
  followButton: {
    backgroundColor: '#3d4785',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  followingButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#3d4785',
  },
  followingButtonText: {
    color: '#3d4785',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  productList: {
    padding: 5,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'right',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3d4785',
  },
  oldPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 5,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666',
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6347',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3d4785',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default StoreScreen; 