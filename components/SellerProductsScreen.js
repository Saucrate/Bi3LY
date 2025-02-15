import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert, Image, KeyboardAvoidingView, Platform, Modal, Button, Keyboard, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { requestCameraPermission, requestStoragePermission } from '../utils/permissions';
import CustomAlert from './CustomAlert';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons'; // Fix the import
import { sellerService } from '../services/sellerService';
import { useNavigation } from '@react-navigation/native';

const SellerProductsScreen = () => {
  const [activeTab, setActiveTab] = useState('products'); // 'products' veya 'orders'
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  // Arama state'leri
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (activeTab === 'products') {
          console.log('Fetching products...');
          const response = await sellerService.getStoreProducts();
          console.log('Products response:', response);
          
          if (response.success) {
            setProducts(response.data || []);
            setFilteredProducts(response.data || []);
          } else {
            setError(response.error || 'Error loading products');
          }
        }
      } catch (err) {
        console.error('Load data error:', err);
        setError(err.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []); // Sadece component mount olduğunda çalışsın

  // Ürün araması için filter
  useEffect(() => {
    if (products.length > 0) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.description.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.price.toString().includes(productSearch) ||
        getStatusText(product.status).includes(productSearch)
      );
      setFilteredProducts(filtered);
    }
  }, [productSearch, products]);

  // Sipariş araması için filter
  useEffect(() => {
    if (orders.length > 0) {
      const filtered = orders.filter(order => 
        order._id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customer?.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.totalAmount.toString().includes(orderSearch) ||
        order.status.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.items.some(item => item.product.name.toLowerCase().includes(orderSearch.toLowerCase()))
      );
      setFilteredOrders(filtered);
    }
  }, [orderSearch, orders]);

  // Tab değiştiğinde veriyi yükle
  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await sellerService.getOrders();
      if (response.success) {
        setOrders(response.data || []);
        setFilteredOrders(response.data || []);
      }
    } catch (err) {
      console.error('Load orders error:', err);
      setError(err.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا المنتج؟',
      [
        {
          text: 'إلغاء',
          style: 'cancel'
        },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await sellerService.deleteProduct(productId);
              if (response.success) {
                setProducts(products.filter(p => p._id !== productId));
                Alert.alert('نجاح', 'تم حذف المنتج بنجاح');
              }
            } catch (err) {
              Alert.alert('خطأ', err.response?.data?.error || 'حدث خطأ في حذف المنتج');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Red sebebini gösteren modal
  const RejectionModal = () => (
    <Modal
      visible={showRejectionModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>سبب الرفض</Text>
          <Text style={styles.rejectionReason}>
            {selectedProduct?.rejectionReason}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setShowRejectionModal(false);
              setSelectedProduct(null);
            }}
          >
            <Text style={styles.closeButtonText}>إغلاق</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Sipariş durumunu güncelleme
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await sellerService.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        Alert.alert('نجاح', 'تم تحديث حالة الطلب بنجاح');
      }
    } catch (error) {
      Alert.alert('خطأ', error.response?.data?.error || 'حدث خطأ في تحديث حالة الطلب');
    }
  };

  // Ürün detayına yönlendirme
  const handleProductPress = (product) => {
    navigation.navigate('ProductDetailScreen', { productId: product._id });
  };

  // Yeni ürün ekleme butonu için
  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  // Düzenleme butonu için
  const handleEditProduct = (product) => {
    console.log('Navigating to EditProduct with product:', product);
    navigation.navigate('EditProduct', { product });
  };

  const renderProduct = ({ item }) => (
      <TouchableOpacity 
      style={[styles.productCard, getStatusStyle(item.status)]}
      onPress={() => handleProductPress(item)}
    >
      <View style={styles.productContent}>
        {item.images && item.images[0] ? (
        <Image 
            source={{ uri: item.images[0] }} 
            style={styles.productImage}
          />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <FontAwesome name="image" size={30} color="#ccc" />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={styles.priceContainer}>
            {item.discountPrice ? (
              <>
                <Text style={styles.originalPrice}>{item.price} MRU</Text>
                <Text style={styles.discountPrice}>{item.discountPrice} MRU</Text>
              </>
            ) : (
              <Text style={styles.price}>{item.price} MRU</Text>
            )}
          </View>
          <Text style={styles.productStock}>
            المخزون: {item.countInStock > 0 ? item.countInStock : 'نفذت الكمية'}
          </Text>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>
              {getStatusText(item.status)}
            </Text>
            {item.status === 'rejected' && (
              <TouchableOpacity
                style={styles.viewReasonButton}
                onPress={() => {
                  setSelectedProduct(item);
                  setShowRejectionModal(true);
                }}
              >
                <Text style={styles.viewReasonText}>عرض السبب</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditProduct(item)}
          >
            <FontAwesome name="edit" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProduct(item._id)}
          >
            <FontAwesome name="trash" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
    </View>
    </TouchableOpacity>
  );

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>رقم الطلب: {item._id}</Text>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString('ar-SA')}
        </Text>
      </View>
      <ScrollView style={styles.orderItems}>
        {item.items.map((orderItem, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.orderItem}
            onPress={() => handleProductPress(orderItem.product)}
          >
            <Image
              source={{ uri: orderItem.product.images[0] }}
              style={styles.orderItemImage}
            />
            <View style={styles.orderItemDetails}>
              <Text style={styles.orderItemName}>{orderItem.product.name}</Text>
              <Text style={styles.orderItemQuantity}>
                الكمية: {orderItem.quantity}
              </Text>
              <Text style={styles.orderItemPrice}>
                {orderItem.price} MRU
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>
          المجموع: {item.totalAmount} MRU
        </Text>
        <View style={styles.orderStatus}>
          <Text style={styles.orderStatusLabel}>الحالة:</Text>
          <View style={styles.orderStatusPicker}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                item.status === 'pending' && styles.activeStatusButton
              ]}
              onPress={() => handleUpdateOrderStatus(item._id, 'pending')}
            >
              <Text style={styles.statusButtonText}>قيد الانتظار</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                item.status === 'processing' && styles.activeStatusButton
              ]}
              onPress={() => handleUpdateOrderStatus(item._id, 'processing')}
            >
              <Text style={styles.statusButtonText}>قيد المعالجة</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                item.status === 'shipped' && styles.activeStatusButton
              ]}
              onPress={() => handleUpdateOrderStatus(item._id, 'shipped')}
            >
              <Text style={styles.statusButtonText}>تم الشحن</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                item.status === 'delivered' && styles.activeStatusButton
              ]}
              onPress={() => handleUpdateOrderStatus(item._id, 'delivered')}
            >
              <Text style={styles.statusButtonText}>تم التوصيل</Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </View>
    );

  // Ürün durumuna göre stil ve metin yardımcı fonksiyonları
  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return styles.approvedProduct;
      case 'rejected':
        return styles.rejectedProduct;
      default:
        return styles.pendingProduct;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'تمت الموافقة';
      case 'rejected':
        return 'مرفوض';
      default:
        return 'قيد المراجعة';
    }
  };

  const getStatusTextStyle = (status) => {
    switch (status) {
      case 'approved':
        return styles.approvedText;
      case 'rejected':
        return styles.rejectedText;
      default:
        return styles.pendingText;
    }
  };

  // Arama inputları
  const SearchBar = ({ value, onChangeText, placeholder }) => (
    <View style={styles.searchContainer}>
      <FontAwesome name="search" size={20} color="#666" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
      />
        </View>
      );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#3d4785" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
            المنتجات
          </Text>
          </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            الطلبات
                    </Text>
                    </TouchableOpacity>
                  </View>

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => handleAddProduct()}
        >
          <FontAwesome name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>إضافة منتج</Text>
        </TouchableOpacity>
              </View>

      {/* Arama çubuğu */}
      <SearchBar
        value={activeTab === 'products' ? productSearch : orderSearch}
        onChangeText={activeTab === 'products' ? setProductSearch : setOrderSearch}
        placeholder={activeTab === 'products' ? 'البحث في المنتجات...' : 'البحث في الطلبات...'}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#3d4785" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={activeTab === 'products' ? filteredProducts : filteredOrders}
          renderItem={activeTab === 'products' ? renderProduct : renderOrder}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'products' ? 'لا توجد منتجات' : 'لا توجد طلبات'}
              </Text>
            </View>
          }
        />
      )}

      <RejectionModal />
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10
  },
  productList: {
    paddingBottom: 20
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'line-through',
  },
  discountPrice: {
    fontSize: 16,
    color: '#e53935',
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: '#333',
  },
  productStock: {
    fontSize: 12,
    color: '#666',
  },
  productActions: {
    justifyContent: 'space-around',
    marginLeft: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: 20,
    color: '#666',
    marginTop: 20
  },
  emptySubText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10
  },
  statusContainer: {
    marginTop: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvedProduct: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  rejectedProduct: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  pendingProduct: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  approvedText: {
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  rejectedText: {
    color: '#f44336',
    backgroundColor: '#FFEBEE',
  },
  pendingText: {
    color: '#FFC107',
    backgroundColor: '#FFF8E1',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3d4785',
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#3d4785',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  rejectionReason: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#3d4785',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  viewReasonButton: {
    marginTop: 5,
    padding: 5,
    backgroundColor: '#ffebee',
    borderRadius: 5,
  },
  viewReasonText: {
    color: '#f44336',
    fontSize: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 14,
    color: '#666',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  orderItemDetails: {
    marginLeft: 10,
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderItemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  orderItemPrice: {
    fontSize: 14,
    color: '#3d4785',
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  orderStatus: {
    marginTop: 10,
  },
  orderStatusLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  orderStatusPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#f8f9fa',
    marginVertical: 5,
    minWidth: '48%',
  },
  activeStatusButton: {
    backgroundColor: '#3d4785',
  },
  statusButtonText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
  },
  activeStatusButtonText: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'right',
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default SellerProductsScreen;