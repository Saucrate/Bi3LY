import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshControl
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
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SharedElement } from 'react-navigation-shared-element';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { clientService } from '../services/clientService';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
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

  useEffect(() => {
    loadHomeData();
    loadUserProfile();
    const unsubscribe = navigation.addListener('focus', () => {
      loadHomeData();
      loadUserProfile();
    });
    return unsubscribe;
  }, [navigation]);

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
        entering={FadeInDown.delay(300)}
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
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#3d4785', '#5c6ac4']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => navigation.navigate('Profile')}
          >
            <Image 
              source={
                userProfile?.avatar
                  ? { uri: userProfile.avatar }
                  : require('../assets/placeholder.jpeg')
              }
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>يوم جيد للتسوق</Text>
            <Text style={styles.userName}>{userProfile?.name || 'زائر'}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('Messages')}
            >
              <Ionicons name="mail-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="البحث في المتجر"
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch}>
              <Ionicons name="search" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderMainCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.mainCategoryItem}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.categoryIconContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.categoryIcon}
          defaultSource={require('../assets/placeholder.jpeg')}
        />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
        </TouchableOpacity>
  );

  const renderSubCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.subCategoryItem}
      onPress={() => handleCategoryPress(item)}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', '#ffffff']}
        style={styles.subCategoryGradient}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.subCategoryImage}
          defaultSource={require('../assets/placeholder.jpeg')}
        />
        <View style={styles.subCategoryContent}>
          <Text style={styles.subCategoryName}>{item.name}</Text>
          <Text style={styles.parentCategoryName}>{item.parent?.name}</Text>
      </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderStoreItem = ({ item }) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => handleStorePress(item)}
    >
      <Image
        source={{ uri: item.banner }}
        style={styles.storeBanner}
        defaultSource={require('../assets/placeholder.jpeg')}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.storeBannerGradient}
      >
      <View style={styles.storeInfo}>
          <View style={styles.storeLogoContainer}>
            <Image
              source={{ uri: item.logo }}
              style={styles.storeLogo}
              defaultSource={require('../assets/placeholder.jpeg')}
            />
          </View>
          <View style={styles.storeDetails}>
        <Text style={styles.storeName}>{item.name}</Text>
            <View style={styles.storeStats}>
              <Text style={styles.storeFollowers}>{item.followers?.length || 0} متابع</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '0.0'}</Text>
        </View>
      </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.9}
    >
      <SharedElement id={`product.${item._id}.image`}>
        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: item.images[0] }}
            style={styles.productImage}
            defaultSource={require('../assets/placeholder.jpeg')}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.productGradient}
          />
          <BlurView intensity={80} tint="dark" style={styles.priceTag}>
            <Text style={styles.priceText}>
              {item.discountPrice ? (
                <>
                  <Text style={styles.discountPrice}>{item.discountPrice}</Text>
                  <Text style={styles.originalPrice}> {item.price}</Text>
                </>
              ) : (
                item.price
              )} أوقية
            </Text>
          </BlurView>
          {item.inCart && (
            <BlurView intensity={80} tint="dark" style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{item.cartQuantity}x</Text>
            </BlurView>
          )}
      </View>
      </SharedElement>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.productDetails}>
        <View style={styles.ratingContainer}>
          {renderStars(item.rating)}
            <Text style={styles.reviewCount}>({item.numReviews})</Text>
        </View>
          <Text style={styles.storeNameText}>{item.store?.name}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.favoriteButton, item.isFavorite && styles.favoriteButtonActive]}
        onPress={() => toggleFavorite(item._id)}
      >
        <BlurView intensity={80} tint="light" style={styles.iconBackground}>
          <AntDesign
            name={item.isFavorite ? "heart" : "hearto"}
            size={20}
            color={item.isFavorite ? "#ff4444" : "#666"}
          />
        </BlurView>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.cartButton, item.inCart && styles.cartButtonActive]}
        onPress={() => handleAddToCart(item)}
      >
        <BlurView intensity={80} tint="light" style={styles.iconBackground}>
          <Ionicons 
            name={item.inCart ? "cart" : "cart-outline"} 
            size={20} 
            color={item.inCart ? "#3d4785" : "#666"} 
          />
        </BlurView>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderRemiseProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.remiseProductCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.remiseImageContainer}>
        <Image
          source={{ uri: item.images[0] }}
          style={styles.remiseProductImage}
          defaultSource={require('../assets/placeholder.jpeg')}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.remiseGradient}
        >
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {calculateDiscount(item.price, item.discountPrice)}% تخفيض
            </Text>
      </View>
        </LinearGradient>
        </View>
      <View style={styles.remiseProductInfo}>
        <Text style={styles.remiseProductName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.remiseStoreInfo}>
          <Text style={styles.remiseStoreName} numberOfLines={1}>
            {item.store?.name}
          </Text>
          <View style={styles.remiseRating}>
            <AntDesign name="star" size={12} color="#FFD700" />
            <Text style={styles.remiseRatingText}>{item.rating?.toFixed(1)}</Text>
            <Text style={styles.remiseReviewCount}>({item.numReviews})</Text>
      </View>
      </View>
        <View style={styles.remisePriceContainer}>
          <Text style={styles.remiseDiscountPrice}>
            {item.discountPrice} أوقية
          </Text>
          <Text style={styles.remiseOriginalPrice}>
            {item.price} أوقية
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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

  if (loading && !refreshing) {
  return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3d4785" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadHomeData}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      <FlatList
        data={[{ key: 'main' }]}
        keyExtractor={(item, index) => `main-content-${index}`}
        renderItem={() => (
          <>
            <TouchableOpacity style={styles.bannerContainer} onPress={() => Linking.openURL('#sellers')}>
              <Image source={{ uri: 'https://i.postimg.cc/t403yfn9/home2.jpg' }} style={styles.bannerImage} />
            </TouchableOpacity>

            {/* Personalized Section */}
            {renderPersonalizedSection()}

            {/* Main Categories */}
            <View style={styles.mainCategoriesContainer}>
              <Text style={styles.sectionTitle}>التصنيفات الرئيسية</Text>
              <View style={styles.mainCategoriesGrid}>
                {mainCategories.map((category) => (
                  <TouchableOpacity
                    key={`main-category-${category._id}`}
                    style={styles.mainCategoryItem}
                    onPress={() => handleCategoryPress(category)}
                  >
                    <LinearGradient
                      colors={['#f8f9ff', '#ffffff']}
                      style={styles.mainCategoryGradient}
                    >
                      <Image
                        source={{ uri: category.image }}
                        style={styles.mainCategoryImage}
                        defaultSource={require('../assets/placeholder.jpeg')}
                      />
                      <Text style={styles.mainCategoryName}>{category.name}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Special Stores */}
            {homeData.specialStores.length > 0 && (
              <View>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>المتاجر المميزة</Text>
            </View>
                <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.storeList}
                >
                  {homeData.specialStores.map((store) => (
                    <View key={`store-${store._id}`}>
                      {renderStoreItem({ item: store })}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Sub Categories */}
            <View style={styles.subCategoriesContainer}>
              <Text style={styles.sectionTitle}>التصنيفات الفرعية</Text>
              <View style={styles.subCategoriesGrid}>
                {subCategories.map((category) => (
                  <TouchableOpacity
                    key={`sub-category-${category._id}`}
                    style={styles.subCategoryItem}
                    onPress={() => handleCategoryPress(category)}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.9)', '#ffffff']}
                      style={styles.subCategoryGradient}
                    >
                      <Image
                        source={{ uri: category.image }}
                        style={styles.subCategoryImage}
                        defaultSource={require('../assets/placeholder.jpeg')}
                      />
                      <View style={styles.subCategoryContent}>
                        <Text style={styles.subCategoryName}>{category.name}</Text>
                        <Text style={styles.parentCategoryName}>{category.parent?.name}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recently Viewed Products */}
            {homeData.personalized.recentlyViewed.length > 0 && (
              <View>
            <View style={styles.titleContainer}>
                  <Text style={styles.sectionTitle}>المنتجات المشاهدة مؤخراً</Text>
            </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
                  {homeData.personalized.recentlyViewed.map((product) => (
                    <View key={`recent-${product._id}`}>
                      {renderProductItem({ item: product })}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Recommended Products */}
            {homeData.personalized.recommended?.length > 0 && (
              <View>
            <View style={styles.titleContainer}>
                  <Text style={styles.sectionTitle}>منتجات موصى بها لك</Text>
            </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
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
            <View style={styles.titleContainer}>
                  <Text style={styles.sectionTitle}>المنتجات الرائجة في مجال اهتمامك</Text>
            </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
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
            <View style={styles.titleContainer}>
                  <Text style={styles.sectionTitle}>منتجات مميزة</Text>
            </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
                  {homeData.specialProducts.map((product) => (
                    <View key={`special-${product._id}`}>
                      {renderProductItem({ item: product })}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Discounted Products */}
            {homeData.discountedProducts.length > 0 && (
              <View>
            <View style={styles.titleContainer}>
                  <Text style={styles.sectionTitle}>منتجات مخفضة</Text>
            </View>
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
            <View style={styles.titleContainer}>
                  <Text style={styles.sectionTitle}>منتجات مشابهة</Text>
            </View>
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
            <View style={styles.titleContainer}>
                  <Text style={styles.sectionTitle}>المتاجر الأكثر مبيعاً</Text>
            </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storeList}>
                  {homeData.mostSoldStores.map((store) => (
                    <View key={`store-${store._id}`}>
                      {renderStoreItem({ item: store })}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Most Sold Products */}
            {homeData.mostSoldProducts.length > 0 && (
              <View>
            <View style={styles.titleContainer}>
                  <Text style={styles.sectionTitle}>المنتجات الأكثر مبيعاً</Text>
            </View>
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
                <View style={styles.titleContainer}>
                  <Text style={styles.sectionTitle}>العلامات التجارية الموصى بها</Text>
                </View>
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
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>جميع العلامات التجارية</Text>
            </View>
                <View style={styles.brandGrid}>
                  {homeData.brands.map((brand) => (
                    <View key={`brand-${brand._id}`}>
                      {renderBrandGridItem({ item: brand })}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    height: 160,
    marginBottom: 10,
  },
  headerGradient: {
    flex: 1,
    paddingTop: 35,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  welcomeContainer: {
    flex: 1,
    marginLeft: 10,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginRight: 10,
    textAlign: 'right',
    color: '#666',
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'right',
  },
  mainCategoryItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  categoryName: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  titleContainer: {
    flexDirection: 'row-r',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 6,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
    textAlign: 'right',
  },
  categoryList: {
    marginBottom: 12,
  },
  storeList: {
    marginVertical: 8,
    marginHorizontal: 0,
    paddingHorizontal: 8,
  },
  storeCard: {
    width: width * 0.75,
    height: 140,
    marginHorizontal: 8,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  storeBanner: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  storeBannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: 10,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  storeLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  storeLogo: {
    width: '100%',
    height: '100%',
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  storeStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeFollowers: {
    color: '#fff',
    fontSize: 12,
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
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
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 8,
    width: width * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    height: width * 0.6,
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
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'left',
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
  remiseProductImage: {
    width: width * 0.4,
    height: 150,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  remiseCardContent: {
    flex: 1,
    alignItems: 'flex-end',
    marginTop: 8,
  },
  remiseProductName: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 13,
    color: '#333',
    textAlign: 'right',
    width: '100%',
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
    backgroundColor: '#f5f5f5',
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
    elevation: 2,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContent: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInnerContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalImage: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    marginBottom: 20,
    borderRadius: 10,
  },
  modalProductName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  modalProductDescription: {
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 14,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 15,
    color: '#333',
  },
  addToCartButton: {
    backgroundColor: '#3d4785',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  addToCartText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  brandGrid: {
    marginBottom: 20,
  },
  brandGridItem: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  brandGridLogo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  brandGridName: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  categoryGrid: {
    padding: 5,
    marginBottom: 15,
  },
  categoryGridItem: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  categoryGridImage: {
    width: '80%',
    height: '60%',
    resizeMode: 'contain',
    marginBottom: 10,
  },
  categoryGridText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  subCategoryGrid: {
    padding: 5,
    marginBottom: 15,
  },
  subCategoryGridItem: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  subCategoryGridImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  subCategoryGridText: {
    fontSize: 13,
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  parentCategoryText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  categoriesSection: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  subCategoriesSection: {
    marginVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
    paddingVertical: 15,
  },
  categoryCard: {
    width: width / 4 - 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 6,
    overflow: 'hidden',
  },
  mainCategoriesContainer: {
    marginVertical: 8,
    marginHorizontal: 0,
  },
  mainCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 5,
    gap: 8,
  },
  mainCategoryGradient: {
    padding: 10,
    alignItems: 'center',
    borderRadius: 15,
  },
  mainCategoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  mainCategoryName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  subCategoriesContainer: {
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
    paddingVertical: 10,
  },
  subCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 5,
    gap: 8,
  },
  subCategoryItem: {
    width: width / 3 - 12,
    marginHorizontal: 4,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  subCategoryGradient: {
    padding: 8,
    borderRadius: 12,
  },
  subCategoryImage: {
    width: '100%',
    height: 90,
    borderRadius: 8,
    marginBottom: 6,
  },
  subCategoryContent: {
    padding: 5,
  },
  subCategoryName: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 2,
  },
  parentCategoryName: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  personalizedSection: {
    margin: 15,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  blurContainer: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 12,
    textAlign: 'right',
  },
  horizontalScroll: {
    marginBottom: 15,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    width: width * 0.42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productInfo: {
    padding: 12,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d4785',
    textAlign: 'right',
  },
  remiseProductCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 8,
    width: width * 0.6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  remiseImageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
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
});

export default HomeScreen; 