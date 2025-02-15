import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { adminService } from '../services/adminService';

const SellerDetailsScreen = ({ route, navigation }) => {
  const { sellerId } = route.params;
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState(null);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalFollowers: 0,
    orderStats: {
      delivered: 0,
      inProgress: 0,
      pending: 0
    },
    ratings: {
      average: 0,
      total: 0
    },
    topCategories: [],
    recentProducts: [],
    earnings: {
      total: 0,
      thisMonth: 0,
      pending: 0
    }
  });
  const [storeDetails, setStoreDetails] = useState({
    name: '',
    description: '',
    logo: '',
    banner: '',
    category: '',
    location: '',
    contactPhone: '',
    contactEmail: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    },
    businessHours: {
      open: '',
      close: '',
      weekends: false
    },
    followers: [],
    rating: 0,
    totalRatings: 0,
    isApproved: false,
    status: 'active',
    isSponsored: false,
    sponsorshipEnd: null,
    isVerified: false
  });

  useEffect(() => {
    loadSellerDetails();
    loadPendingProducts();
  }, [sellerId]);

  const loadSellerDetails = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSellerDetails(sellerId);
      console.log('Seller details full response:', JSON.stringify(response, null, 2));
      setSeller(response.data);
      
      if (response.data.store) {
        const storeData = response.data.store;
        console.log('Store data:', JSON.stringify(storeData, null, 2));
        
        setStoreDetails({
          _id: storeData._id,
          name: storeData.name || '',
          description: storeData.description || '',
          logo: storeData.logo || '',
          banner: storeData.banner || '',
          category: storeData.category || 'General Store',
          location: storeData.location || '',
          contactPhone: response.data.phoneNumber || '',
          contactEmail: response.data.email || '',
          socialMedia: storeData.socialMedia || {
            facebook: '',
            instagram: '',
            twitter: ''
          },
          businessHours: storeData.businessHours || {
            open: '09:00',
            close: '18:00',
            weekends: false
          },
          followers: storeData.followers || [],
          rating: storeData.rating || 0,
          totalRatings: storeData.totalRatings || 0,
          isApproved: storeData.isApproved || false,
          status: storeData.status || 'pending',
          isSponsored: storeData.isSponsored || false,
          sponsorshipEnd: storeData.sponsorshipEnd || null,
          isVerified: storeData.isVerified || false
        });
      }
      
      if (response.data.stats) {
        setStats({
          totalSales: response.data.stats.totalSales || 0,
          totalOrders: response.data.stats.totalOrders || 0,
          totalProducts: response.data.stats.totalProducts || 0,
          totalFollowers: response.data.store?.followers?.length || 0,
          orderStats: response.data.stats.orderStats || {
            delivered: 0,
            inProgress: 0,
            pending: 0
          },
          ratings: response.data.stats.ratings || {
            average: 0,
            total: 0
          },
          earnings: response.data.stats.earnings || {
            total: 0,
            thisMonth: 0,
            pending: 0
          },
          topCategories: response.data.stats.topCategories || [],
          recentProducts: response.data.stats.recentProducts || []
        });
      }
    } catch (error) {
      console.error('Error loading seller details:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل تفاصيل البائع');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingProducts = async () => {
    try {
      const response = await adminService.getPendingProducts();
      const sellerProducts = response.data.filter(
        product => product.store?._id === sellerId
      );
      setPendingProducts(sellerProducts);
    } catch (error) {
      console.error('Error loading pending products:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل المنتجات المعلقة');
    }
  };

  const handleApproveProduct = async (productId) => {
    try {
      await adminService.approveProduct(productId);
      Alert.alert('نجاح', 'تمت الموافقة على المنتج');
      loadPendingProducts();
    } catch (error) {
      console.error('Error approving product:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الموافقة على المنتج');
    }
  };

  const handleRejectProduct = async (productId) => {
    try {
      const reason = await new Promise((resolve) => {
        Alert.prompt(
          'سبب الرفض',
          'يرجى إدخال سبب رفض المنتج',
          [
            {
              text: 'إلغاء',
              onPress: () => resolve(null),
              style: 'cancel',
            },
            {
              text: 'رفض',
              onPress: (reason) => resolve(reason),
            },
          ],
          'plain-text'
        );
      });

      if (reason) {
        await adminService.rejectProduct(productId, reason);
        Alert.alert('نجاح', 'تم رفض المنتج');
        loadPendingProducts();
      }
    } catch (error) {
      console.error('Error rejecting product:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء رفض المنتج');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await adminService.updateSellerStatus(sellerId, newStatus);
      Alert.alert('نجاح', 'تم تحديث حالة البائع بنجاح');
      loadSellerDetails();
    } catch (error) {
      console.error('Error updating seller status:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث حالة البائع');
    }
  };

  const renderRatingSection = () => {
    const ratings = stats.ratings || { average: 0, total: 0 };
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>التقييمات</Text>
        <View style={styles.ratingInfo}>
          <Text style={styles.ratingValue}>{ratings.average.toFixed(1)}</Text>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <FontAwesome5
                key={star}
                name="star"
                size={20}
                color={star <= Math.round(ratings.average) ? '#FFD700' : '#e0e0e0'}
                style={{ marginHorizontal: 2 }}
              />
            ))}
          </View>
          <Text style={styles.ratingCount}>
            {ratings.total} تقييم
          </Text>
        </View>
      </View>
    );
  };

  const renderPendingProducts = () => {
    if (pendingProducts.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المنتجات المعلقة</Text>
        {pendingProducts.map((product) => (
          <View key={product._id} style={styles.productCard}>
            <Image
              source={{ uri: product.images[0] }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price} MRU</Text>
            </View>
            <View style={styles.productActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApproveProduct(product._id)}
              >
                <Text style={styles.buttonText}>موافقة</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleRejectProduct(product._id)}
              >
                <Text style={styles.buttonText}>رفض</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderBusinessInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>معلومات العمل</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>الاسم:</Text>
        <Text style={styles.infoValue}>{seller?.name || 'غير متوفر'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>البريد الإلكتروني:</Text>
        <Text style={styles.infoValue}>{seller?.email || 'غير متوفر'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>رقم الهاتف:</Text>
        <Text style={styles.infoValue}>{seller?.phoneNumber || 'غير متوفر'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>حالة البائع:</Text>
        <Text style={[
          styles.infoValue,
          { color: seller?.isSellerVerified ? '#4CAF50' : '#FFA000' }
        ]}>
          {seller?.isSellerVerified ? 'نشط' : 'في الانتظار'}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>تاريخ التسجيل:</Text>
        <Text style={styles.infoValue}>
          {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString('ar-EG') : 'غير متوفر'}
        </Text>
      </View>
    </View>
  );

  const renderStoreDetails = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>معلومات المتجر</Text>
      <View style={styles.storeDetailsContainer}>
        {storeDetails.logo && (
          <Image 
            source={{ uri: storeDetails.logo }} 
            style={styles.storeLogo}
          />
        )}
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>اسم المتجر:</Text>
          <Text style={styles.infoValue}>{storeDetails.name || 'غير متوفر'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>اسم البائع:</Text>
          <Text style={styles.infoValue}>{seller?.name || 'غير متوفر'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>البريد الإلكتروني:</Text>
          <Text style={styles.infoValue}>{storeDetails.contactEmail || seller?.email || 'غير متوفر'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>رقم الهاتف:</Text>
          <Text style={styles.infoValue}>{storeDetails.contactPhone || seller?.phoneNumber || 'غير متوفر'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>الوصف:</Text>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{storeDetails.description || 'غير متوفر'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>التصنيف:</Text>
          <Text style={styles.infoValue}>{storeDetails.category || 'غير متوفر'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>الموقع:</Text>
          <Text style={styles.infoValue}>{storeDetails.location || 'غير متوفر'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ساعات العمل:</Text>
          <Text style={styles.infoValue}>
            {storeDetails.businessHours && storeDetails.businessHours.open && storeDetails.businessHours.close
              ? `${storeDetails.businessHours.open} - ${storeDetails.businessHours.close}`
              : 'غير متوفر'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>حالة المتجر:</Text>
          <Text style={[
            styles.infoValue,
            { color: storeDetails.status === 'active' ? '#4CAF50' : '#FFA000' }
          ]}>
            {storeDetails.status === 'active' ? 'نشط' : 'غير نشط'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>حالة البائع:</Text>
          <Text style={[
            styles.infoValue,
            { color: seller?.isSellerVerified ? '#4CAF50' : '#FFA000' }
          ]}>
            {seller?.isSellerVerified ? 'نشط' : 'في الانتظار'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>تاريخ التسجيل:</Text>
          <Text style={styles.infoValue}>
            {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString('ar-EG') : 'غير متوفر'}
          </Text>
        </View>

        {storeDetails.socialMedia && (
          <View style={styles.socialMediaContainer}>
            <Text style={styles.subSectionTitle}>وسائل التواصل الاجتماعي</Text>
            {storeDetails.socialMedia.facebook && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Facebook:</Text>
                <Text style={styles.infoValue}>{storeDetails.socialMedia.facebook}</Text>
              </View>
            )}
            {storeDetails.socialMedia.instagram && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Instagram:</Text>
                <Text style={styles.infoValue}>{storeDetails.socialMedia.instagram}</Text>
              </View>
            )}
            {storeDetails.socialMedia.twitter && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Twitter:</Text>
                <Text style={styles.infoValue}>{storeDetails.socialMedia.twitter}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalOrders || 0}</Text>
            <Text style={styles.statLabel}>الطلبات</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>المنتجات</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalFollowers}</Text>
            <Text style={styles.statLabel}>المتابعون</Text>
          </View>
        </View>

        {storeDetails.isSponsored && (
          <View style={styles.sponsorshipBadge}>
            <FontAwesome5 name="star" size={16} color="#FFD700" />
            <Text style={styles.sponsorshipText}>متجر مميز</Text>
          </View>
        )}

        {storeDetails.rating > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingValue}>{storeDetails.rating.toFixed(1)}</Text>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome5
                  key={star}
                  name="star"
                  size={16}
                  color={star <= Math.round(storeDetails.rating) ? '#FFD700' : '#e0e0e0'}
                  style={{ marginHorizontal: 2 }}
                />
              ))}
            </View>
            <Text style={styles.ratingCount}>
              {storeDetails.totalRatings || 0} تقييم
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderProducts = () => {
    const activeProducts = seller?.activeProducts || [];
    
    if (activeProducts.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المنتجات النشطة</Text>
        <FlatList
          data={activeProducts}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Image
                source={{ uri: item.images[0] }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price} MRU</Text>
                {item.brand && (
                  <Text style={styles.productBrand}>{item.brand.name}</Text>
                )}
                {item.categories && item.categories.length > 0 && (
                  <Text style={styles.productCategory}>
                    {item.categories.map(cat => cat.name).join(', ')}
                  </Text>
                )}
              </View>
            </View>
          )}
        />
      </View>
    );
  };

  if (loading || !seller) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3d4785" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header/Cover Image */}
        <Image 
          source={{ uri: storeDetails.banner || 'https://via.placeholder.com/500x200' }}
          style={styles.coverImage}
        />
        
        {/* Store Profile Section */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: storeDetails.logo || 'https://via.placeholder.com/100' }}
            style={styles.storeIcon}
          />
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{storeDetails.name || seller.name}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: seller.isSellerVerified ? '#4CAF50' : '#FFA000' }
            ]}>
              <Text style={styles.statusText}>
                {seller.isSellerVerified ? 'نشط' : 'في الانتظار'}
              </Text>
            </View>
          </View>
        </View>

        {renderBusinessInfo()}
        {renderStoreDetails()}

        {/* Performance Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إحصائيات الأداء</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalSales.toLocaleString()} MRU</Text>
              <Text style={styles.statLabel}>إجمالي المبيعات</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>الطلبات</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalProducts}</Text>
              <Text style={styles.statLabel}>المنتجات</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalFollowers}</Text>
              <Text style={styles.statLabel}>المتابعون</Text>
            </View>
          </View>
        </View>

        {/* Order Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حالة الطلبات</Text>
          <View style={styles.orderStats}>
            <View style={styles.orderStatItem}>
              <Text style={styles.orderStatValue}>{stats.orderStats.delivered}</Text>
              <Text style={styles.orderStatLabel}>تم التسليم</Text>
            </View>
            <View style={styles.orderStatItem}>
              <Text style={styles.orderStatValue}>{stats.orderStats.inProgress}</Text>
              <Text style={styles.orderStatLabel}>قيد التنفيذ</Text>
            </View>
            <View style={styles.orderStatItem}>
              <Text style={styles.orderStatValue}>{stats.orderStats.pending}</Text>
              <Text style={styles.orderStatLabel}>في الانتظار</Text>
            </View>
          </View>
        </View>

        {/* Earnings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الأرباح</Text>
          <View style={styles.earningsInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>الأرباح الإجمالية:</Text>
              <Text style={styles.infoValue}>{stats.earnings.total.toLocaleString()} MRU</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>أرباح هذا الشهر:</Text>
              <Text style={styles.infoValue}>{stats.earnings.thisMonth.toLocaleString()} MRU</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>الأرباح المعلقة:</Text>
              <Text style={styles.infoValue}>{stats.earnings.pending.toLocaleString()} MRU</Text>
            </View>
          </View>
        </View>

        {renderRatingSection()}

        {/* Top Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>أفضل التصنيفات</Text>
          {stats.topCategories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>{category.count} منتج</Text>
            </View>
          ))}
        </View>

        {/* Onay bekleyen ürünler bölümü */}
        {renderPendingProducts()}

        {renderProducts()}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!seller.isSellerVerified ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleUpdateStatus('approved')}
            >
              <Text style={styles.buttonText}>قبول البائع</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.blockButton]}
              onPress={() => handleUpdateStatus('blocked')}
            >
              <Text style={styles.buttonText}>حظر البائع</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: -50,
  },
  storeIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  storeInfo: {
    marginLeft: 15,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3d4785',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '30%',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center'
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d4785',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  orderStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderStatItem: {
    alignItems: 'center',
  },
  orderStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3d4785',
  },
  orderStatLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  ratingInfo: {
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3d4785',
  },
  ratingStars: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  ratingCount: {
    fontSize: 14,
    color: '#666',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  categoryCount: {
    fontSize: 16,
    color: '#666',
  },
  actionButtons: {
    padding: 20,
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  blockButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  earningsInfo: {
    padding: 20,
  },
  productCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#3d4785',
    fontWeight: 'bold',
  },
  productBrand: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  storeDetailsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
  },
  storeLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 15,
  },
  sponsorshipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  sponsorshipText: {
    color: '#FFB300',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 5,
  },
  descriptionText: {
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginVertical: 15,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    elevation: 1,
  },
  ratingContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  socialMediaContainer: {
    padding: 10,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 10,
  },
});

export default SellerDetailsScreen; 