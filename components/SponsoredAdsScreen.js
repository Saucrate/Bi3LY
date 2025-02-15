import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { requestService } from '../services/requestService';
import { sellerService } from '../services/sellerService';

const SponsoredAdsScreen = () => {
  const [type, setType] = useState('STORE_SPONSORSHIP');
  const [duration, setDuration] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoreData();
    if (type === 'PRODUCT_SPONSORSHIP') {
      loadProducts();
    }
  }, [type]);

  const loadStoreData = async () => {
    try {
      const response = await sellerService.getStoreProfile();
      if (response.success) {
        setStore(response.data);
      }
    } catch (error) {
      console.error('Load store error:', error);
      Alert.alert('خطأ', 'فشل في تحميل معلومات المتجر');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await sellerService.getStoreProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل المنتجات');
    }
  };

  const handleSponsorshipRequest = async (type, data) => {
    try {
      if (!store) {
        Alert.alert('خطأ', 'لم يتم العثور على معلومات المتجر');
        return;
      }

      const requestData = {
        type: type,
        store: store._id,
        amount: data.amount,
        duration: data.duration,
        description: data.description,
        images: data.images || []
      };

      if (type === 'PRODUCT_SPONSORSHIP') {
        requestData.product = data.productId;
      }

      await requestService.createRequest(requestData);
      Alert.alert('نجاح', 'تم إرسال طلب الرعاية بنجاح');
      
    } catch (error) {
      console.error('Sponsorship request error:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال الطلب');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#3d4785" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>طلب رعاية</Text>

        <View style={styles.typeSelector}>
          <TouchableOpacity 
            style={[styles.typeButton, type === 'STORE_SPONSORSHIP' && styles.selectedType]}
            onPress={() => setType('STORE_SPONSORSHIP')}
          >
            <FontAwesome5 
              name="store" 
              size={20} 
              color={type === 'STORE_SPONSORSHIP' ? '#fff' : '#3d4785'} 
            />
            <Text style={[styles.typeText, type === 'STORE_SPONSORSHIP' && styles.selectedTypeText]}>
              رعاية المتجر
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.typeButton, type === 'PRODUCT_SPONSORSHIP' && styles.selectedType]}
            onPress={() => setType('PRODUCT_SPONSORSHIP')}
          >
            <FontAwesome5 
              name="ad" 
              size={20} 
              color={type === 'PRODUCT_SPONSORSHIP' ? '#fff' : '#3d4785'} 
            />
            <Text style={[styles.typeText, type === 'PRODUCT_SPONSORSHIP' && styles.selectedTypeText]}>
              رعاية المنتج
            </Text>
          </TouchableOpacity>
        </View>

        {type === 'PRODUCT_SPONSORSHIP' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>اختر المنتج</Text>
            <TouchableOpacity 
              style={styles.productSelector}
              onPress={() => setShowProductSelector(!showProductSelector)}
            >
              {selectedProduct ? (
                <View style={styles.selectedProduct}>
                  <Image 
                    source={{ uri: selectedProduct.images[0] }} 
                    style={styles.productImage} 
                  />
                  <Text style={styles.productName}>{selectedProduct.name}</Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>اختر منتجًا للرعاية</Text>
              )}
              <FontAwesome5 name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            {showProductSelector && (
              <View style={styles.productList}>
                {products.map(product => (
                  <TouchableOpacity
                    key={product._id}
                    style={styles.productItem}
                    onPress={() => {
                      setSelectedProduct(product);
                      setShowProductSelector(false);
                    }}
                  >
                    <Image 
                      source={{ uri: product.images[0] }} 
                      style={styles.productItemImage} 
                    />
                    <View style={styles.productItemInfo}>
                      <Text style={styles.productItemName}>{product.name}</Text>
                      <Text style={styles.productItemPrice}>{product.price} MRU</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>مدة الرعاية (بالأيام)</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="مثال: 30"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>المبلغ (د.ت)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="أدخل المبلغ"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>تفاصيل إضافية</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholder="اكتب تفاصيل إضافية هنا..."
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={() => handleSponsorshipRequest(type, { amount, duration, description, productId: selectedProduct?._id })}>
          <Text style={styles.submitButtonText}>إرسال الطلب</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 20,
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#3d4785',
  },
  selectedType: {
    backgroundColor: '#3d4785',
  },
  typeText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#3d4785',
  },
  selectedTypeText: {
    color: '#fff',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  productSelector: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedProduct: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
  },
  productName: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  productList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  productItemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  productItemInfo: {
    flex: 1,
  },
  productItemName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  productItemPrice: {
    fontSize: 14,
    color: '#666',
  },
});

export default SponsoredAdsScreen; 