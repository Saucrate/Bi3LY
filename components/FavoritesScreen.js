import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, Image, TouchableOpacity, 
  FlatList, Dimensions, ActivityIndicator, StatusBar, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { favoriteService } from '../services/favoriteService';
import { homeService } from '../services/homeService';
import CustomAlert from './CustomAlert';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const HEADER_MAX_HEIGHT = 150;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 90 : 70 + StatusBar.currentHeight;

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, 100],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      'clamp'
    );

    return {
      height,
    };
  });

  const headerContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [50, 100],
      [1, 0],
      'clamp'
    );

    return {
      opacity,
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, 100],
            [0, -20],
            'clamp'
          ),
        },
      ],
    };
  });

  const minimizedHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [50, 100],
      [0, 1],
      'clamp'
    );

    return {
      opacity,
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, 100],
            [20, 0],
            'clamp'
          ),
        },
      ],
    };
  });

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
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.favoriteCard}
    >
      <BlurView intensity={80} tint="light" style={styles.cardBlur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
          style={styles.cardGradient}
        >
          {/* Product Image Section */}
          <View style={styles.imageSection}>
            <Image 
              source={{ uri: item.images?.[0] || item.image }} 
              style={styles.favoriteImage}
              defaultSource={require('../assets/placeholder.jpeg')}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={StyleSheet.absoluteFill}
            />
            
            {/* Price Tag */}
            <View style={styles.priceTag}>
              <BlurView intensity={90} tint="dark" style={styles.priceBlur}>
                <Text style={styles.priceText}>
                  {item.discountPrice || item.price} MRU
                </Text>
                {item.discountPrice && (
                  <Text style={styles.originalPrice}>
                    {item.price} MRU
                  </Text>
                )}
              </BlurView>
            </View>

            {/* Favorite Button */}
            <TouchableOpacity 
              style={styles.heartButton}
              onPress={() => removeFavorite(item._id || item.id)}
            >
              <BlurView intensity={90} tint="light" style={styles.heartBlur}>
                <LinearGradient
                  colors={['#ff6b6b', '#ff8787']}
                  style={styles.heartGradient}
                >
                  <FontAwesome5 name="heart" size={16} color="#fff" />
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Product Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>

            {/* Store Info */}
            <View style={styles.storeInfo}>
              <Image 
                source={{ uri: item.store?.logo }}
                style={styles.storeLogo}
                defaultSource={require('../assets/placeholder.jpeg')}
              />
              <Text style={styles.storeName} numberOfLines={1}>
                {item.store?.name}
              </Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <FontAwesome5 name="star" size={12} color="#FAC443" />
                <Text style={styles.statText}>
                  {item.rating?.toFixed(1) || '0.0'}
                </Text>
              </View>
              <View style={styles.stat}>
                <FontAwesome5 name="shopping-cart" size={12} color="#92ACEC" />
                <Text style={styles.statText}>{item.sold || 0}</Text>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleBuyNow(item)}
            >
              <LinearGradient
                colors={['#004AAD', '#92ACEC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>عرض المنتج</Text>
                <FontAwesome5 name="arrow-left" size={14} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Decorative Elements */}
          <View style={styles.decorativeElements}>
            <LinearGradient
              colors={['rgba(250,196,67,0.15)', 'rgba(255,215,0,0.1)']}
              style={[styles.decorCircle, { transform: [{ rotate: '45deg' }] }]}
            />
            <LinearGradient
              colors={['rgba(146,172,236,0.2)', 'rgba(0,74,173,0.15)']}
              style={[styles.decorDot]}
            />
          </View>
        </LinearGradient>
      </BlurView>
    </Animatable.View>
  );

  const renderSimilarProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.similarCard}
      onPress={() => navigation.navigate('ProductDetailScreen', { 
        productId: item._id,
        productName: item.name 
      })}
    >
      <BlurView intensity={80} tint="light" style={styles.similarBlur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
          style={styles.similarGradient}
        >
          <View style={styles.similarImageContainer}>
            <Image 
              source={{ uri: item.images?.[0] }} 
              style={styles.similarImage}
              defaultSource={require('../assets/placeholder.jpeg')}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={StyleSheet.absoluteFill}
            />
            
            {/* Price Tag */}
            <View style={styles.similarPriceTag}>
              <BlurView intensity={90} tint="dark" style={styles.similarPriceBlur}>
                <Text style={styles.similarPriceText}>
                  {item.discountPrice || item.price} MRU
                </Text>
                {item.discountPrice && (
                  <Text style={styles.similarOriginalPrice}>
                    {item.price} MRU
                  </Text>
                )}
              </BlurView>
            </View>

            {/* Similar Badge */}
            <View style={styles.similarBadge}>
              <BlurView intensity={90} tint="light" style={styles.similarBadgeBlur}>
                <LinearGradient
                  colors={['#FAC443', '#FFD700']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.similarBadgeGradient}
                >
                  <Text style={styles.similarBadgeText}>مشابه</Text>
                </LinearGradient>
              </BlurView>
            </View>
          </View>

          <View style={styles.similarDetails}>
            <Text style={styles.similarName} numberOfLines={2}>
              {item.name}
            </Text>
            
            <View style={styles.similarStoreInfo}>
              <Image 
                source={{ uri: item.store?.logo }}
                style={styles.similarStoreLogo}
                defaultSource={require('../assets/placeholder.jpeg')}
              />
              <Text style={styles.similarStoreName} numberOfLines={1}>
                {item.store?.name}
              </Text>
            </View>

            <View style={styles.similarStats}>
              <View style={styles.similarStat}>
                <FontAwesome5 name="star" size={10} color="#FAC443" />
                <Text style={styles.similarStatText}>
                  {item.rating?.toFixed(1) || '0.0'}
                </Text>
              </View>
              <View style={styles.similarStat}>
                <FontAwesome5 name="shopping-cart" size={10} color="#92ACEC" />
                <Text style={styles.similarStatText}>{item.sold || 0}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004AAD" />
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
      <Animated.View style={[styles.header, headerStyle]}>
        <BlurView intensity={80} tint="light" style={styles.headerBlur}>
          <LinearGradient
            colors={['#004AAD', '#92ACEC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            {/* Full Header Content */}
            <Animated.View style={[styles.headerContent, headerContentStyle]}>
              <Text style={styles.headerTitle}>المفضلة</Text>
              {favorites.length > 0 && (
                <View style={styles.headerInfo}>
                  <Text style={styles.itemCount}>
                    {favorites.length} {favorites.length === 1 ? 'منتج' : 'منتجات'}
                  </Text>
                  <Text style={styles.totalPrice}>
                    المجموع: {favorites.reduce((total, item) => total + (item.discountPrice || item.price), 0)} MRU
                  </Text>
                </View>
              )}
            </Animated.View>

            {/* Minimized Header Content */}
            <Animated.View style={[styles.minimizedHeader, minimizedHeaderStyle]}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>المفضلة</Text>
                <View style={styles.logoUnderline} />
              </View>
            </Animated.View>

            <View style={styles.decorativeElements}>
              <LinearGradient
                colors={['rgba(250,196,67,0.15)', 'rgba(255,215,0,0.1)']}
                style={[styles.decorCircle, { transform: [{ rotate: '45deg' }] }]}
              />
              <LinearGradient
                colors={['rgba(146,172,236,0.2)', 'rgba(0,74,173,0.15)']}
                style={[styles.decorDot]}
              />
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>

      <Animated.FlatList
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.favoritesList,
          { 
            paddingTop: 160 + insets.top,
            paddingBottom: 100,
          }
        ]}
        key="singleColumn"
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item._id || item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Animatable.View 
            animation="fadeIn" 
            style={styles.emptyContainer}
          >
            <FontAwesome5 name="heart" size={64} color="#92ACEC" />
            <Text style={styles.emptyText}>لا توجد منتجات في المفضلة</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Home')}
              style={styles.shopNowButton}
            >
              <LinearGradient
                colors={['#004AAD', '#92ACEC']}
                style={styles.shopNowGradient}
              >
                <Text style={styles.shopNowText}>تسوق الآن</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
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
    backgroundColor: '#f5f6fa',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: 150,
    overflow: 'hidden',
  },
  headerBlur: {
    flex: 1,
  },
  headerGradient: {
    flex: 1,
    padding: 20,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'right',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerInfo: {
    marginTop: 8,
  },
  itemCount: {
    fontSize: 16,
    color: '#FAC443',
    textAlign: 'right',
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'right',
    marginTop: 4,
    opacity: 0.9,
  },
  decorativeElements: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
    opacity: 0.8,
  },
  decorCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    top: -50,
    left: -50,
    opacity: 0.7,
  },
  decorDot: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    bottom: 20,
    right: 40,
    opacity: 0.8,
  },
  favoritesList: {
    padding: 16,
  },
  favoriteCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    backgroundColor: 'white',
  },
  cardBlur: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  cardGradient: {
    borderRadius: 24,
  },
  imageSection: {
    position: 'relative',
    height: 220,
  },
  favoriteImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    borderRadius: 15,
    overflow: 'hidden',
  },
  priceBlur: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  priceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  originalPrice: {
    color: '#fff',
    fontSize: 12,
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 25,
    overflow: 'hidden',
  },
  heartBlur: {
    padding: 4,
  },
  heartGradient: {
    padding: 8,
    borderRadius: 20,
  },
  detailsSection: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#004AAD',
    marginBottom: 16,
    textAlign: 'right',
    lineHeight: 24,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(146,172,236,0.08)',
    padding: 12,
    borderRadius: 16,
  },
  storeLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 12,
    borderWidth: 2,
    borderColor: 'rgba(146,172,236,0.2)',
  },
  storeName: {
    flex: 1,
    fontSize: 14,
    color: '#004AAD',
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginBottom: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(146,172,236,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: '#004AAD',
    fontWeight: '600',
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#004AAD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  similarSection: {
    marginTop: 32,
    marginBottom: 100,
  },
  similarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004AAD',
    marginBottom: 20,
    textAlign: 'right',
    paddingHorizontal: 16,
  },
  similarList: {
    paddingLeft: 16,
    paddingBottom: 16,
  },
  similarCard: {
    width: width * 0.6,
    marginRight: 16,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    backgroundColor: 'white',
  },
  similarImageContainer: {
    position: 'relative',
    height: width * 0.5,
    backgroundColor: '#f5f6fa',
  },
  similarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  similarPriceTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  similarPriceBlur: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  similarPriceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },
  similarOriginalPrice: {
    color: '#fff',
    fontSize: 12,
    textDecorationLine: 'line-through',
    opacity: 0.7,
    textAlign: 'right',
  },
  similarBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  similarBadgeBlur: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  similarBadgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  similarBadgeText: {
    color: '#004AAD',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  similarDetails: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  similarName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004AAD',
    marginBottom: 12,
    textAlign: 'right',
    lineHeight: 22,
  },
  similarStoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(146,172,236,0.08)',
    padding: 10,
    borderRadius: 12,
  },
  similarStoreLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: 'rgba(146,172,236,0.2)',
  },
  similarStoreName: {
    flex: 1,
    fontSize: 14,
    color: '#004AAD',
    textAlign: 'right',
    fontWeight: '600',
  },
  similarStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  similarStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(146,172,236,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  similarStatText: {
    fontSize: 12,
    color: '#004AAD',
    fontWeight: '600',
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
  shopNowGradient: {
    borderRadius: 8,
    padding: 10,
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
  minimizedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight + 10,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F9F8F4',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  logoUnderline: {
    width: 20,
    height: 2,
    backgroundColor: '#FAC443',
    borderRadius: 1,
    marginTop: 2,
  },
});

export default FavoritesScreen; 