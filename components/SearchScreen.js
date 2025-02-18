import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { homeService } from '../services/homeService';
import { clientService } from '../services/clientService';
import CustomAlert from './CustomAlert';
import Modal from 'react-native-modal';

const SearchScreen = ({ route }) => {
  const navigation = useNavigation();
  
  // State tanımlamaları
  const [searchQuery, setSearchQuery] = useState(route.params?.initialQuery || '');
  const [products, setProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAlert, setShowAlert] = useState({ visible: false, message: '', type: 'info' });
  
  // Filtreleme state'leri
  const [sortOption, setSortOption] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [inStock, setInStock] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [brands, setBrands] = useState([]);
  const [limit, setLimit] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Sıralama seçenekleri
  const sortOptions = [
    { id: 'newest', label: 'الأحدث', icon: 'access-time' },
    { id: 'priceAsc', label: 'السعر: من الأقل إلى الأعلى', icon: 'arrow-upward' },
    { id: 'priceDesc', label: 'السعر: من الأعلى إلى الأقل', icon: 'arrow-downward' },
    { id: 'popular', label: 'الأكثر شعبية', icon: 'trending-up' },
    { id: 'rating', label: 'التقييم', icon: 'star' },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (route.params?.initialQuery) {
      searchProducts();
    }
  }, [route.params?.initialQuery]);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        homeService.getCategories(),
        homeService.getBrands()
      ]);
      
      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }
      
      if (brandsRes.success) {
        setBrands(brandsRes.data);
      }
    } catch (error) {
      console.error('Load initial data error:', error);
      setShowAlert({
        visible: true,
        message: 'حدث خطأ في تحميل البيانات',
        type: 'error'
      });
    }
  };

  const searchProducts = async (loadMore = false) => {
    if (!searchQuery.trim() && !selectedCategory && !selectedBrands.length) return;
    if (loadMore && !hasMore) return;

    setLoading(true);
    try {
      const options = {
        sortBy: sortOption,
        category: selectedCategory?._id,
        brands: selectedBrands,
        priceRange: {
          min: minPrice || 0,
          max: maxPrice || Infinity
        },
        rating: rating || 0,
        inStock,
        search: searchQuery,
        limit,
        skip: loadMore ? products.length : 0,
        tags: [],
        subcategories: selectedCategory ? [selectedCategory._id] : []
      };

      const response = await homeService.searchProducts(options);
      
      if (response.success) {
        const newProducts = response.data;
        setTotalProducts(response.pagination.total);
        setSimilarProducts(response.similarProducts || []);
        
        // Sayfalama durumunu güncelle
        setHasMore(response.pagination.hasMore);
        
        if (loadMore) {
          // Tekrarlanan ürünleri filtrele
          const uniqueProducts = newProducts.filter(
            newProduct => !products.some(
              existingProduct => existingProduct._id === newProduct._id
            )
          );
          
          if (uniqueProducts.length > 0) {
            setProducts(prevProducts => [...prevProducts, ...uniqueProducts]);
          }
        } else {
          setProducts(newProducts);
        }
      }
    } catch (error) {
      console.error('Search products error:', error);
      setShowAlert({
        visible: true,
        message: 'حدث خطأ في البحث',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && products.length < totalProducts) {
      searchProducts(true);
    }
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setRating(0);
    setInStock(false);
    setSortOption('newest');
  };

  const renderFilterModal = () => (
    <Modal
      isVisible={showFilterModal}
      onBackdropPress={() => setShowFilterModal(false)}
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>تصفية المنتجات</Text>
        
        {/* Price Range */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>نطاق السعر</Text>
          <View style={styles.priceInputs}>
            <TextInput
              style={styles.priceInput}
              placeholder="الحد الأدنى"
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="numeric"
            />
            <Text style={styles.priceSeparator}>-</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="الحد الأقصى"
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Rating Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>التقييم</Text>
          <View style={styles.ratingContainer}>
            {[5,4,3,2,1].map((star) => (
              <TouchableOpacity
                key={star}
                style={[
                  styles.ratingButton,
                  rating === star && styles.selectedRating
                ]}
                onPress={() => setRating(star)}
              >
                <Text style={styles.ratingText}>{star}+ ⭐</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Brands */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>الماركات</Text>
          <ScrollView style={styles.brandsContainer}>
            {brands.map((brand) => (
              <TouchableOpacity
                key={brand._id}
                style={[
                  styles.brandItem,
                  selectedBrands.includes(brand._id) && styles.selectedBrand
                ]}
                onPress={() => {
                  if (selectedBrands.includes(brand._id)) {
                    setSelectedBrands(selectedBrands.filter(id => id !== brand._id));
                  } else {
                    setSelectedBrands([...selectedBrands, brand._id]);
                  }
                }}
              >
                <Text style={styles.brandText}>{brand.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stock Status */}
        <TouchableOpacity
          style={styles.stockToggle}
          onPress={() => setInStock(!inStock)}
        >
          <Text style={styles.stockText}>متوفر في المخزون فقط</Text>
          <View style={[
            styles.checkbox,
            inStock && styles.checkedBox
          ]}>
            {inStock && <MaterialIcons name="check" size={18} color="#fff" />}
          </View>
        </TouchableOpacity>

        {/* Buttons */}
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.resetButton]}
            onPress={resetFilters}
          >
            <Text style={styles.resetButtonText}>إعادة تعيين</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.applyButton]}
            onPress={() => {
              setShowFilterModal(false);
              searchProducts();
            }}
          >
            <Text style={styles.applyButtonText}>تطبيق</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Ürün kartı bileşeni
  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetailScreen', { product: item })}
    >
      <Image
        source={{ uri: item.images[0] }}
        style={styles.productImage}
        defaultSource={require('../assets/placeholder.jpeg')}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price} MRU</Text>
        {item.discountPrice && (
          <Text style={styles.discountPrice}>{item.discountPrice} MRU</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Kategori kartı bileşeni
  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory?._id === item._id && styles.selectedCategoryChip
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory?._id === item._id && styles.selectedCategoryText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن المنتجات..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => searchProducts()}
          />
          <TouchableOpacity onPress={() => searchProducts()}>
            <AntDesign name="search1" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <MaterialIcons name="filter-list" size={24} color="#333" />
            <Text style={styles.filterButtonText}>تصفية</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowSortModal(true)}
          >
            <MaterialIcons name="sort" size={24} color="#333" />
            <Text style={styles.filterButtonText}>ترتيب</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={item => `category-${item._id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3d4785" style={styles.loader} />
      ) : (
        <>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item, index) => `product-${item._id}-${index}`}
            numColumns={2}
            contentContainerStyle={styles.productList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery 
                    ? 'لم يتم العثور على منتجات تطابق بحثك. حاول استخدام كلمات مختلفة أو تصفية أخرى.'
                    : 'ابدأ البحث عن المنتجات'}
                </Text>
                {searchQuery && (
                  <Text style={styles.emptySubText}>
                    يمكنك:
                  </Text>
                )}
                {searchQuery && (
                  <View style={styles.suggestionsList}>
                    <Text style={styles.suggestion}>• التحقق من الإملاء</Text>
                    <Text style={styles.suggestion}>• استخدام كلمات أعم</Text>
                    <Text style={styles.suggestion}>• تجربة فئة مختلفة</Text>
                    <Text style={styles.suggestion}>• إزالة بعض الفلاتر</Text>
                  </View>
                )}
              </View>
            }
            ListFooterComponent={
              <>
                {products.length > 0 && (
                  <View style={styles.footer}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#3d4785" />
                    ) : !hasMore ? (
                      <Text style={styles.endText}>نهاية النتائج</Text>
                    ) : null}
                  </View>
                )}
                
                {/* Benzer Ürünler Bölümü */}
                {similarProducts.length > 0 && (
                  <View style={styles.similarProductsContainer}>
                    <Text style={styles.similarProductsTitle}>منتجات مشابهة</Text>
                    <FlatList
                      data={similarProducts}
                      renderItem={renderProduct}
                      keyExtractor={(item, index) => `similar-${item._id}-${index}`}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.similarProductsList}
                    />
                  </View>
                )}
              </>
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
          />
        </>
      )}

      <CustomAlert
        visible={showAlert.visible}
        message={showAlert.message}
        type={showAlert.type}
        onClose={() => setShowAlert({ ...showAlert, visible: false })}
      />
      
      {renderFilterModal()}
      
      <Modal
        isVisible={showSortModal}
        onBackdropPress={() => setShowSortModal(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>ترتيب حسب</Text>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOption,
                sortOption === option.id && styles.selectedSort
              ]}
              onPress={() => {
                setSortOption(option.id);
                setShowSortModal(false);
                searchProducts();
              }}
            >
              <MaterialIcons name={option.icon} size={24} color={sortOption === option.id ? '#fff' : '#333'} />
              <Text style={[
                styles.sortOptionText,
                sortOption === option.id && styles.selectedSortText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
    textAlign: 'right',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  selectedCategoryChip: {
    backgroundColor: '#3d4785',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  productList: {
    padding: 10,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'right',
  },
  productPrice: {
    fontSize: 14,
    color: '#3d4785',
    textAlign: 'right',
  },
  discountPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    textAlign: 'right',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  suggestionsList: {
    width: '100%',
    paddingHorizontal: 20,
  },
  suggestion: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
    textAlign: 'right',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    marginLeft: 5,
    color: '#333',
    fontSize: 14,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
  },
  priceSeparator: {
    marginHorizontal: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedRating: {
    backgroundColor: '#3d4785',
  },
  ratingText: {
    color: '#333',
  },
  brandsContainer: {
    maxHeight: 150,
  },
  brandItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
  },
  selectedBrand: {
    backgroundColor: '#3d4785',
  },
  brandText: {
    color: '#333',
  },
  stockToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#3d4785',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#3d4785',
  },
  stockText: {
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
  },
  applyButton: {
    backgroundColor: '#3d4785',
  },
  resetButtonText: {
    color: '#333',
    textAlign: 'center',
  },
  applyButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedSort: {
    backgroundColor: '#3d4785',
  },
  sortOptionText: {
    marginLeft: 10,
    color: '#333',
  },
  selectedSortText: {
    color: '#fff',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  endText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  similarProductsContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  similarProductsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
    color: '#333',
  },
  similarProductsList: {
    paddingVertical: 10,
  },
});

export default SearchScreen; 