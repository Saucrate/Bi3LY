import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cartService } from '../services/cartService';
import CustomAlert from './CustomAlert';
import { homeService } from '../services/homeService';

const CartScreen = () => {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [similarProducts, setSimilarProducts] = useState([]);

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

  const updateCartItem = async (id, quantity) => {
    try {
      if (isAuthenticated) {
        // Veritabanında güncelle
        const response = await cartService.updateCartItem(id, quantity);
        if (response.success) {
          setCartItems(prevItems =>
            prevItems.map(item =>
              item._id === id ? { ...item, quantity } : item
            )
          );
        }
      } else {
        // Local storage'da güncelle
        const updatedItems = cartItems.map(item =>
          (item._id || item.id) === id ? { ...item, quantity } : item
        );
        setCartItems(updatedItems);
        await AsyncStorage.setItem('cart', JSON.stringify(updatedItems));
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      setError('حدث خطأ في تحديث العنصر');
    }
  };

  const removeItem = async (id) => {
    try {
      if (isAuthenticated) {
        // Veritabanından kaldır
        const response = await cartService.removeFromCart(id);
        if (response.success) {
          setCartItems(prevItems => prevItems.filter(item => item._id !== id));
        }
      } else {
        // Local storage'dan kaldır
        const updatedItems = cartItems.filter(item => (item._id || item.id) !== id);
        setCartItems(updatedItems);
        await AsyncStorage.setItem('cart', JSON.stringify(updatedItems));
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
      setError('حدث خطأ في إزالة العنصر');
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

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image 
        source={{ uri: item.product?.images?.[0] }} 
        style={styles.productImage}
        defaultSource={require('../assets/placeholder.jpeg')}
      />
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.product?.name}
          </Text>
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => removeItem(item.product?._id)}
          >
            <AntDesign name="delete" size={20} color="#FF0000" />
          </TouchableOpacity>
        </View>
        
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
            style={styles.quantityButton}
            onPress={() => updateCartItem(item.product?._id, Math.max(1, item.quantity - 1))}
          >
            <AntDesign name="minus" size={16} color="#3d4785" />
          </TouchableOpacity>
          <View style={styles.quantityBox}>
            <Text style={styles.quantity}>{item.quantity}</Text>
          </View>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateCartItem(item.product?._id, item.quantity + 1)}
          >
            <AntDesign name="plus" size={16} color="#3d4785" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
          onPress={checkAuthAndLoadCart}
        >
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>سلة التسوق</Text>
        {cartItems.length > 0 && (
          <Text style={styles.itemCount}>
            {cartItems.length} {cartItems.length === 1 ? 'منتج' : 'منتجات'}
          </Text>
        )}
      </View>
      
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
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.cartList}
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
          />
          
          {cartItems.length > 0 && (
            <View style={styles.summaryContainer}>
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
          )}
        </>
      )}
      
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
  cartList: {
    padding: 16,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
  },
  removeButton: {
    padding: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 12,
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
    marginLeft: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3d4785',
  },
  quantityBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  similarSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    paddingVertical: 20,
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
  summaryContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
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
});

export default CartScreen; 