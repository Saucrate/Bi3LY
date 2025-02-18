import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { clientService } from '../services/clientService';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [bankilyNumber, setBankilyNumber] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    fullName: '',
    phoneNumber: '',
    wilaya: '',
    moughataa: '',
    street: '',
    buildingNo: '',
    apartmentNo: '',
    additionalDirections: ''
  });
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    loadAddresses();
    loadCartItems();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await clientService.getAddresses();
      if (response.success) {
        setAddresses(response.data);
        // Varsayılan adresi seç
        const defaultAddress = response.data.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Load addresses error:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل العناوين');
    } finally {
      setLoading(false);
    }
  };

  const loadCartItems = async () => {
    try {
      const response = await cartService.getCart();
      if (response.success) {
        setCartItems(response.data.items);
        // Toplam tutarı hesapla
        const total = response.data.items.reduce((sum, item) => {
          const price = item.product.discountPrice || item.product.price;
          return sum + (price * item.quantity);
        }, 0);
        setCartTotal(total);
      }
    } catch (error) {
      console.error('Load cart items error:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل عناصر السلة');
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      if (newQuantity < 1) return;
      const response = await cartService.updateCartItem(productId, newQuantity);
      if (response.success) {
        await loadCartItems(); // Sepeti yeniden yükle
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحديث الكمية');
    }
  };

  const handleAddAddress = async () => {
    try {
      if (!newAddress.fullName || !newAddress.phoneNumber || !newAddress.wilaya || 
          !newAddress.moughataa || !newAddress.street || !newAddress.title) {
        Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      setLoading(true);
      const response = await clientService.addAddress(newAddress);
      if (response.success) {
        setAddresses(response.data);
        setShowAddressModal(false);
        setNewAddress({
          title: '',
          fullName: '',
          phoneNumber: '',
          wilaya: '',
          moughataa: '',
          street: '',
          buildingNo: '',
          apartmentNo: '',
          additionalDirections: ''
        });
        Alert.alert('نجاح', 'تمت إضافة العنوان بنجاح');
      }
    } catch (error) {
      console.error('Add address error:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ في إضافة العنوان');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !selectedAddress) {
      Alert.alert('خطأ', 'يرجى اختيار عنوان التوصيل');
      return;
    }
    if (currentStep === 2 && !paymentMethod) {
      Alert.alert('خطأ', 'يرجى اختيار طريقة الدفع');
      return;
    }
    if (currentStep === 2 && paymentMethod === 'bankily' && !bankilyNumber) {
      Alert.alert('خطأ', 'يرجى إدخال رقم Bankily');
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmOrder = async () => {
    try {
      if (!selectedAddress || !paymentMethod) {
        Alert.alert('خطأ', 'يرجى اختيار عنوان التوصيل وطريقة الدفع');
        return;
      }

      if (paymentMethod === 'bankily' && !bankilyNumber) {
        Alert.alert('خطأ', 'يرجى إدخال رقم Bankily');
        return;
      }

      setLoading(true);

      const orderData = {
        shippingAddress: selectedAddress,
        paymentMethod,
        bankilyNumber: paymentMethod === 'bankily' ? bankilyNumber : undefined
      };

      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        Alert.alert('نجاح', 'تم تأكيد الطلب بنجاح', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Client')
          }
        ]);
      }
    } catch (error) {
      console.error('Confirm order error:', error);
      Alert.alert('خطأ', error.response?.data?.error || 'حدث خطأ في تأكيد الطلب');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepLine}>
        <View style={[styles.line, currentStep >= 2 && styles.activeLine]} />
        <View style={[styles.line, currentStep === 3 && styles.activeLine]} />
      </View>
      <View style={styles.stepsContainer}>
        <View style={styles.step}>
          <View style={[styles.stepCircle, currentStep >= 1 && styles.activeStep]}>
            <Text style={[styles.stepNumber, currentStep >= 1 && styles.activeStepNumber]}>1</Text>
          </View>
          <Text style={styles.stepText}>العنوان</Text>
        </View>
        <View style={styles.step}>
          <View style={[styles.stepCircle, currentStep >= 2 && styles.activeStep]}>
            <Text style={[styles.stepNumber, currentStep >= 2 && styles.activeStepNumber]}>2</Text>
          </View>
          <Text style={styles.stepText}>الدفع</Text>
        </View>
        <View style={styles.step}>
          <View style={[styles.stepCircle, currentStep === 3 && styles.activeStep]}>
            <Text style={[styles.stepNumber, currentStep === 3 && styles.activeStepNumber]}>3</Text>
          </View>
          <Text style={styles.stepText}>التأكيد</Text>
        </View>
      </View>
    </View>
  );

  const renderAddressStep = () => (
    <View style={styles.stepContent}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {addresses.map((address) => (
          <TouchableOpacity
            key={address._id}
            style={[
              styles.addressCard,
              selectedAddress?._id === address._id && styles.selectedAddressCard
            ]}
            onPress={() => setSelectedAddress(address)}
          >
            <View style={styles.addressHeader}>
              <Text style={styles.addressTitle}>{address.title}</Text>
              {address.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>افتراضي</Text>
                </View>
              )}
            </View>
            <Text style={styles.addressText}>{address.fullName}</Text>
            <Text style={styles.addressText}>{address.phoneNumber}</Text>
            <Text style={styles.addressText}>
              {`${address.wilaya}, ${address.moughataa}, ${address.street}`}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={styles.addAddressButton}
          onPress={() => setShowAddressModal(true)}
        >
          <MaterialIcons name="add" size={24} color="#3d4785" />
          <Text style={styles.addAddressText}>إضافة عنوان جديد</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderPaymentStep = () => (
    <View style={styles.stepContent}>
      <TouchableOpacity
        style={[
          styles.paymentOption,
          paymentMethod === 'cod' && styles.selectedPaymentOption
        ]}
        onPress={() => {
          setPaymentMethod('cod');
          setBankilyNumber('');
        }}
      >
        <MaterialIcons
          name="money"
          size={24}
          color={paymentMethod === 'cod' ? '#fff' : '#333'}
        />
        <Text style={[
          styles.paymentOptionText,
          paymentMethod === 'cod' && styles.selectedPaymentOptionText
        ]}>
          الدفع عند الاستلام
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paymentOption,
          paymentMethod === 'bankily' && styles.selectedPaymentOption
        ]}
        onPress={() => setPaymentMethod('bankily')}
      >
        <MaterialIcons
          name="payment"
          size={24}
          color={paymentMethod === 'bankily' ? '#fff' : '#333'}
        />
        <Text style={[
          styles.paymentOptionText,
          paymentMethod === 'bankily' && styles.selectedPaymentOptionText
        ]}>
          Bankily الدفع عبر
        </Text>
      </TouchableOpacity>

      {paymentMethod === 'bankily' && (
        <View style={styles.bankilyInputContainer}>
          <TextInput
            style={styles.bankilyInput}
            placeholder="أدخل رقم Bankily"
            value={bankilyNumber}
            onChangeText={setBankilyNumber}
            keyboardType="phone-pad"
          />
        </View>
      )}
    </View>
  );

  const renderConfirmationStep = () => (
    <View style={styles.stepContent}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ملخص الطلب</Text>
          
          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>عنوان التوصيل:</Text>
            <Text style={styles.summaryText}>
              {selectedAddress?.fullName}
            </Text>
            <Text style={styles.summaryText}>
              {`${selectedAddress?.wilaya}, ${selectedAddress?.moughataa}, ${selectedAddress?.street}`}
            </Text>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>طريقة الدفع:</Text>
            <Text style={styles.summaryText}>
              {paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'Bankily'}
            </Text>
            {paymentMethod === 'bankily' && (
              <Text style={styles.summaryText}>
                رقم Bankily: {bankilyNumber}
              </Text>
            )}
          </View>

          <View style={styles.cartItemsSection}>
            <Text style={styles.summaryLabel}>المنتجات:</Text>
            {cartItems.map((item) => (
              <View key={item.product._id} style={styles.cartItem}>
                <Image 
                  source={{ uri: item.product.images[0] }}
                  style={styles.cartItemImage}
                  defaultSource={require('../assets/placeholder.jpeg')}
                />
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.product.name}</Text>
                  <Text style={styles.cartItemPrice}>
                    {item.product.discountPrice || item.product.price} MRU
                  </Text>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity 
                      onPress={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity 
                      onPress={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>المجموع الكلي:</Text>
            <Text style={styles.totalAmount}>{cartTotal} MRU</Text>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmOrder}
          >
            <Text style={styles.confirmButtonText}>تأكيد الطلب</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderAddressModal = () => (
    <Modal
      visible={showAddressModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddressModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>إضافة عنوان جديد</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              style={styles.modalInput}
              value={newAddress.title}
              onChangeText={(text) => setNewAddress({ ...newAddress, title: text })}
              placeholder="عنوان العنوان (مثال: المنزل، العمل)"
            />
            <TextInput
              style={styles.modalInput}
              value={newAddress.fullName}
              onChangeText={(text) => setNewAddress({ ...newAddress, fullName: text })}
              placeholder="الاسم الكامل"
            />
            <TextInput
              style={styles.modalInput}
              value={newAddress.phoneNumber}
              onChangeText={(text) => setNewAddress({ ...newAddress, phoneNumber: text })}
              placeholder="رقم الهاتف"
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.modalInput}
              value={newAddress.wilaya}
              onChangeText={(text) => setNewAddress({ ...newAddress, wilaya: text })}
              placeholder="الولاية"
            />
            <TextInput
              style={styles.modalInput}
              value={newAddress.moughataa}
              onChangeText={(text) => setNewAddress({ ...newAddress, moughataa: text })}
              placeholder="المقاطعة"
            />
            <TextInput
              style={styles.modalInput}
              value={newAddress.street}
              onChangeText={(text) => setNewAddress({ ...newAddress, street: text })}
              placeholder="الشارع"
            />
            <TextInput
              style={styles.modalInput}
              value={newAddress.buildingNo}
              onChangeText={(text) => setNewAddress({ ...newAddress, buildingNo: text })}
              placeholder="رقم المبنى"
            />
            <TextInput
              style={styles.modalInput}
              value={newAddress.apartmentNo}
              onChangeText={(text) => setNewAddress({ ...newAddress, apartmentNo: text })}
              placeholder="رقم الشقة"
            />
            <TextInput
              style={styles.modalInput}
              value={newAddress.additionalDirections}
              onChangeText={(text) => setNewAddress({ ...newAddress, additionalDirections: text })}
              placeholder="توجيهات إضافية"
              multiline
            />
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleAddAddress}
            >
              <Text style={styles.saveButtonText}>حفظ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowAddressModal(false)}
            >
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3d4785" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إتمام الطلب</Text>
        <View style={styles.placeholder} />
      </View>

      {renderStepIndicator()}

      {currentStep === 1 && renderAddressStep()}
      {currentStep === 2 && renderPaymentStep()}
      {currentStep === 3 && renderConfirmationStep()}

      {currentStep < 3 && (
        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton]}
              onPress={prevStep}
            >
              <Text style={styles.prevButtonText}>السابق</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={nextStep}
          >
            <Text style={styles.nextButtonText}>التالي</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderAddressModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  stepIndicator: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  stepLine: {
    flexDirection: 'row',
    position: 'absolute',
    top: 40,
    left: 60,
    right: 60,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeLine: {
    backgroundColor: '#3d4785',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  step: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: '#3d4785',
    borderColor: '#3d4785',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  activeStepNumber: {
    color: '#fff',
  },
  stepText: {
    fontSize: 14,
    color: '#666',
  },
  stepContent: {
    flex: 1,
    padding: 20,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedAddressCard: {
    borderColor: '#3d4785',
    backgroundColor: '#f8f9ff',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: '#fff',
    fontSize: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3d4785',
    borderStyle: 'dashed',
  },
  addAddressText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#3d4785',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedPaymentOption: {
    backgroundColor: '#3d4785',
    borderColor: '#3d4785',
  },
  paymentOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  selectedPaymentOptionText: {
    color: '#fff',
  },
  bankilyInputContainer: {
    marginTop: 10,
  },
  bankilyInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  confirmButton: {
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  prevButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  nextButton: {
    backgroundColor: '#3d4785',
  },
  prevButtonText: {
    color: '#666',
    fontSize: 16,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
    textAlign: 'right',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#3d4785',
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  cartItemsSection: {
    marginTop: 20,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#3d4785',
    marginBottom: 5,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#333',
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d4785',
  },
});

export default CheckoutScreen; 