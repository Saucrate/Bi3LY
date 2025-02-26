import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { AntDesign, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cartService } from '../services/cartService';
import CustomAlert from './CustomAlert';
import { homeService } from '../services/homeService';
import { Swipeable } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';
import { Platform, StatusBar, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BOTTOM_NAV_HEIGHT = 60; // Adjust this value based on your bottom navbar height
const HEADER_MAX_HEIGHT = 150;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 90 : 70 + StatusBar.currentHeight;

const CartScreen = () => {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [similarProducts, setSimilarProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
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
      transform: [{
        translateY: interpolate(
          scrollY.value,
          [0, 100],
          [0, -20],
          'clamp'
        ),
      }],
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
      transform: [{
        translateY: interpolate(
          scrollY.value,
          [0, 100],
          [20, 0],
          'clamp'
        ),
      }],
    };
  });

  useEffect(() => {
    checkAuthAndLoadCart();
    loadSimilarProducts();
    // Ekran odaklandığında sepeti yeniden yükle
    const unsubscribe = navigation.addListener('focus', () => {
      checkAuthAndLoadCart();
      loadSimilarProducts();
    });

    return unsubscribe;
  }, [navigation]);

  const checkAuthAndLoadCart = async () => {
    try {
      console.log('checkAuthAndLoadCart - checking auth');
      const token = await AsyncStorage.getItem('token');
      console.log('checkAuthAndLoadCart - token:', token ? 'exists' : 'not found');
      setIsAuthenticated(!!token);
      
      if (token) {
        console.log('checkAuthAndLoadCart - loading from DB');
        await loadCartFromDB();
      } else {
        console.log('checkAuthAndLoadCart - loading from local');
        await loadCartFromLocal();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setError('حدث خطأ في تحميل السلة');
    } finally {
      setLoading(false);
    }
  };

  const loadCartFromDB = async () => {
    try {
      console.log('loadCartFromDB - making API request');
      const response = await cartService.getCart();
      console.log('loadCartFromDB - response:', response);
      if (response.success) {
        setCartItems(response.data.items || []);
        // Toplam tutarı hesapla
        const total = response.data.items.reduce((sum, item) => {
          const price = item.product.discountPrice || item.product.price;
          return sum + (price * item.quantity);
        }, 0);
        setTotal(total);
      }
    } catch (error) {
      console.error('Error loading cart from DB:', error);
      setError('حدث خطأ في تحميل السلة من قاعدة البيانات');
    }
  };

  const loadCartFromLocal = async () => {
    try {
      console.log('loadCartFromLocal - getting from storage');
      const localCart = await AsyncStorage.getItem('cart');
      console.log('loadCartFromLocal - local cart:', localCart);
      if (localCart) {
        setCartItems(JSON.parse(localCart));
        // Toplam tutarı hesapla
        const total = JSON.parse(localCart).reduce((sum, item) => {
          const price = item.product.discountPrice || item.product.price;
          return sum + (price * item.quantity);
        }, 0);
        setTotal(total);
      }
    } catch (error) {
      console.error('Error loading cart from local:', error);
      setError('حدث خطأ في تحميل السلة المحلية');
    }
  };

  const handleAuthRequired = () => {
    setShowAuthAlert(true);
  };

  const navigateToAuth = () => {
    setShowAuthAlert(false);
    navigation.navigate('Auth');
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        // Ürünü sepetten kaldır
        const response = await cartService.removeFromCart(productId);
        if (response.success) {
          await loadCartFromDB();
        }
      } else {
        console.log('Updating quantity for product:', productId, 'to:', newQuantity);
        const response = await cartService.updateCartItem(productId, newQuantity);
        console.log('Update response:', response);
        if (response.success) {
          await loadCartFromDB();
        }
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحديث الكمية');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const response = await cartService.removeFromCart(productId);
      if (response.success) {
        await loadCartFromDB();
      }
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('خطأ', 'حدث خطأ في إزالة المنتج');
    }
  };

  const applyCoupon = async () => {
    if (!isAuthenticated) {
      handleAuthRequired();
      return;
    }
    // Kupon uygulama mantığı
    try {
      const response = await cartService.applyCoupon(couponCode);
      if (response.success) {
        // Sepeti güncelle
        await loadCartFromDB();
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setError('حدث خطأ في تطبيق القسيمة');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('تنبيه', 'السلة فارغة');
      return;
    }
    if (!isAuthenticated) {
      handleAuthRequired();
      return;
    }
    navigation.navigate('Checkout');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.discountPrice || item.product?.price || 0;
      return total + (price * (item.quantity || 0));
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    // Burada vergi veya kargo ücreti eklenebilir
    return subtotal;
  };

  const loadSimilarProducts = async () => {
    try {
      // Sepetteki ürünlerin kategorilerine göre benzer ürünleri getir
      const response = await homeService.getSpecialProducts();
      if (response.success) {
        setSimilarProducts(response.data.slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading similar products:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    checkAuthAndLoadCart().finally(() => setRefreshing(false));
  }, []);

  const getCartListStyle = () => {
    return {
      padding: 16,
      paddingBottom: cartItems?.length > 0 ? (280 + BOTTOM_NAV_HEIGHT) : 16,
    };
  };

  const renderCartItem = ({ item }) => (
    <Swipeable
      renderRightActions={(progress, dragX) => (
        <TouchableOpacity 
          style={styles.deleteAction}
          onPress={() => handleRemoveItem(item.product?._id)}
        >
          <LinearGradient
            colors={['#ff8787', '#ff6b6b']}
            style={styles.deleteGradient}
          >
            <MaterialIcons name="delete-outline" size={28} color="#fff" />
            <Text style={styles.deleteText}>حذف</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    >
      <BlurView intensity={80} tint="light" style={styles.cartItemContainer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
          style={styles.cartItem}
        >
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.product?.images?.[0] }} 
              style={styles.productImage}
              defaultSource={require('../assets/placeholder.jpeg')}
            />
            {item.product?.discountPrice && (
              <View style={styles.discountBadge}>
                <BlurView intensity={90} tint="dark" style={styles.discountBadgeBlur}>
                  <Text style={styles.discountBadgeText}>
                    {(((item.product.price - item.product.discountPrice) / item.product.price) * 100).toFixed(0)}% خصم
                  </Text>
                </BlurView>
              </View>
            )}
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.product?.name}
            </Text>

            <View style={styles.priceSection}>
              <View style={styles.priceContainer}>
                {item.product?.discountPrice ? (
                  <>
                    <Text style={styles.discountPrice}>
                      {item.product.discountPrice.toFixed(2)} MRU
                    </Text>
                    <Text style={styles.originalPrice}>
                      {item.product.price.toFixed(2)} MRU
                    </Text>
                  </>
                ) : (
                  <Text style={styles.price}>
                    {(item.product?.price || 0).toFixed(2)} MRU
                  </Text>
                )}
              </View>

              <View style={styles.quantityContainer}>
                <TouchableOpacity 
                  style={[styles.quantityButton, styles.quantityDecrease]}
                  onPress={() => handleQuantityChange(item.product?._id, Math.max(1, item.quantity - 1))}
                >
                  <Text style={[styles.quantityButtonText, { color: '#3d4785' }]}>-</Text>
                </TouchableOpacity>
                <View style={styles.quantityBox}>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.quantityButton, styles.quantityIncrease]}
                  onPress={() => handleQuantityChange(item.product?._id, item.quantity + 1)}
                >
                  <Text style={[styles.quantityButtonText, { color: '#fff' }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>المجموع:</Text>
              <Text style={styles.itemTotal}>
                {((item.product?.discountPrice || item.product?.price || 0) * item.quantity).toFixed(2)} MRU
              </Text>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </Swipeable>
  );

  const renderSimilarProduct = ({ item }) => (
    <View style={styles.similarCard}>
      <View style={styles.similarImageWrapper}>
        <Image 
          source={{ uri: item.images?.[0] }} 
          style={styles.similarImage}
          defaultSource={require('../assets/placeholder.jpeg')}
        />
        {item.discountPrice && (
          <View style={styles.similarDiscountTag}>
            <Text style={styles.similarDiscountTagText}>
              {(((item.price - item.discountPrice) / item.price) * 100).toFixed(0)}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.similarContent}>
        <Text style={styles.similarName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.similarBottom}>
          <View style={styles.similarPriceContainer}>
            <Text style={styles.similarCurrentPrice}>
              {(item.discountPrice || item.price).toFixed(2)} MRU
            </Text>
            {item.discountPrice && (
              <Text style={styles.similarOldPrice}>
                {item.price.toFixed(2)} MRU
              </Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.similarButton}
            onPress={() => navigation.navigate('ProductDetailScreen', { 
              productId: item._id,
              productName: item.name 
            })}
          >
            <FontAwesome name="arrow-left" size={16} color="#3d4785" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const CartSummaryModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showSummaryModal}
      onRequestClose={() => setShowSummaryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>ملخص السلة</Text>
            <TouchableOpacity 
              onPress={() => setShowSummaryModal(false)}
              style={styles.closeButton}
            >
              <AntDesign name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.couponContainer}>
            <TextInput
              style={styles.couponInput}
              placeholder="أدخل رمز القسيمة"
              value={couponCode}
              onChangeText={setCouponCode}
            />
            <TouchableOpacity 
              style={styles.applyCouponButton}
              onPress={applyCoupon}
            >
              <Text style={styles.applyCouponText}>تطبيق</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>المجموع الفرعي:</Text>
              <Text style={styles.totalValue}>
                {calculateSubtotal().toFixed(2)} MRU
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>المجموع الكلي:</Text>
              <Text style={styles.grandTotal}>
                {calculateTotal().toFixed(2)} MRU
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>
              متابعة الدفع
            </Text>
            <View style={styles.checkoutTotal}>
              <Text style={styles.checkoutTotalText}>
                {calculateTotal().toFixed(2)} MRU
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const CartSummaryStrip = () => {
    if (!cartItems.length) return null;
    
    return (
      <BlurView intensity={80} tint="light" style={styles.summaryStrip}>
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
          style={styles.summaryGradient}
        >
          <View style={styles.summaryContent}>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTotal}>
                {calculateTotal().toFixed(2)} MRU
              </Text>
              <Text style={styles.summaryText}>
                {cartItems.length} {cartItems.length === 1 ? 'منتج' : 'منتجات'}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.checkoutStrip}
              onPress={() => setShowSummaryModal(true)}
            >
              <LinearGradient
                colors={['#3d4785', '#92ACEC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.checkoutGradient}
              >
                <Text style={styles.checkoutText}>متابعة الدفع</Text>
                <FontAwesome name="arrow-left" size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </BlurView>
    );
  };

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
          onPress={checkAuthAndLoadCart}
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
            colors={['#3d4785', '#92ACEC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <Animated.View style={[styles.headerContent, headerContentStyle]}>
              <Text style={styles.headerTitle}>سلة التسوق</Text>
              {cartItems.length > 0 && (
                <View style={styles.headerInfo}>
                  <Text style={styles.itemCount}>
                    {cartItems.length} {cartItems.length === 1 ? 'منتج' : 'منتجات'}
                  </Text>
                  <Text style={styles.totalPrice}>
                    المجموع: {calculateTotal().toFixed(2)} MRU
                  </Text>
                </View>
              )}
            </Animated.View>

            <Animated.View style={[styles.minimizedHeader, minimizedHeaderStyle]}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>سلة التسوق</Text>
                <View style={styles.logoUnderline} />
              </View>
              {cartItems.length > 0 && (
                <TouchableOpacity 
                  style={styles.summaryButton}
                  onPress={() => setShowSummaryModal(true)}
                >
                  <Text style={styles.summaryButtonText}>
                    {calculateTotal().toFixed(2)} MRU
                  </Text>
                  <FontAwesome name="shopping-basket" size={20} color="#3d4785" />
                </TouchableOpacity>
              )}
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
      
      <View style={styles.mainContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3d4785" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={checkAuthAndLoadCart}
            >
              <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Animated.FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={[
                styles.cartList,
                { 
                  paddingTop: HEADER_MAX_HEIGHT + insets.top - 40,
                  paddingBottom: 100,
                }
              ]}
              ListHeaderComponent={cartItems.length > 0 ? <CartSummaryStrip /> : null}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <AntDesign name="shoppingcart" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>سلة التسوق فارغة</Text>
                  <TouchableOpacity 
                    style={styles.shopNowButton}
                    onPress={() => navigation.navigate('Home')}
                  >
                    <Text style={styles.shopNowText}>تسوق الآن</Text>
                  </TouchableOpacity>
                </View>
              }
              ListFooterComponent={() => similarProducts.length > 0 && (
                <View style={styles.similarSection}>
                  <Text style={styles.similarTitle}>منتجات قد تعجبك</Text>
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
              refreshing={refreshing}
              onRefresh={onRefresh}
              showsVerticalScrollIndicator={false}
              bounces={true}
              removeClippedSubviews={true}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={5}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
            />
            
            <CartSummaryModal />
          </>
        )}
      </View>
      
      <CustomAlert
        visible={showAuthAlert}
        message="يجب تسجيل الدخول لإتمام عملية الشراء"
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
  minimizedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  cartList: {
    padding: 16,
  },
  cartItemContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 20,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  discountBadgeBlur: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'right',
  },
  priceSection: {
    marginVertical: 8,
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    color: '#3d4785',
    fontWeight: 'bold',
  },
  discountPrice: {
    fontSize: 18,
    color: '#3d4785',
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 14,
    color: '#95a5a6',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(146,172,236,0.1)',
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDecrease: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quantityIncrease: {
    backgroundColor: '#3d4785',
  },
  quantityBox: {
    paddingHorizontal: 16,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(146,172,236,0.1)',
    borderRadius: 12,
    padding: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3d4785',
  },
  deleteAction: {
    width: 90,
    height: '100%',
    marginVertical: 8,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  deleteGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  similarSection: {
    marginTop: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  similarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
    marginHorizontal: 16,
    textAlign: 'right',
  },
  similarList: {
    paddingHorizontal: 16,
  },
  similarCard: {
    width: 160,
    height: 260,
    backgroundColor: '#fff',
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  similarImageWrapper: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#f8f9fa',
  },
  similarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  similarDiscountTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  similarDiscountTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  similarContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  similarName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'right',
    marginBottom: 8,
    height: 36,
    lineHeight: 18,
  },
  similarBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  similarPriceContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  similarCurrentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3d4785',
  },
  similarOldPrice: {
    fontSize: 12,
    color: '#95a5a6',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  similarButton: {
    width: 32,
    height: 32,
    backgroundColor: '#f0f2ff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: BOTTOM_NAV_HEIGHT,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  couponContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  couponInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    fontSize: 16,
    textAlign: 'right',
  },
  applyCouponButton: {
    backgroundColor: '#3d4785',
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyCouponText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  totalContainer: {
    marginBottom: 20,
  },
  totalValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  grandTotal: {
    fontSize: 24,
    color: '#3d4785',
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#3d4785',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutTotal: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  checkoutTotalText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3d4785',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  alertButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  loginButton: {
    flex: 1,
    backgroundColor: '#3d4785',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryButtonText: {
    color: '#3d4785',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  summaryStrip: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryGradient: {
    padding: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryInfo: {
    alignItems: 'flex-end',
  },
  summaryTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  checkoutStrip: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen; 