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
  Modal
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { homeService } from '../services/homeService';

const CategoryProductsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Filtre durumları
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortOption, setSortOption] = useState('newest');
  const [showSortModal, setShowSortModal] = useState(false);

  // Filtre seçenekleri
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [tags, setTags] = useState([]);
  const [sizes, setSizes] = useState([]);

  const sortOptions = [
    { id: 'newest', label: 'الأحدث' },
    { id: 'oldest', label: 'الأقدم' },
    { id: 'priceAsc', label: 'السعر: من الأقل إلى الأعلى' },
    { id: 'priceDesc', label: 'السعر: من الأعلى إلى الأقل' },
    { id: 'nameAsc', label: 'الاسم: أ-ي' },
    { id: 'nameDesc', label: 'الاسم: ي-أ' },
  ];

  useEffect(() => {
    loadProducts();
    loadFilterOptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedSubcategory, selectedBrand, selectedTags, selectedSizes, sortOption, products]);

  const loadFilterOptions = async () => {
    try {
      const response = await homeService.getCategoryProducts(category._id);
      if (response.success) {
        const products = response.data;
        
        // Benzersiz alt kategorileri çıkar
        const uniqueSubcategories = products
          .flatMap(p => p.subcategories || [])
          .filter(sub => sub && sub._id && sub.name)
          .reduce((unique, sub) => {
            if (!unique.some(item => item._id === sub._id)) {
              unique.push(sub);
            }
            return unique;
          }, []);
        
        // Benzersiz markaları çıkar
        const uniqueBrands = products
          .map(p => p.brand)
          .filter(brand => brand && brand._id && brand.name)
          .reduce((unique, brand) => {
            if (!unique.some(item => item._id === brand._id)) {
              unique.push(brand);
            }
            return unique;
          }, []);
        
        // Benzersiz etiketleri çıkar
        const uniqueTags = products
          .flatMap(p => p.tags || [])
          .filter(tag => tag && tag._id && tag.name)
          .reduce((unique, tag) => {
            if (!unique.some(item => item._id === tag._id)) {
              unique.push(tag);
            }
            return unique;
          }, []);
        
        // Benzersiz bedenleri çıkar
        const uniqueSizes = products
          .flatMap(p => p.sizes || [])
          .filter(size => size && size._id && size.name)
          .reduce((unique, size) => {
            if (!unique.some(item => item._id === size._id)) {
              unique.push(size);
            }
            return unique;
          }, []);

        console.log('Filtered subcategories:', uniqueSubcategories);
        console.log('Filtered brands:', uniqueBrands);
        console.log('Filtered tags:', uniqueTags);
        console.log('Filtered sizes:', uniqueSizes);

        setSubcategories(uniqueSubcategories);
        setBrands(uniqueBrands);
        setTags(uniqueTags);
        setSizes(uniqueSizes);
      }
    } catch (error) {
      console.error('Load filter options error:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await homeService.getCategoryProducts(category._id);
      if (response.success) {
        setProducts(response.data);
        setFilteredProducts(response.data);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading products');
      console.error('Load products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Arama filtresi
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Alt kategori filtresi
    if (selectedSubcategory) {
      filtered = filtered.filter(product =>
        product.subcategories?.some(sub => sub._id === selectedSubcategory._id)
      );
    }

    // Marka filtresi
    if (selectedBrand) {
      filtered = filtered.filter(product =>
        product.brand?._id === selectedBrand._id
      );
    }

    // Etiket filtresi
    if (selectedTags.length > 0) {
      filtered = filtered.filter(product =>
        selectedTags.every(tag => 
          product.tags?.some(t => t._id === tag._id)
        )
      );
    }

    // Beden filtresi
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product =>
        selectedSizes.some(size => 
          product.sizes?.some(s => s._id === size._id)
        )
      );
    }

    // Sıralama
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'priceAsc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'nameAsc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleProductPress = (product) => {
    trackActivity('view_product', product._id);
    navigation.navigate('ProductDetailScreen', { 
      productId: product._id,
      product: product 
    });
  };

  const trackActivity = async (type, itemId) => {
    try {
      await homeService.trackActivity(type, itemId);
    } catch (error) {
      console.error('Activity tracking error:', error);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleProductPress(item)}
    >
      <Image
        source={{ uri: item.images?.[0] }}
        style={styles.productImage}
        defaultSource={require('../assets/placeholder.jpeg')}
      />
      <View style={styles.cardContent}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.brandName}>{item.brand?.name}</Text>
        <View style={styles.priceContainer}>
          {item.discountPrice ? (
            <>
              <Text style={styles.oldPrice}>{item.price} ريال</Text>
              <Text style={styles.price}>{item.discountPrice} ريال</Text>
            </>
          ) : (
            <Text style={styles.price}>{item.price} ريال</Text>
          )}
        </View>
        <View style={styles.ratingContainer}>
          {Array.from({ length: 5 }, (_, index) => (
            <AntDesign
              key={index}
              name={index < Math.floor(item.rating) ? "star" : "staro"}
              size={12}
              color="#FFD700"
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSubcategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.subcategoryCard,
        selectedSubcategory?._id === item._id && styles.selectedSubcategoryCard
      ]}
      onPress={() => setSelectedSubcategory(selectedSubcategory?._id === item._id ? null : item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.subcategoryImage}
        defaultSource={require('../assets/placeholder.jpeg')}
        resizeMode="cover"
      />
      <Text style={[
        styles.subcategoryText,
        selectedSubcategory?._id === item._id && styles.selectedSubcategoryText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterChip = ({ item, isSelected, onPress, style }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        isSelected && styles.selectedFilterChip,
        style
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterChipText,
        isSelected && styles.selectedFilterChipText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSortModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>ترتيب حسب</Text>
          {sortOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOption,
                sortOption === option.id && styles.selectedSortOption
              ]}
              onPress={() => {
                setSortOption(option.id);
                setShowSortModal(false);
              }}
            >
              <Text style={[
                styles.sortOptionText,
                sortOption === option.id && styles.selectedSortOptionText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setShowSortModal(false)}
          >
            <Text style={styles.closeModalButtonText}>إغلاق</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3d4785" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category.name}</Text>
        <TouchableOpacity onPress={() => setShowSortModal(true)} style={styles.sortButton}>
          <AntDesign name="bars" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="ابحث عن المنتجات..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#666"
      />

      <View style={styles.filtersContainer}>
        {/* Alt kategoriler */}
        {subcategories.length > 0 && (
          <FlatList
            horizontal
            data={subcategories}
            renderItem={renderSubcategory}
            keyExtractor={item => item._id.toString()}
            showsHorizontalScrollIndicator={false}
            style={styles.subcategoriesList}
          />
        )}

        {/* Diğer filtreler için tek bir ScrollView */}
        <View style={styles.otherFiltersContainer}>
          {/* Markalar */}
          {brands.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>الماركات</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {brands.map(brand => (
                  <TouchableOpacity
                    key={brand._id.toString()}
                    style={[
                      styles.filterChip,
                      selectedBrand?._id === brand._id && styles.selectedFilterChip
                    ]}
                    onPress={() => setSelectedBrand(selectedBrand?._id === brand._id ? null : brand)}
                  >
                    <Text style={styles.filterChipText}>{brand.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Etiketler */}
          {tags.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>العلامات</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {tags.map(tag => (
                  <TouchableOpacity
                    key={tag._id.toString()}
                    style={[
                      styles.filterChip,
                      selectedTags.includes(tag) && styles.selectedFilterChip
                    ]}
                    onPress={() => {
                      setSelectedTags(
                        selectedTags.includes(tag)
                          ? selectedTags.filter(t => t._id !== tag._id)
                          : [...selectedTags, tag]
                      );
                    }}
                  >
                    <Text style={styles.filterChipText}>{tag.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Bedenler */}
          {sizes.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>المقاسات</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {sizes.map(size => (
                  <TouchableOpacity
                    key={size._id.toString()}
                    style={[
                      styles.filterChip,
                      selectedSizes.includes(size) && styles.selectedFilterChip
                    ]}
                    onPress={() => {
                      setSelectedSizes(
                        selectedSizes.includes(size)
                          ? selectedSizes.filter(s => s._id !== size._id)
                          : [...selectedSizes, size]
                      );
                    }}
                  >
                    <Text style={styles.filterChipText}>{size.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item._id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد منتجات</Text>
          </View>
        }
      />

      {renderSortModal()}
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
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlign: 'right',
  },
  listContainer: {
    padding: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 6,
    flex: 1,
    maxWidth: '47%',
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
  cardContent: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'right',
  },
  brandName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'right',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3d4785',
  },
  oldPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
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
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  subcategoriesList: {
    paddingHorizontal: 10,
  },
  subcategoryCard: {
    alignItems: 'center',
    marginRight: 15,
  },
  selectedSubcategoryCard: {
    opacity: 0.7,
  },
  subcategoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#3d4785',
    backgroundColor: '#f0f0f0',
  },
  subcategoryText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  selectedSubcategoryText: {
    color: '#3d4785',
    fontWeight: 'bold',
  },
  otherFiltersContainer: {
    paddingVertical: 10,
  },
  filterSection: {
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    marginBottom: 5,
    textAlign: 'right',
  },
  filterChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedFilterChip: {
    backgroundColor: '#3d4785',
  },
  filterChipText: {
    color: '#666',
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: '#fff',
  },
  sortButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  sortOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedSortOption: {
    backgroundColor: '#f0f0f0',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  selectedSortOptionText: {
    color: '#3d4785',
    fontWeight: 'bold',
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 10,
  },
  closeModalButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default CategoryProductsScreen;