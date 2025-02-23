import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  Linking,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { homeService } from '../services/homeService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from './CustomAlert';
import { favoriteService } from '../services/favoriteService';
import { cartService } from '../services/cartService';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
  withSpring,
  withTiming,
  interpolateColor,
  withRepeat,
  withSequence,
  FadeIn,
  FadeInRight,
  SlideInRight
} from 'react-native-reanimated';
import { SharedElement } from 'react-navigation-shared-element';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { clientService } from '../services/clientService';
import { FlashList } from '@shopify/flash-list';
import LottieView from 'lottie-react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LoadingScreen from './LoadingScreen';
import MaskedView from '@react-native-masked-view/masked-view';
import * as Animatable from 'react-native-animatable';
import { Easing } from 'react-native-reanimated';
import { Video } from 'expo-av';
import Svg, { Path, G, Circle, Defs, Pattern, Use } from 'react-native-svg';
import { FontAwesome5 } from '@expo/vector-icons';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const { width } = Dimensions.get('window');

const HEADER_MAX_HEIGHT = 180;
const HEADER_MIN_HEIGHT = 90;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const BANNER_HEIGHT = 200;
const BANNER_DATA = [
  {
    id: '1',
    image: 'https://i.postimg.cc/t403yfn9/home2.jpg',
  },
  {
    id: '2',
    image: 'https://i.postimg.cc/t403yfn9/home2.jpg',
  },
  {
    id: '3',
    image: 'https://i.postimg.cc/t403yfn9/home2.jpg',
  },
];

const HomeScreen = () => {
  // 1. First, declare all state hooks
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [homeData, setHomeData] = useState({
    categories: { main: [], sub: [] },
    personalized: {
      followedStores: [],
      orderedProducts: [],
      recentlyViewed: [],
      recommended: [],
      similarProducts: [],
      trendingInInterests: [],
      recommendedBrands: []
    },
    specialStores: [],
    specialProducts: [],
    discountedProducts: [],
    mostSoldStores: [],
    mostSoldProducts: [],
    brands: []
  });

  // Kişiselleştirilmiş veriler için state'ler
  const [favoriteCategories, setFavoriteCategories] = useState([]);

  // Kategori state'leri
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [viewedCategories, setViewedCategories] = useState([]);

  const [followedStores, setFollowedStores] = useState([]);
  const [orderedProducts, setOrderedProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [favoriteItems, setFavoriteItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 2. Refs
  const scrollViewRef = useRef(null);

  // 3. Animation related hooks
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolate.CLAMP
    );

    const backgroundColor = interpolateColor(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      ['transparent', '#004AAD']
    );

    return {
      height,
      backgroundColor: withSpring(backgroundColor, {
        damping: 15,
        stiffness: 100
      }),
    };
  });

  const fullHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE * 0.6],
      [1, 0],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [1, 0.9],
      Extrapolate.CLAMP
    );

    return {
      opacity: withTiming(opacity, { duration: 200 }),
      transform: [
        { scale: withSpring(scale) },
        { 
          translateY: withSpring(
            interpolate(
              scrollY.value,
              [0, HEADER_SCROLL_DISTANCE],
              [0, -20],
              Extrapolate.CLAMP
            )
          ) 
        }
      ],
    };
  });

  const minimizedHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HEADER_SCROLL_DISTANCE * 0.5, HEADER_SCROLL_DISTANCE],
      [0, 1],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [HEADER_SCROLL_DISTANCE * 0.5, HEADER_SCROLL_DISTANCE],
      [0.8, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity: withTiming(opacity, { duration: 200 }),
      transform: [
        { scale: withSpring(scale) },
        { 
          translateY: withSpring(
            interpolate(
              scrollY.value,
              [0, HEADER_SCROLL_DISTANCE],
              [20, 0],
              Extrapolate.CLAMP
            )
          ) 
        }
      ],
    };
  });

  // 4. Callbacks
  const handleScrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  // 5. Then your useEffects
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        loadHomeData();
        loadUserProfile();
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const loadHomeData = async () => {
    try {
      console.log('=== Loading Home Screen Data ===');
      setLoading(true);
      
      const response = await homeService.getHomeData();
      console.log('Home Data Response:', {
        success: response.success,
        categories: {
          main: response.data?.categories?.main?.length || 0,
          sub: response.data?.categories?.sub?.length || 0
        },
        personalized: {
          followedStores: response.data?.personalized?.followedStores?.length || 0,
          orderedProducts: response.data?.personalized?.orderedProducts?.length || 0
        }
      });
      
      if (response.success) {
        setHomeData(response.data);
        setMainCategories(response.data.categories?.main || []);
        setSubCategories(response.data.categories?.sub || []);
        console.log('Data successfully set to state');
      }
    } catch (error) {
      console.error('Error loading home data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      console.log('=== End Loading Home Screen Data ===');
    }
  };

  const loadUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await clientService.getProfile();
        if (response.success) {
          setUserProfile(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  const renderPersonalizedSection = () => {
    const hasPersonalizedData = homeData.personalized?.followedStores?.length > 0 || 
                               homeData.personalized?.orderedProducts?.length > 0;

    if (!hasPersonalizedData) return null;

    return (
      <Animated.View 
        entering={FadeIn.delay(300)}
        style={styles.personalizedSection}
      >
        <BlurView intensity={50} style={styles.blurContainer}>
          <Text style={styles.sectionTitle}>نشاطك</Text>
          
          {/* Followed Stores */}
          {homeData.personalized?.followedStores?.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>المتاجر المتابعة</Text>
              <Animated.ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
              >
                {homeData.personalized.followedStores.map((store, index) => (
                  <Animated.View 
                    key={store._id}
                    entering={FadeInRight.delay(index * 100)}
                  >
                    <TouchableOpacity 
                      style={styles.storeCard}
                      onPress={() => navigation.navigate('Store', { storeId: store._id })}
                    >
                      <SharedElement id={`store.${store._id}.image`}>
                        <Image source={{ uri: store.logo }} style={styles.storeLogo} />
                      </SharedElement>
                      <Text style={styles.storeName}>{store.name}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </Animated.ScrollView>
            </>
          )}

          {/* Recent Orders */}
          {homeData.personalized?.orderedProducts?.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>الطلبات الأخيرة</Text>
              <Animated.ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
              >
                {homeData.personalized.orderedProducts.map((product, index) => (
                  <Animated.View 
                    key={product._id}
                    entering={FadeInRight.delay(index * 100)}
                  >
                    <TouchableOpacity 
                      style={styles.productCard}
                      onPress={() => navigation.navigate('ProductDetail', { productId: product._id })}
                    >
                      <SharedElement id={`product.${product._id}.image`}>
                        <Image source={{ uri: product.images[0] }} style={styles.productImage} />
                      </SharedElement>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productPrice}>{product.price} MRU</Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </Animated.ScrollView>
            </>
          )}
        </BlurView>
      </Animated.View>
    );
  };

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  };

  const handleAuthRequired = (action) => {
    setAuthMessage(
      action === 'favorite' 
        ? 'يجب عليك تسجيل الدخول لإضافة المنتج إلى المفضلة'
        : 'يجب عليك تسجيل الدخول لإضافة المنتج إلى السلة'
    );
    setShowAuthAlert(true);
  };

  const handleLogin = () => {
    setShowAuthAlert(false);
    navigation.navigate('Auth');
  };

  const toggleFavorite = async (productId) => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      handleAuthRequired('favorite');
      return;
    }

    try {
      console.log('Toggling favorite for product:', productId);
      const response = await favoriteService.toggleFavorite(productId);
      console.log('Toggle favorite response:', response);
      
      if (response.success) {
    setFavorites((prevFavorites) => ({
      ...prevFavorites,
      [productId]: !prevFavorites[productId],
    }));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleAddToCart = async (product) => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      handleAuthRequired('cart');
      return;
    }

    try {
      console.log('Adding to cart:', product._id);
      const response = await cartService.addToCart(product._id, 1);
      console.log('Add to cart response:', response);
      
      if (response.success) {
        // Başarılı ekleme bildirimi göster
        Alert.alert('نجاح', 'تمت إضافة المنتج إلى السلة بنجاح');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleProductPress = (product) => {
    trackActivity('product', product._id);
    navigation.navigate('ProductDetailScreen', { 
      productId: product._id,
      product: product 
    });
  };

  const handleStorePress = (store) => {
    trackActivity('store', store._id);
    navigation.navigate('Store', { 
      storeId: store._id,
      store: store 
    });
  };

  const handleBrandPress = (brand) => {
    trackActivity('brand', brand._id);
    navigation.navigate('BrandProducts', { 
      brandId: brand._id,
      brand: brand 
    });
  };

  const handleCategoryPress = (category) => {
    trackActivity('category', category._id);
    navigation.navigate('CategoryProducts', { 
      categoryId: category._id,
      category: category 
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { initialQuery: searchQuery });
      setSearchQuery('');
    }
  };

  const renderHeader = () => (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      <LinearGradient
        colors={['#004AAD', '#92ACEC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Full Header Content */}
        <Animated.View style={[styles.fullHeader, fullHeaderStyle]}>
          <View style={styles.topRow}>
          <TouchableOpacity 
              style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Image 
                source={userProfile?.avatar ? { uri: userProfile.avatar } : require('../assets/placeholder.jpeg')}
                style={styles.profileImage}
            />
          </TouchableOpacity>

            <View style={styles.rightButtons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('Notifications')}
            >
                <Ionicons name="notifications-outline" size={24} color="#F9F8F4" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
            </TouchableOpacity>
              
            <TouchableOpacity 
              style={styles.iconButton}
                onPress={() => navigation.navigate('Cart')}
              >
                <Ionicons name="cart-outline" size={24} color="#F9F8F4" />
                {cartItems.length > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.badgeText}>{cartItems.length}</Text>
                  </View>
                )}
            </TouchableOpacity>
          </View>
        </View>

          <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#92ACEC" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
                placeholder="ابحث عن منتجات..."
                placeholderTextColor="#92ACEC"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              />
            </View>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => navigation.navigate('Filters')}
            >
              <Ionicons name="options-outline" size={24} color="#F9F8F4" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Minimized Header */}
        <Animated.View style={[styles.minimizedHeader, minimizedHeaderStyle]}>
          <TouchableOpacity 
            style={styles.logoContainer}
            onPress={handleScrollToTop}
            activeOpacity={0.7}
          >
            <Text style={styles.logoText}>Bi3LY</Text>
            <View style={styles.logoUnderline} />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );

  const FloatingBubble = ({ delay, radius }) => {
    return (
      <Animated.View
        style={[
          styles.bubble,
          {
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            transform: [
              { translateX: Math.random() * width },
              { translateY: Math.random() * 140 }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(146, 172, 236, 0.2)', 'rgba(146, 172, 236, 0.1)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    );
  };

  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScrollContent}
      >
        {mainCategories.map((category, index) => (
    <TouchableOpacity
            key={category._id}
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.7}
          >
            <View style={styles.categoryContainer}>
              {/* Decorative shapes */}
              <View style={[styles.decorativeCircle, { backgroundColor: '#FAC443' }]} />
              <View style={[styles.decorativeCircle2, { backgroundColor: '#92ACEC' }]} />
              <View style={[styles.decorativeDot, { backgroundColor: '#004AAD' }]} />
              <View style={[styles.decorativeDot2, { backgroundColor: '#3d4785' }]} />
              
              {/* Category content */}
              <View style={styles.categoryContent}>
                <View style={styles.categoryImageWrapper}>
        <Image
                    source={{ uri: category.image }}
                    style={styles.categoryImage}
          defaultSource={require('../assets/placeholder.jpeg')}
        />
      </View>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {category.name}
                </Text>
              </View>
            </View>
        </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSubCategories = () => (
    <View style={styles.subCategoriesSection}>
      <View style={styles.subCategoryHeader}>
        <Text style={styles.subCategoryTitle}>التصنيفات الفرعية</Text>
        <View style={styles.titleDecoration}>
          <View style={[styles.decorativeLine, { backgroundColor: '#FAC443' }]} />
          <View style={[styles.decorativeDot, { backgroundColor: '#004AAD' }]} />
        </View>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subCategoriesScrollContent}
      >
        {subCategories.map((category, index) => (
    <TouchableOpacity
            key={category._id}
      style={styles.subCategoryItem}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.7}
    >
      <LinearGradient
              colors={['#ffffff', '#f8f9ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.subCategoryCard}
            >
              <View style={styles.subCategoryImageWrapper}>
        <Image
                  source={{ uri: category.image }}
          style={styles.subCategoryImage}
          defaultSource={require('../assets/placeholder.jpeg')}
        />
                <View style={styles.imageGradientOverlay}>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,74,173,0.05)']}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
              </View>
              
              <View style={styles.subCategoryDetails}>
                <Text style={styles.subCategoryName} numberOfLines={1}>
                  {category.name}
                </Text>
                <View style={styles.parentLabelContainer}>
                  <View style={styles.parentLabel}>
                    <Text style={styles.parentCategoryName} numberOfLines={1}>
                      {category.parent?.name}
                    </Text>
                  </View>
                  <View style={styles.labelAccent} />
                </View>
              </View>

              <View style={styles.cardDecoration}>
                <View style={[styles.decorativeShape, { backgroundColor: '#FAC443' }]} />
                <View style={[styles.decorativeShape2, { backgroundColor: '#92ACEC' }]} />
      </View>
      </LinearGradient>
    </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSpecialStores = () => (
    <View style={styles.specialStoresSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>المتاجر المميزة</Text>
        <View style={styles.titleAccent}>
          <LinearGradient
            colors={['#FAC443', '#92ACEC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentLine}
          />
        </View>
      </View>
      
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.specialStoresScrollContent}
      >
        {homeData.specialStores.map((store) => (
    <TouchableOpacity
            key={store._id}
            style={styles.specialStoreCard}
            onPress={() => handleStorePress(store)}
            activeOpacity={0.7}
          >
            <View style={styles.storeImageContainer}>
      <Image
                source={{ uri: store.banner }}
                style={styles.storeBannerImage}
        defaultSource={require('../assets/placeholder.jpeg')}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.bannerOverlay}
              />
              <View style={styles.storeLogoWrapper}>
            <Image
                  source={{ uri: store.logo }}
              style={styles.storeLogo}
              defaultSource={require('../assets/placeholder.jpeg')}
            />
          </View>
            </View>
            
            <View style={styles.storeInfo}>
              <Text style={styles.storeName} numberOfLines={1}>
                {store.name}
              </Text>
            <View style={styles.storeStats}>
              <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FAC443" />
                  <Text style={styles.ratingText}>
                    {store.rating?.toFixed(1) || '0.0'}
                  </Text>
        </View>
                <Text style={styles.followersCount}>
                  {store.followers?.length || 0} متابع
                </Text>
      </View>
          </View>
    </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.mostSoldProductCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#ffffff', '#f8f9ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mostSoldProductInner}
      >
        {/* Top Seller Badge */}
        <View style={styles.topSellerTag}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topSellerBadge}
          >
            <Ionicons name="trending-up" size={16} color="#ffffff" />
            <Text style={styles.topSellerText}>الأكثر مبيعاً</Text>
          </LinearGradient>
        </View>

        {/* Product Image Section */}
        <View style={styles.mostSoldImageWrapper}>
          <Image
            source={{ uri: item.images[0] }}
            style={styles.mostSoldProductImage}
            defaultSource={require('../assets/placeholder.jpeg')}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Price Tag */}
          <View style={styles.priceTagContainer}>
            <BlurView intensity={90} tint="dark" style={styles.priceTag}>
              <Text style={styles.priceText}>{item.price} أوقية</Text>
          </BlurView>
      </View>
        </View>

        {/* Product Details */}
        <View style={styles.mostSoldProductDetails}>
          <Text style={styles.mostSoldProductName} numberOfLines={2}>
          {item.name}
        </Text>

          {/* Store Info */}
          <View style={styles.storeInfoRow}>
            <Image
              source={{ uri: item.store.logo }}
              style={styles.storeLogoSmall}
              defaultSource={require('../assets/placeholder.jpeg')}
            />
            <Text style={styles.storeNameText} numberOfLines={1}>
              {item.store.name}
            </Text>
        </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Ionicons name="star" size={14} color="#FAC443" />
              <Text style={styles.statText}>
                {item.rating?.toFixed(1) || '0.0'}
              </Text>
            </View>
            <View style={styles.statBadge}>
              <Ionicons name="flash" size={14} color="#92ACEC" />
              <Text style={styles.statText}>{item.sold} مبيعات</Text>
            </View>
            {item.views > 0 && (
              <View style={styles.statBadge}>
                <Ionicons name="eye" size={14} color="#92ACEC" />
                <Text style={styles.statText}>{item.views}</Text>
              </View>
            )}
        </View>
      </View>

        {/* Decorative Elements */}
        <View style={styles.decorativeElements}>
          <LinearGradient
            colors={['#FAC443', '#FFD700']}
            style={styles.decorCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <LinearGradient
            colors={['#92ACEC', '#004AAD']}
            style={styles.decorDot}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderRemiseProduct = ({ item: product }) => {
    // Log the product data to see what we're receiving
    console.log('Remise Product Data:', product);
    
    // Check for price fields with different possible names
    const oldPrice = product.price; // Original price
    const currentPrice = product.discountPrice || product.discountedPrice; // Discounted price
    
    const discountPercentage = oldPrice && currentPrice ? 
      Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0;
    
    return (
    <TouchableOpacity
      style={styles.remiseProductCard}
        onPress={() => handleProductPress(product)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#ffffff', '#f8f9ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.remiseProductInner}
        >
          {/* Discount Badge */}
          <View style={styles.discountBadgeContainer}>
            <LinearGradient
              colors={['#FF4B4B', '#FF6B6B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.discountBadge}
            >
              <Text style={styles.discountText}>-{discountPercentage}%</Text>
            </LinearGradient>
          </View>

          {/* Product Image */}
      <View style={styles.remiseImageContainer}>
        <Image
              source={{ uri: product.images[0] }}
          style={styles.remiseProductImage}
          defaultSource={require('../assets/placeholder.jpeg')}
        />
      </View>

          {/* Product Details */}
          <View style={styles.remiseProductDetails}>
        <Text style={styles.remiseProductName} numberOfLines={2}>
              {product.name}
        </Text>

            {/* Price Section */}
            <View style={styles.remisePriceSection}>
              <Text style={styles.remiseOldPrice}>
                {oldPrice} أوقية
              </Text>
              <Text style={styles.remiseNewPrice}>
                {currentPrice} أوقية
              </Text>
            </View>

            {/* Store Info */}
        <View style={styles.remiseStoreInfo}>
              <Image
                source={{ uri: product.store.logo }}
                style={styles.remiseStoreLogo}
                defaultSource={require('../assets/placeholder.jpeg')}
              />
          <Text style={styles.remiseStoreName} numberOfLines={1}>
                {product.store.name}
          </Text>
      </View>

            {/* Stats Row */}
            <View style={styles.remiseStats}>
              <View style={styles.remiseStatItem}>
                <Ionicons name="star" size={14} color="#FAC443" />
                <Text style={styles.remiseStatText}>
                  {product.rating?.toFixed(1) || '0.0'}
          </Text>
        </View>
              <View style={styles.remiseStatItem}>
                <Ionicons name="flash" size={14} color="#92ACEC" />
                <Text style={styles.remiseStatText}>{product.sold} مبيعات</Text>
      </View>
            </View>
          </View>

          {/* Decorative Elements */}
          <View style={styles.remiseDecorativeContainer}>
            <LinearGradient
              colors={['#FF4B4B', '#FF6B6B']}
              style={styles.remiseDecorCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <LinearGradient
              colors={['#92ACEC', '#004AAD']}
              style={styles.remiseDecorDot}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
        </LinearGradient>
    </TouchableOpacity>
  );
  };

  const renderBrandGridItem = ({ item }) => (
    <TouchableOpacity
      style={styles.brandGridItem}
      onPress={() => handleBrandPress(item)}
    >
      <Image 
        source={{ uri: item.logo }} 
        style={styles.brandGridLogo} 
        defaultSource={require('../assets/placeholder.jpeg')}
      />
      <Text style={styles.brandGridName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const calculateDiscount = (originalPrice, discountPrice) => {
    const original = parseFloat(originalPrice);
    const discounted = parseFloat(discountPrice);
    if (isNaN(original) || isNaN(discounted) || original === 0) return 0;
    return Math.round(((original - discounted) / original) * 100);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <AntDesign
          key={i}
          name={i <= rating ? "star" : "staro"}
          size={12}
          color="#FFD700"
        />
      );
    }
    return stars;
  };

  // Aktivite takibi
  const trackActivity = async (type, itemId) => {
    try {
      // Geçerli aktivite tiplerini kontrol et
      const validTypes = ['view_product', 'view_category', 'view_brand', 'search', 'add_to_cart', 'purchase'];
      const typeMapping = {
        'product': 'view_product',
        'category': 'view_category',
        'brand': 'view_brand',
        'search': 'search',
        'cart': 'add_to_cart'
      };

      const mappedType = typeMapping[type] || type;
      
      if (!validTypes.includes(mappedType)) {
        console.warn('Invalid activity type:', type);
        return;
      }

      await homeService.trackActivity(mappedType, itemId);
    } catch (error) {
      console.error('Activity tracking error:', error);
    }
  };

  const BannerSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);
    const scrollRef = useRef(null);

    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollX.value = event.contentOffset.x;
      },
    });

    useEffect(() => {
      const timer = setInterval(() => {
        if (scrollRef.current) {
          const nextIndex = (currentIndex + 1) % BANNER_DATA.length;
          scrollRef.current.scrollToIndex({
            index: nextIndex,
            animated: true
          });
          setCurrentIndex(nextIndex);
        }
      }, 5000);

      return () => clearInterval(timer);
    }, [currentIndex]);

    const getItemLayout = (data, index) => ({
      length: width,
      offset: width * index,
      index,
    });

    const renderBannerItem = ({ item }) => (
      <View style={styles.bannerItemContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.bannerImage}
          resizeMode="cover"
        />
        </View>
    );

    const renderPagination = () => (
      <View style={styles.paginationContainer}>
        {BANNER_DATA.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = useAnimatedStyle(() => {
            const width = interpolate(
              scrollX.value,
              inputRange,
              [8, 24, 8],
              Extrapolate.CLAMP
            );

            const backgroundColor = interpolateColor(
              scrollX.value,
              inputRange,
              [
                'rgba(146, 172, 236, 0.5)', // #92ACEC with opacity
                '#FAC443',                   // Active dot color
                'rgba(146, 172, 236, 0.5)',  // #92ACEC with opacity
              ]
            );

            return {
              width: withSpring(width, {
                damping: 20,
                stiffness: 200
              }),
              backgroundColor: withTiming(backgroundColor, {
                duration: 200
              }),
            };
          });

    return (
            <Animated.View
              key={index.toString()}
              style={[styles.paginationDot, dotWidth]}
            />
          );
        })}
        </View>
    );

  return (
      <View style={styles.bannerContainer}>
        <Animated.FlatList
          ref={scrollRef}
          data={BANNER_DATA}
          renderItem={renderBannerItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
          getItemLayout={getItemLayout}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={3}
        />
        {renderPagination()}
      </View>
    );
  };

  const renderStoreItem = ({ item, index }) => (
                  <TouchableOpacity
      style={styles.mostSoldStoreCard}
      onPress={() => handleStorePress(item)}
      activeOpacity={0.9}
                  >
                    <LinearGradient
        colors={['#ffffff', '#f8f9ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mostSoldStoreInner}
      >
        {/* Top Seller Badge for top 3 */}
        {index < 3 && (
          <View style={styles.topSellerBadgeContainer}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topSellerBadge}
            >
              <Ionicons name="trophy" size={16} color="#ffffff" />
              <Text style={styles.topSellerText}>Top {index + 1}</Text>
            </LinearGradient>
          </View>
        )}

        {/* Store Banner & Logo */}
        <View style={styles.mostSoldStoreBannerContainer}>
                      <Image
            source={{ uri: item.banner }}
            style={styles.mostSoldStoreBanner}
                        defaultSource={require('../assets/placeholder.jpeg')}
                      />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.bannerOverlay}
          />
          <View style={styles.mostSoldStoreLogoContainer}>
            <Image
              source={{ uri: item.logo }}
              style={styles.mostSoldStoreLogo}
              defaultSource={require('../assets/placeholder.jpeg')}
            />
          </View>
        </View>

        {/* Store Info */}
        <View style={styles.mostSoldStoreInfo}>
          <View style={styles.storeNameRow}>
            <Text style={styles.mostSoldStoreName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.mostSoldStoreLogoContainer}>
              <Image
                source={{ uri: item.logo }}
                style={styles.mostSoldStoreLogo}
                defaultSource={require('../assets/placeholder.jpeg')}
              />
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.mostSoldStoreStats}>
            <View style={styles.statBadge}>
              <Ionicons name="star" size={14} color="#FAC443" />
              <Text style={styles.statText}>
                {item.rating?.toFixed(1) || '0.0'}
              </Text>
            </View>
            <View style={styles.statBadge}>
              <Ionicons name="people" size={14} color="#92ACEC" />
              <Text style={styles.statText}>
                {item.followers?.length || 0}
              </Text>
            </View>
            <View style={styles.statBadge}>
              <Ionicons name="cube" size={14} color="#92ACEC" />
              <Text style={styles.statText}>
                {item.productsCount || 0}
              </Text>
            </View>
          </View>

          {/* Sales Info */}
          <View style={styles.salesInfoContainer}>
            <LinearGradient
              colors={['rgba(146,172,236,0.15)', 'rgba(146,172,236,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.salesInfoGradient}
            >
              <Ionicons name="flash" size={16} color="#004AAD" />
              <Text style={styles.salesText}>
                {item.totalSales} مبيعات
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Decorative Elements */}
        <View style={styles.decorativeContainer}>
          <LinearGradient
            colors={['#FAC443', '#FFD700']}
            style={styles.decorCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <LinearGradient
            colors={['#92ACEC', '#004AAD']}
            style={styles.decorDot}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
                    </LinearGradient>
                  </TouchableOpacity>
  );

  // Add this reusable section header component
  const SectionHeader = ({ title }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.titleAccent}>
        <LinearGradient
          colors={['#FAC443', '#92ACEC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentLine}
        />
              </View>
            </View>
  );

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const viewedDate = new Date(timestamp);
    const diffInHours = Math.floor((now - viewedDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'الآن';
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `منذ ${diffInDays} يوم`;
    }
  };

  const SpecialProductCard = ({ product }) => {
    return (
      <TouchableOpacity
        style={styles.specialProductCard}
        onPress={() => handleProductPress(product)}
        activeOpacity={0.9}
      >
              <View>
          <LinearGradient
            colors={['#ffffff', '#f8f9ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.specialProductInner}
          >
            {/* Premium Badge */}
            <View style={styles.premiumBadgeContainer}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.premiumBadge}
              >
                <Ionicons name="star" size={16} color="#ffffff" />
                <Text style={styles.premiumText}>منتج مميز</Text>
              </LinearGradient>
            </View>

            {/* Product Image with 3D Effect */}
            <View style={styles.specialImageContainer}>
              <MaskedView
                maskElement={
                  <LinearGradient
                    colors={['transparent', '#000000', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                }
              >
                <Image
                  source={{ uri: product.images[0] }}
                  style={styles.specialProductImage}
                  defaultSource={require('../assets/placeholder.jpeg')}
                />
              </MaskedView>
              
              {/* Floating Price Tag with Glass Effect */}
              <View style={styles.floatingPriceContainer}>
                <BlurView intensity={90} tint="light" style={styles.blurPrice}>
                  <Text style={styles.specialPriceText}>
                    {product.price} أوقية
                  </Text>
                  <LinearGradient
                    colors={['#FAC443', '#FFD700']}
                    style={styles.priceLine}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </BlurView>
                    </View>
              </View>

            {/* Product Details with Premium Styling */}
            <View style={styles.specialProductDetails}>
              <Text style={styles.specialProductName} numberOfLines={2}>
                {product.name}
              </Text>

              {/* Store Info with Premium Badge */}
              <View style={styles.storeInfoContainer}>
                    <LinearGradient
                  colors={['rgba(146,172,236,0.15)', 'rgba(146,172,236,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.storeInfoGradient}
                    >
                      <Image
                    source={{ uri: product.store.logo }}
                    style={styles.specialStoreLogo}
                        defaultSource={require('../assets/placeholder.jpeg')}
                      />
                  <View style={styles.storeTextContainer}>
                    <Text style={styles.specialStoreName}>{product.store.name}</Text>
                    <View style={styles.ratingContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= product.rating ? "star" : "star-outline"}
                          size={14}
                          color="#FAC443"
                          style={styles.starIcon}
                        />
                      ))}
                      <Text style={styles.ratingText}>
                        {product.rating?.toFixed(1) || '0.0'}
                      </Text>
                    </View>
                      </View>
                    </LinearGradient>
              </View>

              {/* Product Stats with Icons */}
              <View style={styles.productStats}>
                {product.sold > 0 && (
                  <View style={styles.statItem}>
                    <Ionicons name="flash" size={16} color="#92ACEC" />
                    <Text style={styles.statText}>{product.sold} مبيعات</Text>
                  </View>
                )}
                {product.views > 0 && (
                  <View style={styles.statItem}>
                    <Ionicons name="eye" size={16} color="#92ACEC" />
                    <Text style={styles.statText}>{product.views} مشاهدة</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Premium Decorative Elements */}
            <View style={styles.decorativeContainer}>
              <LinearGradient
                colors={['#FAC443', '#FFD700']}
                style={styles.decorativeCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <LinearGradient
                colors={['#92ACEC', '#004AAD']}
                style={styles.decorativeDot}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.decorativeLine} />
            </View>
          </LinearGradient>
        </View>
                  </TouchableOpacity>
    );
  };

  // Add this function inside the HomeScreen component, near other handlers
  const handleFavoritePress = async (product) => {
    try {
      if (product.isFavorite) {
        await favoriteService.removeFavorite(product._id);
      } else {
        await favoriteService.addFavorite(product._id);
      }
      
      // Update local state
      const updatedHomeData = {
        ...homeData,
        mostSoldProducts: homeData.mostSoldProducts.map(p => 
          p._id === product._id ? { ...p, isFavorite: !p.isFavorite } : p
        )
      };
      setHomeData(updatedHomeData);

      // Track activity
      trackActivity('favorite', product._id);
    } catch (error) {
      console.error('Favorite toggle error:', error);
      setShowAlert({
        visible: true,
        message: 'حدث خطأ في تحديث المفضلة',
        type: 'error'
      });
    }
  };

  // Then inside the HomeScreen component, just define the BackgroundPattern component
  const BackgroundPattern = () => {
    const renderPatternRow = (rowIndex) => {
      return (
        <View key={`row-${rowIndex}`} style={styles.patternRow}>
          {[...Array(20)].map((_, colIndex) => {
            const randomIcon = [
              'shopping-cart',
              'shopping-bag',
              'gift',
              'tag',
              'star',
              'cube',
              'store',
              'credit-card',
              'dollar-sign',
              'wallet',
              'boxes',
              'crown'
            ][Math.floor(Math.random() * 12)];
            
            const randomColor = [
              'rgba(0,74,173,0.1)',
              'rgba(250,196,67,0.1)',
              'rgba(146,172,236,0.1)'
            ][Math.floor(Math.random() * 3)];
            
            return (
              <View key={`icon-${rowIndex}-${colIndex}`} style={styles.iconContainer}>
                <FontAwesome5
                  name={randomIcon}
                  size={16}
                  style={[
                    styles.patternIcon,
                    {
                      color: randomColor,
                      transform: [{ rotate: `${Math.random() * 360}deg` }]
                    }
                  ]}
                  solid
                />
              </View>
            );
          })}
            </View>
      );
    };
  
    return (
      <View style={styles.backgroundContainer}>
        <View style={styles.patternContainer}>
          {[...Array(60)].map((_, index) => renderPatternRow(index))}
        </View>
      </View>
    );
  };

  // Update your main return statement to include the background
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <StatusBar barStyle="light-content" />
      {renderHeader()}
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            progressViewOffset={HEADER_MAX_HEIGHT}
            colors={['#004AAD']}
            tintColor="#004AAD"
          />
        }
      >
        {renderCategories()}
        <BannerSlider />
            {renderPersonalizedSection()}

        {renderSpecialStores()}

        {/* Sub Categories */}
        {renderSubCategories()}

            {/* Recently Viewed Products */}
            {homeData.personalized.recentlyViewed.length > 0 && (
          <View style={styles.recentlyViewedSection}>
            <SectionHeader title="المنتجات المشاهدة مؤخراً" />
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.recentlyViewedScrollContent}
            >
                  {homeData.personalized.recentlyViewed.map((product) => (
                  <TouchableOpacity
                  key={`recent-${product._id}`}
                  style={styles.recentProductCard}
                  onPress={() => handleProductPress(product)}
                  activeOpacity={0.7}
                >
                  <View style={styles.recentProductImageContainer}>
                      <Image
                        source={{ uri: product.images[0] }}
                        style={styles.recentProductImage}
                        defaultSource={require('../assets/placeholder.jpeg')}
                      />
                        <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.5)']}
                      style={[StyleSheet.absoluteFill, styles.imageGradient]}
                    />
                    <View style={styles.recentProductOverlay}>
                      <View style={styles.recentProductPriceTag}>
                        <LinearGradient
                          colors={['#FAC443', '#92ACEC']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.priceGradient}
                        >
                        <Text style={styles.recentProductPrice}>
                          {product.price} أوقية
                        </Text>
                    </LinearGradient>
                    </View>
            </View>
            </View>
                    
                  <View style={styles.recentProductInfo}>
                      <Text style={styles.recentProductName} numberOfLines={2}>
                        {product.name}
                      </Text>
                    <View style={styles.recentProductFooter}>
                      <View style={styles.recentProductStore}>
                      <Image
                          source={{ uri: product.store.logo }}
                          style={styles.storeLogoSmall}
                        defaultSource={require('../assets/placeholder.jpeg')}
                      />
                        <Text style={styles.recentProductStoreName} numberOfLines={1}>
                          {product.store.name}
                        </Text>
                      </View>
                      <View style={styles.recentProductRating}>
                        <Ionicons name="star" size={12} color="#FAC443" />
                        <Text style={styles.ratingValue}>
                          {product.rating?.toFixed(1) || '0.0'}
                        </Text>
              </View>
            </View>
            </View>
                </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Recommended Products */}
            {homeData.personalized.recommended?.length > 0 && (
              <View>
            <SectionHeader title="منتجات موصى بها لك" />
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.specialStoresScrollContent}
            >
                  {homeData.personalized.recommended.map((product) => (
                    <View key={`recommended-${product._id}`}>
                      {renderProductItem({ item: product })}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Trending Products */}
            {homeData.personalized.trendingInInterests.length > 0 && (
              <View>
            <SectionHeader title="المنتجات الرائجة في مجال اهتمامك" />
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.specialStoresScrollContent}
            >
                  {homeData.personalized.trendingInInterests.map((product) => (
                    <View key={`trending-${product._id}`}>
                      {renderProductItem({ item: product })}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Special Products */}
            {homeData.specialProducts.length > 0 && (
              <View>
            <SectionHeader title="منتجات مميزة" />
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.specialProductsScrollContent}
              decelerationRate="fast"
              snapToInterval={width * 0.85 + 20}
            >
                  {homeData.specialProducts.map((product) => (
                <SpecialProductCard 
                  key={`special-${product._id}`} 
                  product={product} 
                />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Discounted Products */}
            {homeData.discountedProducts.length > 0 && (
              <View>
            <SectionHeader title="منتجات مخفضة" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
                  {homeData.discountedProducts.map((product) => (
                    <View key={`discount-${product._id}`}>
                      {renderRemiseProduct({ item: product })}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Similar Products */}
            {homeData.personalized.similarProducts.length > 0 && (
              <View>
            <SectionHeader title="منتجات مشابهة" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
                  {homeData.personalized.similarProducts.map((product) => (
                    <View key={`similar-${product._id}`}>
                      {renderProductItem({ item: product })}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Most Sold Stores */}
            {homeData.mostSoldStores.length > 0 && (
              <View>
            <SectionHeader title="المتاجر الأكثر مبيعاً" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storeList}>
                  {homeData.mostSoldStores.map((store, index) => (
                    <View key={`store-${store._id}`}>
                      {renderStoreItem({ item: store, index })}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Most Sold Products */}
            {homeData.mostSoldProducts.length > 0 && (
              <View>
            <SectionHeader title="المنتجات الأكثر مبيعاً" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
                  {homeData.mostSoldProducts.map((product) => (
                    <View key={`most-sold-${product._id}`}>
                      {renderProductItem({ item: product })}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Recommended Brands */}
            {homeData.personalized.recommendedBrands.length > 0 && (
              <View>
            <SectionHeader title="العلامات التجارية الموصى بها" />
                <View style={styles.brandGrid}>
                  {homeData.personalized.recommendedBrands.map((brand) => (
                    <View key={`brand-${brand._id}`}>
                      {renderBrandGridItem({ item: brand })}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* All Brands */}
            {homeData.brands.length > 0 && (
              <View>
            <SectionHeader title="جميع العلامات التجارية" />
                <View style={styles.brandGrid}>
                  {homeData.brands.map((brand) => (
                    <View key={`brand-${brand._id}`}>
                      {renderBrandGridItem({ item: brand })}
                    </View>
                  ))}
                </View>
              </View>
            )}
      </Animated.ScrollView>

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modalContent}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={300}
        animationOutTiming={300}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        backdropTransitionOutTiming={0}
        backdropOpacity={0.5}
      >
        <View style={styles.modalInnerContent}>
          {selectedProduct && (
            <>
              <Image source={{ uri: selectedProduct.image }} style={styles.modalImage} />
              <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
              <Text style={styles.modalProductDescription}>{selectedProduct.category}</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Ionicons name="remove-circle-outline" size={30} color="#ff6347" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                  <Ionicons name="add-circle-outline" size={30} color="#1E90FF" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.addToCartButton} onPress={() => handleAddToCart(selectedProduct)}>
                <Ionicons name="cart-outline" size={20} color="#fff" />
                <Text style={styles.addToCartText}>إضافة إلى السلة</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>

      <CustomAlert
        visible={showAuthAlert}
        message={authMessage}
        onLogin={handleLogin}
        onCancel={() => setShowAuthAlert(false)}
      />
      {isLoading && <LoadingScreen />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: HEADER_MAX_HEIGHT,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
  },
  fullHeader: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  minimizedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    padding: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F9F8F4',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  logoUnderline: {
    width: 40,
    height: 3,
    backgroundColor: '#FAC443',
    borderRadius: 2,
    marginTop: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F9F8F4',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(249, 248, 244, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FAC443',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F9F8F4',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FAC443',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F9F8F4',
  },
  badgeText: {
    color: '#004AAD',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8F4',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#004AAD',
    fontSize: 15,
    padding: 0,
    textAlign: 'right',
  },
  filterButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: 'rgba(249, 248, 244, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    height: BANNER_HEIGHT,
    marginTop: 15,
    marginBottom: 20,
  },
  bannerItemContainer: {
    width: width,
    height: BANNER_HEIGHT,
    paddingHorizontal: 20,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 20,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#92ACEC',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2.84,
    elevation: 3,
  },
  sectionHeader: {
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#004AAD',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleAccent: {
    width: 50,
    height: 2,
    overflow: 'hidden',
    borderRadius: 1,
  },
  accentLine: {
    flex: 1,
  },
  personalizedSection: {
    paddingVertical: 2,
    backgroundColor: '#f5f6fa',
    marginTop: 5,
    marginBottom: 8,
  },
  blurredContainer: {
    padding: 20,
  },
  subsectionTitle: {
    fontSize: 14,
    color: '#004AAD',
    fontWeight: '600',
    marginBottom: 4,
  },
  horizontalScroll: {
    paddingHorizontal: 15,
    paddingVertical: 2,
  },
  storeCard: {
    width: width * 0.8,
    height: 180,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  storeBanner: {
    width: '100%',
    height: '100%',
  },
  storeBannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    padding: 15,
    justifyContent: 'flex-end',
  },
  storeLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    marginRight: 12,
    overflow: 'hidden',
  },
  storeLogo: {
    width: '100%',
    height: '100%',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  storeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storeFollowers: {
    color: '#fff',
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  productList: {
    marginVertical: 8,
    marginHorizontal: 0,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 8,
    marginBottom: 16,
    width: width * 0.45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productCard: {
    backgroundColor: '#F9F8F4',
    borderRadius: 20,
    marginHorizontal: 10,
    marginVertical: 8,
    width: width * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    height: width * 0.5,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  productInfo: {
    padding: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004AAD',
    marginBottom: 8,
  },
  productDetails: {
    gap: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  storeNameText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'left',
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  priceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  discountPrice: {
    color: '#ff4444',
  },
  originalPrice: {
    color: '#fff',
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  cartButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
  },
  iconBackground: {
    borderRadius: 20,
    padding: 8,
    overflow: 'hidden',
  },
  remiseCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 8,
    marginBottom: 16,
    width: width * 0.45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  remiseImageContainer: {
    width: width * 0.4,
    height: 150,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  remiseGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 10,
  },
  discountBadge: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  remiseProductInfo: {
    padding: 12,
  },
  remiseProductName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
  },
  remiseStoreInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  remiseStoreName: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  remiseRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remiseRatingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  remiseReviewCount: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  remisePriceContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  remiseDiscountPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d4785',
    marginLeft: 8,
  },
  remiseOriginalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  cartButtonActive: {
    backgroundColor: 'rgba(61, 71, 133, 0.1)',
  },
  cartBadge: {
    position: 'absolute',
    top: 8,
    left: 40,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoriesSection: {
    marginVertical: 15,
    // Remove any background color properties
  },
  categoryItem: {
    marginHorizontal: 8,
    width: width * 0.25,
  },
  categoryContainer: {
    position: 'relative',
    padding: 12,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'transparent', // Changed from semi-transparent to fully transparent
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryImageWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Added slight background to image wrapper
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryName: {
    fontSize: 12,
    color: '#004AAD',
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.8)', // Added text shadow for better readability
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.15, // Slightly increased opacity
    top: -10,
    right: -10,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    opacity: 0.15, // Slightly increased opacity
    bottom: -8,
    left: -8,
  },
  decorativeDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.15, // Slightly increased opacity
    top: 10,
    left: 10,
  },
  decorativeDot2: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.15, // Slightly increased opacity
    bottom: 15,
    right: 15,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(146, 172, 236, 0.2)',
    borderRadius: 50,
  },
  subCategoriesSection: {
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  subCategoryHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  subCategoryTitle: {
    fontSize: 16,
    color: '#004AAD',
    fontWeight: '600',
    textAlign: 'center',
  },
  titleDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subCategoryItem: {
    width: width * 0.35,
    marginRight: 15,
    marginLeft: 5,
  },
  subCategoryCard: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#004AAD',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  subCategoryImageWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(146, 172, 236, 0.1)',
  },
  subCategoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  subCategoryDetails: {
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  parentLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  parentLabel: {
    backgroundColor: 'rgba(146, 172, 236, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(146, 172, 236, 0.1)',
  },
  labelAccent: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FAC443',
    marginLeft: 6,
  },
  cardDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
    pointerEvents: 'none',
  },
  decorativeShape: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.1,
    top: -15,
    right: -15,
  },
  decorativeShape2: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    opacity: 0.1,
    bottom: 10,
    left: -10,
  },
  specialStoresSection: {
    marginVertical: 15,
  },
  specialStoresScrollContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  specialStoreCard: {
    width: width * 0.7,
    marginRight: 15,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#004AAD',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  storeImageContainer: {
    width: '100%',
    height: width * 0.4,
    position: 'relative',
  },
  storeBannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  storeLogoWrapper: {
    position: 'absolute',
    bottom: -25,
    left: 15,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    padding: 3,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  storeLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  storeInfo: {
    padding: 15,
    paddingLeft: 75,
  },
  storeName: {
    fontSize: 16,
    color: '#004AAD',
    fontWeight: '600',
    marginBottom: 8,
  },
  storeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  followersCount: {
    fontSize: 14,
    color: '#92ACEC',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalInnerContent: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  modalProductName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004AAD',
    marginBottom: 10,
  },
  modalProductDescription: {
    fontSize: 14,
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004AAD',
    marginHorizontal: 10,
  },
  addToCartButton: {
    backgroundColor: '#FAC443',
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#004AAD',
    padding: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  brandGridItem: {
    width: width * 0.33,
    marginBottom: 10,
  },
  brandGridLogo: {
    width: '100%',
    height: width * 0.33,
    borderRadius: 12,
  },
  brandGridName: {
    fontSize: 14,
    color: '#004AAD',
    fontWeight: 'bold',
    marginTop: 5,
  },
  recentlyViewedSection: {
    marginVertical: 15,
  },
  recentlyViewedScrollContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  recentProductCard: {
    width: width * 0.45,
    marginRight: 15,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#004AAD',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  recentProductImageContainer: {
    width: '100%',
    height: width * 0.45,
    position: 'relative',
  },
  recentProductImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    opacity: 0.8,
  },
  recentProductOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  recentProductBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recentProductTime: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  recentProductPriceTag: {
    alignSelf: 'flex-end',
    overflow: 'hidden',
    borderRadius: 20,
  },
  priceGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  recentProductInfo: {
    padding: 12,
  },
  recentProductName: {
    fontSize: 14,
    color: '#004AAD',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'right',
    lineHeight: 20,
  },
  recentProductFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentProductStore: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storeLogoSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 8,
  },
  recentProductStoreName: {
    fontSize: 12,
    color: '#92ACEC',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  recentProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 196, 67, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingValue: {
    fontSize: 12,
    color: '#FAC443',
    fontWeight: '600',
    marginLeft: 4,
  },
  specialProductsScrollContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  specialProductCard: {
    width: width * 0.85,
    marginHorizontal: 10,
    marginVertical: 15,
    elevation: 15,
  },
  specialProductInner: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#ffffff',
    shadowColor: '#004AAD',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transform: [{ skewX: '-25deg' }],
  },
  premiumBadgeContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  premiumText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  specialImageContainer: {
    width: '100%',
    height: width * 0.5,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
  },
  specialProductImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    opacity: 0.8,
  },
  floatingPriceContainer: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    overflow: 'hidden',
    borderRadius: 16,
  },
  blurPrice: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  specialPriceText: {
    fontSize: 16,
    color: '#004AAD',
    fontWeight: '700',
  },
  specialProductDetails: {
    padding: 5,
  },
  specialProductName: {
    fontSize: 18,
    color: '#004AAD',
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'right',
    lineHeight: 24,
  },
  storeInfoContainer: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  storeInfoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 12,
  },
  specialStoreLogo: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  storeTextContainer: {
    flex: 1,
  },
  specialStoreName: {
    fontSize: 14,
    color: '#004AAD',
    fontWeight: '600',
    marginBottom: 4,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#92ACEC',
    fontWeight: '500',
  },
  decorativeContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.1,
    top: -40,
    left: -40,
  },
  decorativeDot: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.1,
    bottom: 40,
    left: -20,
  },
  decorativeLine: {
    position: 'absolute',
    width: 3,
    height: 60,
    opacity: 0.1,
    transform: [{ rotate: '45deg' }],
    bottom: 20,
    right: 40,
  },
  remiseProductCard: {
    width: width * 0.7,
    marginHorizontal: 10,
    marginVertical: 15,
    elevation: 15,
  },
  remiseProductInner: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#004AAD',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  discountBadgeContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
  discountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  discountText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  remiseImageContainer: {
    width: '100%',
    height: width * 0.45,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },
  remiseProductImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  remiseQuickActions: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    gap: 8,
  },
  remiseActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  remiseProductDetails: {
    padding: 4,
  },
  remiseProductName: {
    fontSize: 16,
    color: '#004AAD',
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'right',
    lineHeight: 22,
  },
  remisePriceSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  remiseOldPrice: {
    fontSize: 14,
    color: '#92ACEC',
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  remiseNewPrice: {
    fontSize: 18,
    color: '#FF4B4B',
    fontWeight: '800',
  },
  remiseStoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(146,172,236,0.08)',
    padding: 8,
    borderRadius: 12,
  },
  remiseStoreLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  remiseStoreName: {
    flex: 1,
    fontSize: 13,
    color: '#004AAD',
    fontWeight: '600',
    textAlign: 'right',
  },
  remiseStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
  },
  remiseStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  remiseStatText: {
    fontSize: 12,
    color: '#92ACEC',
    fontWeight: '500',
  },
  remiseDecorativeContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  remiseDecorCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.1,
    top: -30,
    right: -30,
  },
  remiseDecorDot: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    opacity: 0.1,
    bottom: 30,
    left: -15,
  },
  mostSoldStoreCard: {
    width: width * 0.75,
    marginHorizontal: 10,
    marginVertical: 15,
    elevation: 15,
  },
  mostSoldStoreInner: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#004AAD',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  topSellerBadgeContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
  topSellerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  topSellerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  mostSoldStoreBannerContainer: {
    width: '100%',
    height: width * 0.35,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
  },
  mostSoldStoreBanner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mostSoldStoreLogoContainer: {
    position: 'absolute',
    bottom: -25,
    right: 15,
    padding: 3,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    elevation: 5,
  },
  mostSoldStoreLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  mostSoldStoreInfo: {
    padding: 5,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
    gap: 12,
  },
  mostSoldStoreName: {
    flex: 1,
    fontSize: 18,
    color: '#004AAD',
    fontWeight: '700',
    textAlign: 'right',
  },
  mostSoldStoreLogoContainer: {
    padding: 3,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    elevation: 5,
  },
  mostSoldStoreLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  mostSoldStoreStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(146,172,236,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#004AAD',
    fontWeight: '600',
  },
  salesInfoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  salesInfoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 8,
  },
  salesText: {
    fontSize: 14,
    color: '#004AAD',
    fontWeight: '600',
  },
  decorativeContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.1,
    top: -30,
    left: -30,
  },
  decorDot: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    opacity: 0.1,
    bottom: 20,
    right: -15,
  },
  mostSoldProductCard: {
    width: width * 0.65,
    marginHorizontal: 10,
    marginVertical: 15,
    elevation: 15,
  },
  mostSoldProductInner: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#004AAD',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  topSellerTag: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
  topSellerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  topSellerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  mostSoldImageWrapper: {
    width: '100%',
    height: width * 0.5,
    position: 'relative',
  },
  mostSoldProductImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  priceTagContainer: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  priceTag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  priceText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
  mostSoldProductDetails: {
    padding: 15,
  },
  mostSoldProductName: {
    fontSize: 16,
    color: '#004AAD',
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'right',
    lineHeight: 22,
  },
  storeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(146,172,236,0.08)',
    padding: 8,
    borderRadius: 12,
  },
  storeLogoSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  storeNameText: {
    flex: 1,
    fontSize: 13,
    color: '#004AAD',
    fontWeight: '600',
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(146,172,236,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#004AAD',
    fontWeight: '600',
  },
  decorativeElements: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.1,
    top: -40,
    left: -40,
  },
  decorDot: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    opacity: 0.1,
    bottom: 20,
    right: -15,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  patternContainer: {
    flex: 1,
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10, // Reduced spacing
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternIcon: {
    opacity: 0.8,
  }
});

export default HomeScreen; 