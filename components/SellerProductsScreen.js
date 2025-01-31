import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert, Image, KeyboardAvoidingView, Platform, Modal, Button, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { requestCameraPermission, requestStoragePermission } from '../utils/permissions';
import CustomAlert from './CustomAlert';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons'; // Fix the import

const SellerProductsScreen = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('products'); // 'products', 'orders'
  const [modalVisible, setModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [newImage, setNewImage] = useState('');
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductQuantity, setNewProductQuantity] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  const [showImagePickerAlert, setShowImagePickerAlert] = useState(false);
  const [currentImageSetter, setCurrentImageSetter] = useState(null);

  useEffect(() => {
    // Simulate fetching products and orders data
    const fetchedProducts = [
      { id: '1', name: 'منتج 1', quantity: 10, discount: 10, price: 1000, images: ['https://example.com/image1.jpg'] },
      { id: '2', name: 'منتج 2', quantity: 5, discount: 20, price: 2000, images: ['https://example.com/image2.jpg'] },
    ];
    const fetchedOrders = [
      { id: '1', clientName: 'عميل 1', productName: 'منتج 1', quantity: 2, clientInfo: 'تفاصيل العميل 1' },
      { id: '2', clientName: 'عميل 2', productName: 'منتج 2', quantity: 1, clientInfo: 'تفاصيل العميل 2' },
    ];
    setProducts(fetchedProducts);
    setOrders(fetchedOrders);
    setFilteredProducts(fetchedProducts);
    setFilteredOrders(fetchedOrders);
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, products, orders]);

  const filterItems = () => {
    if (filter === 'products') {
      const updatedProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(updatedProducts);
    } else {
      const updatedOrders = orders.filter(order =>
        order.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrders(updatedOrders);
    }
  };

  const handleOrderClick = (order) => {
    setCurrentOrder(order);
    setModalVisible(true);
  };

  const handleMarkAsSold = () => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== currentOrder.id));
    setModalVisible(false);
  };

  const handleModifyProduct = (product) => {
    setCurrentProduct(product);
    setNewName(product.name);
    setNewPrice(product.price.toString());
    setNewQuantity(product.quantity.toString());
    setNewDiscount(product.discount.toString());
    setNewImage(product.images[0]);
    setAddProductModalVisible(true);
  };

  const handleSaveChanges = () => {
    if (newName && newPrice && newQuantity && newDiscount && newImage) {
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === currentProduct.id
            ? { ...product, name: newName, price: parseFloat(newPrice), quantity: parseInt(newQuantity), discount: parseFloat(newDiscount), images: [newImage] }
            : product
        )
      );
      setAddProductModalVisible(false);
    }
  };

  const handleDeleteProduct = (id) => {
    Alert.alert(
      'حذف المنتج',
      'هل أنت متأكد أنك تريد حذف هذا المنتج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAddProduct = () => {
    setAddProductModalVisible(true);
  };

  const handleSaveNewProduct = () => {
    if (newProductName && newProductPrice && newProductQuantity && newProductImage) {
      const newProduct = {
        id: (products.length + 1).toString(),
        name: newProductName,
        quantity: parseInt(newProductQuantity),
        sold: false,
        discount: 0,
        price: parseFloat(newProductPrice),
        images: [newProductImage],
      };
      setProducts(prevProducts => [...prevProducts, newProduct]);
      setAddProductModalVisible(false);
      setNewProductName('');
      setNewProductPrice('');
      setNewProductQuantity('');
      setNewProductImage('');
    }
  };

  const handleImagePickerOption = async (option) => {
    setShowImagePickerAlert(false);
    let result;
    if (option === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your camera to take photos.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else if (option === 'library') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your photo library to select photos.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }

    if (!result.canceled) {
      currentImageSetter(result.assets[0].uri);
    }
  };

  const showImagePickerOptions = (setImage) => {
    setCurrentImageSetter(() => setImage);
    setShowImagePickerAlert(true);
  };

  const renderImagePicker = (setImage, currentImage) => (
    <View style={styles.imagePickerContainer}>
      <TouchableOpacity 
        style={styles.imagePickerButton} 
        onPress={() => showImagePickerOptions(setImage)}
      >
        <Icon name="camera" size={30} color="#007bff" />
        <Text style={styles.imagePickerText}>إضافة صورة</Text>
      </TouchableOpacity>
      {currentImage && (
        <Image 
          source={{ uri: currentImage }} 
          style={styles.previewImage}
        />
      )}

      {showImagePickerAlert && (
        <View style={styles.alertOptions}>
          <TouchableOpacity 
            style={styles.alertOption} 
            onPress={() => handleImagePickerOption('camera')}
          >
            <Icon name="camera" size={24} color="#3d4785" />
            <Text style={styles.alertOptionText}>التقاط صورة</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.alertOption} 
            onPress={() => handleImagePickerOption('library')}
          >
            <Icon name="image" size={24} color="#3d4785" />
            <Text style={styles.alertOptionText}>اختيار من المعرض</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderProduct = ({ item }) => {
    if (!item || !item.id) {
      console.log('Undefined or invalid product item:', item);
      return null;
    }
    return (
      <View style={styles.productContainer}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.images[0] }} style={styles.productImage} />
          {item.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount}%</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDetails}>السعر: {item.price} MRU</Text>
          <Text style={styles.productDetails}>الكمية: {item.quantity}</Text>
          <View style={styles.productActions}>
            <TouchableOpacity style={styles.modifyButton} onPress={() => handleModifyProduct(item)}>
              <Icon name="edit" size={16} color="#fff" />
              <Text style={styles.buttonText}>تعديل</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteProduct(item.id)}>
              <Icon name="trash" size={16} color="#fff" />
              <Text style={styles.buttonText}>حذف</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderOrder = ({ item }) => {
    if (!item || !item.id) {
      console.log('Undefined or invalid order item:', item);
      return null;
    }
    const product = products.find(p => p.name === item.productName);

    if (!product) {
      return (
        <View style={styles.orderContainer}>
          <Text style={styles.orderClientName}>Product not found</Text>
        </View>
      );
    }

    return (
      <View style={styles.orderContainer}>
        <TouchableOpacity style={styles.orderButton} onPress={() => handleOrderClick(item)}>
          <MaterialIcons name="info" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.orderInfo}>
          <Text style={styles.orderClientName}>{item.clientName}</Text>
          <Text style={styles.orderDetails}>المنتج: {item.productName}</Text>
          <Text style={styles.orderDetails}>الكمية: {item.quantity}</Text>
          <Text style={styles.orderDetails}>السعر: {product ? product.price : 'N/A'} MRU</Text>
        </View>
        {product && (
          <Image source={{ uri: product.images[0] }} style={styles.orderProductImage} />
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن المنتجات أو الطلبات..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filterContainer}>
          <TouchableOpacity onPress={() => setFilter('products')}>
            <Text style={filter === 'products' ? styles.activeFilter : styles.filter}>المنتجات</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter('orders')}>
            <Text style={filter === 'orders' ? styles.activeFilter : styles.filter}>الطلبات</Text>
          </TouchableOpacity>
        </View>
        {filter === 'products' ? (
          <FlatList
            data={filteredProducts || []}
            renderItem={renderProduct}
            keyExtractor={item => item.id.toString()}
            style={styles.list}
          />
        ) : (
          <FlatList
            data={filteredOrders || []}
            renderItem={renderOrder}
            keyExtractor={item => item.id.toString()}
            style={styles.list}
          />
        )}
        {filter === 'products' && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
            <Text style={styles.addButtonText}>إضافة منتج</Text>
          </TouchableOpacity>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible && currentOrder !== null}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              {currentOrder && (
                <>
                  <Text style={styles.modalText}>تفاصيل الطلب</Text>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>اسم العميل: {currentOrder.clientName}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>المنتج: {currentOrder.productName}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>الكمية: {currentOrder.quantity}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>
                      السعر: {products.find(p => p.name === currentOrder.productName)?.price || 'N/A'} MRU
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>معلومات العميل: {currentOrder.clientInfo}</Text>
                  </View>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.sellButton} onPress={handleMarkAsSold}>
                      <FontAwesome name="check" size={24} color="#fff" />
                      <Text style={styles.buttonText}>بيع</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                      <FontAwesome name="close" size={24} color="#fff" />
                      <Text style={styles.buttonText}>إلغاء</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={addProductModalVisible}
          onRequestClose={() => setAddProductModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>{currentProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</Text>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalLabel}>اسم المنتج</Text>
                <TextInput
                  style={styles.modalInput}
                  value={currentProduct ? newName : newProductName}
                  onChangeText={currentProduct ? setNewName : setNewProductName}
                />
              </View>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalLabel}>السعر</Text>
                <TextInput
                  style={styles.modalInput}
                  value={currentProduct ? newPrice : newProductPrice}
                  onChangeText={currentProduct ? setNewPrice : setNewProductPrice}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalLabel}>الكمية</Text>
                <TextInput
                  style={styles.modalInput}
                  value={currentProduct ? newQuantity : newProductQuantity}
                  onChangeText={currentProduct ? setNewQuantity : setNewProductQuantity}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalLabel}>الخصم</Text>
                <TextInput
                  style={styles.modalInput}
                  value={currentProduct ? newDiscount : newDiscount}
                  onChangeText={currentProduct ? setNewDiscount : setNewDiscount}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
              {renderImagePicker(currentProduct ? setNewImage : setNewProductImage, currentProduct ? newImage : newProductImage)}
              <View style={styles.modalButtons}>
                <Button title={currentProduct ? 'حفظ' : 'إضافة'} onPress={currentProduct ? handleSaveChanges : handleSaveNewProduct} />
                <Button title="إلغاء" onPress={() => setAddProductModalVisible(false)} />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 80, // Add extra padding to avoid being obscured by the bottom navbar
    backgroundColor: '#f0f4f7',
  },
  searchInput: {
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    textAlign: 'right', // Align text to the right for Arabic
    backgroundColor: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  filter: {
    fontSize: 16,
    color: '#888',
  },
  activeFilter: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
  list: {
    marginBottom: 20,
  },
  productContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  discountBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#ff6347',
    borderRadius: 12,
    padding: 5,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    color: '#333',
    textAlign: 'right', // Align text to the right for Arabic
    fontWeight: 'bold',
  },
  productDetails: {
    fontSize: 14,
    color: '#555',
    textAlign: 'right', // Align text to the right for Arabic
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20, // Ensure there's space between the button and the bottom of the screen
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalProductImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
  },
  modalInputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 10,
    textAlign: 'right',
  },
  modalInput: {
    width: '100%',
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'right', // Align text to the right for Arabic
  },
  selectImageIcon: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginTop: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 25,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#3d4785',
    marginLeft: 10,
    textAlign: 'center',
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  imagePickerText: {
    marginLeft: 10,
    color: '#007bff',
    fontSize: 16,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 10,
  },
  alertOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 10,
  },
  alertOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
  },
  alertOptionText: {
    fontSize: 16,
    color: '#3d4785',
    marginLeft: 10,
    textAlign: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  orderContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  orderProductImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
  },
  orderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  orderClientName: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  orderDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  orderButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  sellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
});

export default SellerProductsScreen;