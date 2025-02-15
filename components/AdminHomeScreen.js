import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Modal, Alert, Image, Picker, Platform, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { adminService } from '../services/adminService';
import * as ImagePicker from 'expo-image-picker';
import { Picker as NativePicker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { requestService } from '../services/requestService';
import { AntDesign } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AdminHomeScreen = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [requests, setRequests] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    parent: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [parentCategories, setParentCategories] = useState([]);
  const [showParentList, setShowParentList] = useState(false);
  const navigation = useNavigation();

  const tabs = [
    { 
      id: 'ALL', 
      title: 'الكل', 
      icon: 'list',
      color: '#3d4785'
    },
    { 
      id: 'PRODUCT_APPROVAL', 
      title: 'المنتجات', 
      icon: 'box',
      color: '#4CAF50'  // Yeşil
    },
    { 
      id: 'USER_COMPLAINT', 
      title: 'الشكاوى', 
      icon: 'exclamation-circle',
      color: '#f44336'  // Kırmızı
    },
    { 
      id: 'STORE_SPONSORSHIP', 
      title: 'رعاية المتجر', 
      icon: 'store',
      color: '#2196F3'  // Mavi
    },
    { 
      id: 'PRODUCT_SPONSORSHIP', 
      title: 'رعاية المنتج', 
      icon: 'ad',
      color: '#FF9800'  // Turuncu
    },
    { 
      id: 'BLUE_BADGE', 
      title: 'العلامة الزرقاء', 
      icon: 'check-circle',
      color: '#1976D2'  // Koyu mavi
    },
    { 
      id: 'CATEGORIES', 
      title: 'الفئات', 
      icon: 'tags',
      color: '#9C27B0'  // Mor
    }
  ];

  useEffect(() => {
    loadRequests();
    if (activeTab === 'CATEGORIES') {
      loadCategories();
    }
  }, [activeTab]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await requestService.getRequests();
      console.log('Load Requests Response:', response);

      if (response?.success && Array.isArray(response.data)) {
        console.log('Setting requests:', response.data);
        setRequests(response.data);
      } else {
        console.warn('Invalid requests response:', response);
        setRequests([]);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل الطلبات');
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCategories = async () => {
    try {
      console.log('Loading categories in AdminHomeScreen...');
      const response = await adminService.getCategories();
      console.log('Categories response:', response);

      if (response?.success && Array.isArray(response.data)) {
        // Tüm kategorileri set et
        setCategories(response.data);
        
        // Parent kategorileri filtrele
        const mainCategories = response.data.filter(cat => !cat.parent);
        console.log('Main categories:', mainCategories);
        setParentCategories(mainCategories);
      } else {
        console.warn('Invalid categories response:', response);
        setCategories([]);
        setParentCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('خطأ', 'فشل في تحميل الفئات');
      setCategories([]);
      setParentCategories([]);
    }
  };

  const getFilteredRequests = () => {
    console.log('Active Tab:', activeTab); // Aktif sekmeyi logla
    console.log('All Requests:', requests); // Tüm requestleri logla
    
    let filtered = requests;
    
    // Tab filtresi
    if (activeTab === 'PRODUCT_APPROVAL') {
      console.log('Filtering for PRODUCT_APPROVAL tab');
      filtered = requests.filter(request => {
        console.log('Request type:', request.type); // Her request'in tipini logla
        return request.type === 'NEW_PRODUCT' || request.type === 'PRODUCT_APPROVAL';
      });
      console.log('Filtered products:', filtered); // Filtrelenmiş ürünleri logla
    } else if (activeTab !== 'ALL') {
      filtered = requests.filter(request => request.type === activeTab);
    }
    
    // Arama filtresi
    if (filter) {
      filtered = filtered.filter(request => {
        const senderName = request.sender?.name || '';
        const description = request.description || '';
        const productName = request.product?.name || '';
        const storeName = request.store?.name || '';

        return senderName.toLowerCase().includes(filter.toLowerCase()) ||
               description.toLowerCase().includes(filter.toLowerCase()) ||
               productName.toLowerCase().includes(filter.toLowerCase()) ||
               storeName.toLowerCase().includes(filter.toLowerCase());
      });
    }

    return filtered;
  };

  const handleRequestAction = async (requestId, status, reason = '') => {
    try {
      if (requestId.startsWith('pending_product_')) {
        const productId = requestId.replace('pending_product_', '');
        if (status === 'approved') {
          await adminService.approveProduct(productId);
        } else {
          await adminService.rejectProduct(productId, reason);
        }
      } else {
        await adminService.updateRequestStatus(requestId, status, reason);
      }
      loadRequests();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getRequestIcon = (type) => {
    switch (type) {
      case 'STORE_SPONSORSHIP': return 'store';
      case 'PRODUCT_SPONSORSHIP': return 'ad';
      case 'BLUE_BADGE': return 'check-circle';
      case 'PRODUCT_APPROVAL': return 'box';
      case 'USER_COMPLAINT': return 'exclamation-circle';
      default: return 'question-circle';
    }
  };

  const handleProductAction = async (productId, action, reason = '') => {
    try {
      setLoading(true);
      if (action === 'approve') {
        await adminService.approveProduct(productId);
        Alert.alert('نجاح', 'تمت الموافقة على المنتج بنجاح');
      } else {
        await adminService.rejectProduct(productId, reason);
        Alert.alert('نجاح', 'تم رفض المنتج بنجاح');
      }
      loadRequests(); // Listeyi yenile
    } catch (error) {
      console.error('Error handling product action:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء معالجة الطلب');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectProduct = async (productId) => {
    try {
      Alert.prompt(
        'سبب الرفض',
        'يرجى إدخال سبب رفض المنتج',
        [
          {
            text: 'إلغاء',
            style: 'cancel',
          },
          {
            text: 'رفض',
            onPress: (reason) => {
              if (!reason) {
                Alert.alert('خطأ', 'يجب إدخال سبب الرفض');
                return;
              }
              handleRequestAction(productId, 'rejected', reason);
            }
          },
        ],
        'plain-text'
      );
    } catch (error) {
      console.error('Error in handleRejectProduct:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء رفض المنتج');
    }
  };

  const handleRequestPress = (request) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const renderRequestCard = (request) => {
    console.log('Rendering request:', request); // Debug için

    if (!request || !request._id) {
      console.warn('Invalid request object:', request);
      return null;
    }

    if (request.type === 'NEW_PRODUCT' && request.product) {
      return (
        <TouchableOpacity 
          style={styles.productCard}
          onPress={() => handleRequestPress(request)}
        >
          <View style={styles.productInfo}>
            {request.product.images && request.product.images[0] && (
              <Image
                source={{ uri: request.product.images[0] }}
                style={styles.productImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{request.product.name || 'Unnamed Product'}</Text>
              <Text style={styles.storeInfo}>
                {request.store?.name || 'Unknown Store'}
              </Text>
              <Text style={styles.price}>
                {request.product.price ? `${request.product.price} MRU` : 'Price not set'}
              </Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleRequestAction(request._id, 'approved')}
            >
              <FontAwesome5 name="check" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>قبول</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => {
                Alert.prompt(
                  'سبب الرفض',
                  'يرجى إدخال سبب رفض المنتج',
                  [
                    {
                      text: 'إلغاء',
                      style: 'cancel',
                    },
                    {
                      text: 'رفض',
                      onPress: (reason) => {
                        if (!reason) {
                          Alert.alert('خطأ', 'يجب إدخال سبب الرفض');
                          return;
                        }
                        handleRequestAction(request._id, 'rejected', reason);
                      }
                    },
                  ],
                  'plain-text'
                );
              }}
            >
              <FontAwesome5 name="times" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>رفض</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    }
    
    return (
      <TouchableOpacity 
        style={styles.requestCard}
        onPress={() => handleRequestPress(request)}
      >
        <View style={styles.requestInfo}>
          <Text style={styles.requestType}>{getRequestTypeText(request.type)}</Text>
          <Text style={styles.requestDescription}>{request.description}</Text>
          {request.amount && (
            <Text style={styles.requestAmount}>Amount: {request.amount} MRU</Text>
          )}
          {request.duration && (
            <Text style={styles.requestDuration}>Duration: {request.duration} days</Text>
          )}
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleRequestAction(request._id, 'approved')}
          >
            <FontAwesome5 name="check" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>قبول</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRequestAction(request._id, 'rejected')}
          >
            <FontAwesome5 name="times" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>رفض</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const handleApprove = async (id) => {
    try {
      const selectedRequest = requests.find(r => r._id === id);
      
      if (selectedRequest?.type === 'NEW_PRODUCT' && selectedRequest.product) {
        // Sadece NEW_PRODUCT için özel endpoint
        await adminService.approveProduct(selectedRequest.product._id);
        Alert.alert('نجاح', 'تمت الموافقة على المنتج');
      } else {
        // Diğer tüm requestler için mevcut endpoint
        await requestService.updateRequestStatus(id, 'approved');
        Alert.alert('نجاح', 'تمت الموافقة على الطلب');
      }
      loadRequests();
    } catch (error) {
      console.error('Error in handleApprove:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الموافقة');
    }
  };

  const handleReject = async (id, reason) => {
    try {
      const selectedRequest = requests.find(r => r._id === id);

      if (selectedRequest?.type === 'NEW_PRODUCT' && selectedRequest.product) {
        // Sadece NEW_PRODUCT için özel endpoint
        await adminService.rejectProduct(selectedRequest.product._id, reason);
        Alert.alert('تم', 'تم رفض المنتج');
      } else {
        // Diğer tüm requestler için mevcut endpoint
        await requestService.updateRequestStatus(id, 'rejected', reason);
        Alert.alert('تم', 'تم رفض الطلب');
      }
      loadRequests();
    } catch (error) {
      console.error('Error in handleReject:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الرفض');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
  };

  const renderModalContent = () => {
    if (!selectedRequest) return null;

    switch (selectedRequest.type) {
      case 'BLUE_BADGE':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>طلب توثيق المتجر</Text>
            <View style={styles.storeContainer}>
              <Text style={styles.storeName}>{selectedRequest.store?.name}</Text>
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('SellerDetails', {
                    sellerId: selectedRequest.store?.owner
                  });
                }}
              >
                <Text style={styles.viewDetailsText}>عرض تفاصيل المتجر</Text>
                <AntDesign name="arrowleft" size={20} color="#3d4785" />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'STORE_SPONSORSHIP':
        const storeSponsorEndDate = new Date(selectedRequest.createdAt);
        storeSponsorEndDate.setDate(storeSponsorEndDate.getDate() + selectedRequest.duration);
        
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>طلب رعاية متجر</Text>
            <View style={styles.storeContainer}>
              <Text style={styles.storeName}>{selectedRequest.store?.name}</Text>
              <Text style={styles.sponsorAmount}>المبلغ: {selectedRequest.amount} MRU</Text>
              <Text style={styles.duration}>
                تاريخ الانتهاء: {storeSponsorEndDate.toLocaleDateString('ar-EG')}
              </Text>
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('SellerDetails', {
                    sellerId: selectedRequest.store?.owner
                  });
                }}
              >
                <Text style={styles.viewDetailsText}>عرض تفاصيل المتجر</Text>
                <AntDesign name="arrowleft" size={20} color="#3d4785" />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'PRODUCT_SPONSORSHIP':
        const productSponsorEndDate = new Date(selectedRequest.createdAt);
        productSponsorEndDate.setDate(productSponsorEndDate.getDate() + selectedRequest.duration);
        
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>طلب رعاية منتج</Text>
            <View style={styles.productSponsorContainer}>
              <Text style={styles.storeName}>{selectedRequest.store?.name}</Text>
              <Text style={styles.productName}>{selectedRequest.product?.name}</Text>
              <Text style={styles.sponsorAmount}>المبلغ: {selectedRequest.amount} MRU</Text>
              <Text style={styles.duration}>
                تاريخ الانتهاء: {productSponsorEndDate.toLocaleDateString('ar-EG')}
              </Text>
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('ProductDetail', {
                    productId: selectedRequest.product?._id,
                    productData: selectedRequest.product
                  });
                }}
              >
                <Text style={styles.viewDetailsText}>عرض تفاصيل المنتج</Text>
                <AntDesign name="arrowleft" size={20} color="#3d4785" />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'NEW_PRODUCT':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>طلب منتج جديد</Text>
            <View style={styles.newProductContainer}>
              <Text style={styles.storeName}>{selectedRequest.store?.name}</Text>
              <Text style={styles.productName}>{selectedRequest.product?.name}</Text>
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('ProductDetail', {
                    productId: selectedRequest.product?._id,
                    productData: selectedRequest.product
                  });
                }}
              >
                <Text style={styles.viewDetailsText}>عرض تفاصيل المنتج</Text>
                <AntDesign name="arrowleft" size={20} color="#3d4785" />
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const renderRequestModal = () => {
    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetContent}>
              <View style={styles.bottomSheetHandle} />
              {renderModalContent()}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.approveButton]}
                  onPress={() => {
                    handleApprove(selectedRequest._id);
                    setModalVisible(false);
                  }}
                >
                  <AntDesign name="check" size={20} color="#fff" />
                  <Text style={styles.modalButtonText}>قبول</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.rejectButton]}
                  onPress={() => {
                    Alert.prompt(
                      'سبب الرفض',
                      'يرجى كتابة سبب الرفض',
                      [
                        { text: 'إلغاء', style: 'cancel' },
                        {
                          text: 'رفض',
                          onPress: (reason) => {
                            if (reason) {
                              handleReject(selectedRequest._id, reason);
                              setModalVisible(false);
                            }
                          }
                        }
                      ]
                    );
                  }}
                >
                  <AntDesign name="close" size={20} color="#fff" />
                  <Text style={styles.modalButtonText}>رفض</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const handleAddCategory = async () => {
    try {
      await adminService.addCategory(categoryForm);
      loadCategories();
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '', parent: '' });
      Alert.alert('نجاح', 'تمت إضافة الفئة بنجاح');
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة الفئة');
    }
  };

  const handleUpdateCategory = async () => {
    try {
      await adminService.updateCategory(selectedCategory._id, categoryForm);
      loadCategories();
      setShowCategoryModal(false);
      setSelectedCategory(null);
      setCategoryForm({ name: '', description: '', parent: '' });
      Alert.alert('نجاح', 'تم تحديث الفئة بنجاح');
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الفئة');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    Alert.alert(
      'تأكيد',
      'هل أنت متأكد من حذف هذه الفئة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteCategory(categoryId);
              loadCategories();
              Alert.alert('نجاح', 'تم حذف الفئة بنجاح');
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء حذف الفئة');
            }
          }
        }
      ]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSubmitCategory = async () => {
    try {
      const formData = new FormData();
      formData.append('name', categoryForm.name);
      formData.append('description', categoryForm.description);
      
      if (categoryForm.parent) {
        formData.append('parent', categoryForm.parent);
      }
      
      if (selectedImage) {
        const localUri = selectedImage.uri;
        const filename = localUri.split('/').pop();
        
        formData.append('image', {
          uri: Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri,
          type: 'image/jpeg',
          name: filename,
        });
      }

      console.log('FormData içeriği:');
      for (let [key, value] of formData._parts) {
        console.log(key, value);
      }

      if (selectedCategory) {
        await adminService.updateCategory(selectedCategory._id, formData);
      } else {
        await adminService.addCategory(formData);
      }

      setShowCategoryModal(false);
      setSelectedCategory(null);
      setCategoryForm({ name: '', description: '', parent: '' });
      setSelectedImage(null);
      loadCategories();
      Alert.alert('نجاح', selectedCategory ? 'تم تحديث الفئة بنجاح' : 'تمت إضافة الفئة بنجاح');
    } catch (error) {
      console.error('Error submitting category:', error.response?.data || error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ الفئة');
    }
  };

  const renderParentCategorySelector = () => (
    <View style={styles.parentSelectorContainer}>
      <TouchableOpacity
        style={styles.parentSelectorButton}
        onPress={() => setShowParentList(!showParentList)}
      >
        <Text style={styles.parentSelectorText}>
          {categoryForm.parent
            ? categories.find(cat => cat._id === categoryForm.parent)?.name
            : 'اختر الفئة الأم (اختياري)'}
        </Text>
        <FontAwesome5 
          name={showParentList ? "chevron-up" : "chevron-down"} 
          size={16} 
          color="#666" 
        />
      </TouchableOpacity>

      {showParentList && (
        <View style={styles.parentListContainer}>
          <TouchableOpacity
            style={styles.parentListItem}
            onPress={() => {
              setCategoryForm({ ...categoryForm, parent: '' });
              setShowParentList(false);
            }}
          >
            <Text style={styles.parentListItemText}>بدون فئة أم</Text>
          </TouchableOpacity>
          {categories
            .filter(cat => !cat.parent && (!selectedCategory || cat._id !== selectedCategory._id))
            .map(cat => (
              <TouchableOpacity
                key={cat._id}
                style={styles.parentListItem}
                onPress={() => {
                  setCategoryForm({ ...categoryForm, parent: cat._id });
                  setShowParentList(false);
                }}
              >
                <Text style={styles.parentListItemText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
        </View>
      )}
    </View>
  );

  const renderCategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {selectedCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="اسم الفئة"
            value={categoryForm.name}
            onChangeText={(text) => setCategoryForm({...categoryForm, name: text})}
          />

          <TextInput
            style={styles.input}
            placeholder="وصف الفئة"
            value={categoryForm.description}
            onChangeText={(text) => setCategoryForm({...categoryForm, description: text})}
            multiline
          />

          {renderParentCategorySelector()}

          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonText}>
              {selectedImage ? 'تغيير الصورة' : 'إضافة صورة'}
            </Text>
          </TouchableOpacity>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.previewImage}
            />
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
              onPress={handleSubmitCategory}
            >
              <Text style={styles.buttonText}>حفظ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#f44336' }]}
              onPress={() => {
                setShowCategoryModal(false);
                setSelectedCategory(null);
                setCategoryForm({ name: '', description: '', parent: '' });
                setSelectedImage(null);
              }}
            >
              <Text style={styles.buttonText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCategory = (category) => {
    // Parent kategori adını bul
    const parentName = category.parent?.name || '';
    
    return (
      <View style={styles.categoryItem} key={category._id}>
        <View style={styles.categoryHeader}>
          {category.image ? (
            <Image 
              source={{ uri: category.image }} 
              style={styles.categoryImage}
            />
          ) : (
            <View style={styles.categoryImagePlaceholder}>
              <FontAwesome5 name="image" size={20} color="#999" />
            </View>
          )}
          <View style={styles.categoryTextContainer}>
            <Text style={styles.categoryName}>{category.name}</Text>
            {parentName && (
              <Text style={styles.parentCategory}>
                {`القسم الرئيسي: ${parentName}`}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            onPress={() => {
              setSelectedCategory(category);
              setCategoryForm({
                name: category.name,
                description: category.description,
                parent: category.parent?._id || ''
              });
              setSelectedImage(category.image ? { uri: category.image } : null);
              setShowCategoryModal(true);
            }}
            style={styles.editButton}
          >
            <FontAwesome5 name="edit" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* Alt kategorileri göster */}
        {category.subCategories?.length > 0 && (
          <View style={styles.subCategoriesContainer}>
            <Text style={styles.subCategoriesTitle}>الأقسام الفرعية:</Text>
            {category.subCategories.map(sub => (
              <Text key={sub._id} style={styles.subCategoryName}>
                {sub.name}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <TouchableOpacity
        style={styles.addCategoryButton}
        onPress={() => setShowCategoryModal(true)}
      >
        <FontAwesome5 name="plus" size={16} color="#fff" />
        <Text style={styles.addCategoryButtonText}>إضافة فئة جديدة</Text>
      </TouchableOpacity>

      {categories.map(category => (
        renderCategory(category)))
      }
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsList}
      >
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabItem,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <FontAwesome5 
              name={tab.icon} 
              size={14} 
              color={activeTab === tab.id ? '#fff' : '#666'} 
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const getRequestTypeText = (type) => {
    switch (type) {
      case 'STORE_SPONSORSHIP':
        return 'طلب رعاية متجر';
      case 'PRODUCT_SPONSORSHIP':
        return 'طلب رعاية منتج';
      case 'BLUE_BADGE':
        return 'طلب توثيق';
      case 'USER_COMPLAINT':
        return 'شكوى مستخدم';
      case 'NEW_PRODUCT':
        return 'طلب إضافة منتج جديد';
      default:
        return type;
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const showRequestActions = (request) => {
    if (!request.isPendingProduct) {
      Alert.alert(
        getRequestTypeText(request.type),
        'ما الإجراء الذي تريد اتخاذه؟',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'قبول',
            onPress: () => handleApprove(request._id)
          },
          {
            text: 'رفض',
            onPress: () => {
              Alert.prompt(
                'سبب الرفض',
                'يرجى كتابة سبب الرفض',
                [
                  { text: 'إلغاء', style: 'cancel' },
                  { 
                    text: 'رفض',
                    onPress: (reason) => reason && handleReject(request._id, reason)
                  }
                ]
              );
            }
          }
        ]
      );
    }
  };

  const renderItem = ({ item }) => {
    console.log('Request Item:', item); // Debug için

    return (
      <TouchableOpacity 
        style={styles.requestItem}
        onPress={() => handleRequestPress(item)}
      >
        <View style={styles.requestHeader}>
          <Text style={styles.requestType}>{getRequestTypeText(item.type)}</Text>
          <Text style={[
            styles.requestStatus,
            { color: item.status === 'pending' ? '#f39c12' : item.status === 'approved' ? '#27ae60' : '#e74c3c' }
          ]}>
            {item.status === 'pending' ? 'قيد الانتظار' : item.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
          </Text>
        </View>

        {item.type === 'NEW_PRODUCT' && item.product ? (
          <View style={styles.productPreview}>
            {item.product.images?.[0] && (
              <Image 
                source={{ uri: item.product.images[0] }}
                style={styles.productImage}
              />
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.product.name}</Text>
              <Text style={styles.productPrice}>{item.product.price} MRU</Text>
              <Text style={styles.storeName}>{item.store?.name}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.requestInfo}>
            <Text style={styles.senderName}>{item.sender?.name}</Text>
            <Text style={styles.requestDate}>
              {new Date(item.createdAt).toLocaleDateString('ar-EG')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.headerTitle}>إدارة الطلبات</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <FontAwesome5 name="sync" size={20} color="#3d4785" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={16} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="بحث في الطلبات..."
          value={filter}
          onChangeText={setFilter}
        />
      </View>

      {renderTabs()}

      <ScrollView style={styles.contentContainer}>
        {activeTab === 'CATEGORIES' ? renderCategories() : getFilteredRequests().map((request) => (
          <View key={request._id}>
            {renderRequestCard(request)}
          </View>
        ))}
      </ScrollView>

      {renderRequestModal()}
      {renderCategoryModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3d4785',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    backgroundColor: '#f5f6fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabsList: {
    paddingHorizontal: 10,
  },
  tabItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#666',
  },
  tabIcon: {
    width: 16,
    textAlign: 'center',
  },
  activeTab: {
    backgroundColor: '#3d4785',
  },
  activeTabText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  requestInfo: {
    marginBottom: 15,
  },
  requestType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 8,
  },
  requestDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  requestAmount: {
    fontSize: 15,
    color: '#2ecc71',
    fontWeight: '600',
    marginTop: 8,
  },
  requestDuration: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center'
  },
  approveButton: {
    backgroundColor: '#27ae60'
  },
  rejectButton: {
    backgroundColor: '#e74c3c'
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: SCREEN_HEIGHT * 0.4,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
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
    color: '#2c3e50',
  },
  closeButton: {
    padding: 5,
  },
  productContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  productImageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  modalProductImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  productDetails: {
    alignItems: 'center',
  },
  modalProductName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalProductPrice: {
    fontSize: 17,
    color: '#27ae60',
    fontWeight: '600',
    marginBottom: 6,
  },
  modalStoreName: {
    fontSize: 15,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  modalBrandName: {
    fontSize: 14,
    color: '#95a5a6',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f2f8',
    borderRadius: 8,
  },
  viewDetailsText: {
    color: '#3d4785',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    flex: 0.48,
  },
  approveButton: {
    backgroundColor: '#27ae60',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d4785',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  categoriesContainer: {
    padding: 15,
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  addCategoryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  categoryItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  parentCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  editButton: {
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  subCategoriesContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  subCategoriesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  subCategoryName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginBottom: 2,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    width: '100%',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  pickerContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#000',
    backgroundColor: 'transparent',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginVertical: 10,
    alignSelf: 'center'
  },
  imageButton: {
    backgroundColor: '#3d4785',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  imageButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10
  },
  categoryImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  parentSelectorContainer: {
    width: '100%',
    marginBottom: 15,
    zIndex: 1,
  },
  parentSelectorButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  parentSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  parentListContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 5,
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  parentListItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  parentListItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f6fa',
  },
  storeLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  storePhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  storeLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 14,
    color: '#1DA1F2',
    marginLeft: 4,
  },
  statusDetails: {
    marginTop: 8,
  },
  sponsorshipDetails: {
    marginTop: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  modalDragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  requestItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3d4785',
  },
  productPreview: {
    flexDirection: 'row',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2c3e50',
  },
  productPrice: {
    fontSize: 15,
    color: '#27ae60',
    marginBottom: 2,
  },
  storeName: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  brandName: {
    fontSize: 13,
    color: '#95a5a6',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: '#27ae60',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  senderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d4785',
  },
  requestDate: {
    fontSize: 14,
    color: '#666',
  },
  discountPrice: {
    fontSize: 13,
    color: '#e74c3c',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  productDetailButton: {
    backgroundColor: '#3d4785',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  productDetailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPreviewInModal: {
    alignItems: 'center',
    marginVertical: 10,
  },
  modalProductImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalProductName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalProductPrice: {
    fontSize: 16,
    color: '#27ae60',
  },
  modalContent: {
    padding: 15,
  },
  storeContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  productSponsorContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  newProductContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  sponsorAmount: {
    fontSize: 16,
    color: '#27ae60',
    marginBottom: 8,
  },
  duration: {
    fontSize: 15,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    flex: 0.48,
  },
  approveButton: {
    backgroundColor: '#27ae60',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AdminHomeScreen;