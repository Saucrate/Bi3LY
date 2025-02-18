import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { favoriteService } from '../services/favoriteService';
import CustomAlert from './CustomAlert';
import { homeService } from '../services/homeService';

const { width: screenWidth } = Dimensions.get('window');

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    checkAuthAndLoadFavorites();
    loadSimilarProducts();
    // Ekran odaklandığında favorileri yeniden yükle
    const unsubscribe = navigation.addListener('focus', () => {
      checkAuthAndLoadFavorites();
      loadSimilarProducts();
    });

    return unsubscribe;
  }, [navigation]);

  const checkAuthAndLoadFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
      
      if (token) {
        // Kullanıcı giriş yapmış, veritabanından favorileri yükle
        await loadFavoritesFromDB();
      } else {
        // Kullanıcı giriş yapmamış, local storage'dan favorileri yükle
        await loadFavoritesFromLocal();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setError('حدث خطأ في تحميل المفضلة');
    } finally {
      setLoading(false);
    }
  };

  const loadFavoritesFromDB = async () => {
    try {
      const response = await favoriteService.getFavorites();
      if (response.success) {
        setFavorites(response.data);
      }
    } catch (error) {
      console.error('Error loading favorites from DB:', error);
      setError('حدث خطأ في تحميل المفضلة من قاعدة البيانات');
    }
  };

  const loadFavoritesFromLocal = async () => {
    try {
      const localFavorites = await AsyncStorage.getItem('favorites');
      if (localFavorites) {
        setFavorites(JSON.parse(localFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites from local:', error);
      setError('حدث خطأ في تحميل المفضلة المحلية');
    }
  };

  const loadSimilarProducts = async () => {
    try {
      // Favori ürünlerin kategorilerine göre benzer ürünleri getir
      const response = await homeService.getSpecialProducts();
      if (response.success) {
        setSimilarProducts(response.data.slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading similar products:', error);
    }
  };

  const handleAuthRequired = () => {
    setShowAuthAlert(true);
  };

  const navigateToAuth = () => {
    setShowAuthAlert(false);
    navigation.navigate('Auth');
  };

  const removeFavorite = async (productId) => {
    try {
      const response = await favoriteService.toggleFavorite(productId);
      if (response.success) {
        // Favorileri yeniden yükle
        await checkAuthAndLoadFavorites();
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      setError('حدث خطأ في إزالة المفضلة');
    }
  };

  const handleBuyNow = (product) => {
    if (!isAuthenticated) {
      handleAuthRequired();
      return;
    }
    // Satın alma işlemine yönlendir
    navigation.navigate('ProductDetailScreen', { 
      productId: product._id || product.id,
      productName: product.name 
    });
  };

  const renderFavoriteItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[styles.favoriteCard, index % 2 === 0 ? styles.leftCard : styles.rightCard]}
      onPress={() => handleBuyNow(item)}
    >
      <Image 
        source={{ uri: item.images?.[0] || item.image }} 
        style={styles.favoriteImage}
        defaultSource={require('../assets/placeholder.jpeg')}
      />
      <TouchableOpacity 
        style={styles.heartButton}
        onPress={() => removeFavorite(item._id || item.id)}
      >
        <AntDesign name="heart" size={20} color="#FF0000" />
      </TouchableOpacity>
      <View style={styles.favoriteDetails}>
        <Text style={styles.favoriteName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceContainer}>
          {item.discountPrice ? (
            <>
              <Text style={styles.discountPrice}>{item.discountPrice} MRU</Text>
              <Text style={styles.originalPrice}>{item.price} MRU</Text>
            </>
          ) : (
            <Text style={styles.price}>{item.price} MRU</Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={() => handleBuyNow(item)}
        >
          <AntDesign name="shoppingcart" size={20} color="#FFF" />
          <Text style={styles.addToCartText}>أضف إلى السلة</Text>
        </TouchableOpacity>
      </View>
      </TouchableOpacity>
  );

  const renderSimilarProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.similarCard}
      onPress={() => navigation.navigate('ProductDetailScreen', { 
        productId: item._id,
        productName: item.name 
      })}
    >
      <Image 
        source={{ uri: item.images?.[0] }} 
        style={styles.similarImage}
        defaultSource={require('../assets/placeholder.jpeg')}
      />
      <View style={styles.similarDetails}>
        <Text style={styles.similarName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.similarPrice}>
          {item.discountPrice || item.price} MRU
        </Text>
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
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={checkAuthAndLoadFavorites}
        >
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المفضلة</Text>
        {favorites.length > 0 && (
          <Text style={styles.itemCount}>
            {favorites.length} {favorites.length === 1 ? 'منتج' : 'منتجات'}
          </Text>
        )}
      </View>

      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item._id || item.id}
        numColumns={2}
        contentContainerStyle={styles.favoritesList}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <AntDesign name="hearto" size={64} color="#ccc" />
            <Text style={styles.emptyText}>لا توجد منتجات في المفضلة</Text>
            <TouchableOpacity 
              style={styles.shopNowButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopNowText}>تسوق الآن</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() => similarProducts.length > 0 && (
          <View style={styles.similarSection}>
            <Text style={styles.similarTitle}>منتجات مشابهة</Text>
            <FlatList
              horizontal
              data={similarProducts}
              renderItem={renderSimilarProduct}
              keyExtractor={(item) => item._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarList}
            />
          </View>
        )}
      />
      
      <CustomAlert
        visible={showAuthAlert}
        message="يجب تسجيل الدخول لإتمام هذه العملية"
        onClose={() => setShowAuthAlert(false)}
      >
        <View style={styles.alertButtonsContainer}>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={navigateToAuth}
          >
            <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowAuthAlert(false)}
          >
            <Text style={styles.cancelButtonText}>إلغاء</Text>
          </TouchableOpacity>
        </View>
      </CustomAlert>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  favoritesList: {
    padding: 8,
  },
  favoriteCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftCard: {
    marginRight: 4,
  },
  rightCard: {
    marginLeft: 4,
  },
  favoriteImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
  },
  favoriteDetails: {
    padding: 12,
  },
  favoriteName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
    height: 40,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    color: '#3d4785',
    fontWeight: 'bold',
  },
  discountPrice: {
    fontSize: 16,
    color: '#3d4785',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    backgroundColor: '#3d4785',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  similarSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  similarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'right',
  },
  similarList: {
    paddingBottom: 16,
  },
  similarCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  similarImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  similarDetails: {
    padding: 12,
  },
  similarName: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
    textAlign: 'right',
    height: 32,
  },
  similarPrice: {
    fontSize: 14,
    color: '#3d4785',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  shopNowButton: {
    backgroundColor: '#3d4785',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  alertButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  loginButton: {
    backgroundColor: '#3d4785',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default FavoritesScreen; 