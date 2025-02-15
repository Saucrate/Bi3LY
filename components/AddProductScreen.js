import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { sellerService } from '../services/sellerService';
import { TextInput as PaperInput, Portal, Modal as PaperModal } from 'react-native-paper';
import { Searchbar } from 'react-native-paper';

const COLORS = [
  // Ana renkler
  '#FF0000', '#FF4500', '#FFA500', '#FFD700', '#FFFF00', '#98FB98',
  '#00FF00', '#00FA9A', '#00FFFF', '#00BFFF', '#0000FF', '#4169E1',
  '#8A2BE2', '#9932CC', '#FF00FF', '#FF69B4', '#FFC0CB', '#FFE4E1',
  
  // Koyu tonlar
  '#8B0000', '#A0522D', '#8B4513', '#556B2F', '#006400', '#2F4F4F',
  '#191970', '#4B0082', '#800080', '#8B008B', '#C71585', '#A52A2A',
  
  // Açık tonlar
  '#FFA07A', '#FFB6C1', '#DDA0DD', '#E6E6FA', '#B0E0E6', '#F0FFFF',
  '#F5FFFA', '#F0FFF0', '#FAFAD2', '#FFEFD5', '#FFE4B5', '#FFDAB9',
  
  // Nötr renkler
  '#FFFFFF', '#F5F5F5', '#DCDCDC', '#D3D3D3', '#C0C0C0', '#A9A9A9',
  '#808080', '#696969', '#4D4D4D', '#333333', '#1A1A1A', '#000000'
];

const AddProductScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [tags, setTags] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [newColorName, setNewColorName] = useState('');

  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '1',
    discountPrice: '',
    countInStock: '1',
    brand: '',
    categories: [],
    subcategories: [],
    sizes: [],
    colors: [],
    tags: [],
    images: []
  });

  // Arama filtreleri için state'ler
  const [brandSearch, setBrandSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [sizeSearch, setSizeSearch] = useState('');
  const [colorSearchText, setColorSearchText] = useState('');
  
  // Seçili kategorilere göre alt kategorileri filtrelemek için
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  // State'leri güncelle
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  // Ana kategorileri filtrele
  const mainCategories = useMemo(() => {
    return categories.filter(cat => !cat.parent && !cat.parentCategory);
  }, [categories]);

  // Alt kategorileri filtrele
  const getSubcategoriesForCategory = (categoryId) => {
    console.log('Getting subcategories for categoryId:', categoryId);
    
    // Önce kategorinin kendisini bul
    const parentCategory = categories.find(cat => cat._id === categoryId);
    console.log('Parent category:', parentCategory);
    
    if (!parentCategory) return [];

    // Alt kategorileri bul
    const subcats = categories.filter(cat => {
      // Eğer kategori direkt olarak parent ID'ye sahipse
      const isDirectChild = cat.parent === categoryId;
      
      // Veya kategori parent objesine sahipse ve ID eşleşiyorsa
      const isObjectChild = cat.parent && cat.parent._id === categoryId;
      
      // Ya da subCategories array'inde varsa
      const isInSubCategories = parentCategory.subCategories && 
                              parentCategory.subCategories.includes(cat._id);

      return isDirectChild || isObjectChild || isInSubCategories;
    });

    console.log('Found subcategories:', subcats);
    return subcats;
  };

  useEffect(() => {
    console.log('AddProductScreen mounted');
    loadInitialData();
  }, []);

  useEffect(() => {
    if (product.categories.length > 0) {
      // Seçili kategorilerin alt kategorilerini bul
      const subCats = categories.filter(cat => {
        // Eğer seçili bir kategorinin alt kategorisiyse ve henüz seçilmemişse göster
        return cat.parentCategory && 
               product.categories.includes(cat.parentCategory) &&
               !product.categories.includes(cat._id);
      });
      
      setFilteredSubcategories(subCats);
    } else {
      setFilteredSubcategories([]);
    }
  }, [product.categories, categories]);

  useEffect(() => {
    if (selectedCategory) {
      console.log('Selected Category:', selectedCategory);
      
      // Alt kategorileri bul
      const subCats = categories.filter(cat => 
        cat.parent && 
        (cat.parent._id === selectedCategory._id || // Populated parent için
         cat.parent === selectedCategory._id)       // String ID için
      );
      
      console.log('Found subcategories:', subCats);
      setAvailableSubcategories(subCats);
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedCategory, categories]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      let brandsData = [], categoriesData = [], colorsData = [], sizesData = [], tagsData = [];

      try {
        const brandsRes = await sellerService.getBrands();
        if (brandsRes.success) brandsData = brandsRes.data;
      } catch (err) {
        console.log('Brands error:', err);
      }

      try {
        const categoriesRes = await sellerService.getCategories();
        if (categoriesRes.success) {
          console.log('Loaded categories:', categoriesRes.data);
          categoriesData = categoriesRes.data;
        }
      } catch (err) {
        console.log('Categories error:', err);
      }

      try {
        const colorsRes = await sellerService.getColors();
        if (colorsRes.success) colorsData = colorsRes.data;
      } catch (err) {
        console.log('Colors error:', err);
      }

      try {
        const sizesRes = await sellerService.getSizes();
        if (sizesRes.success) sizesData = sizesRes.data;
      } catch (err) {
        console.log('Sizes error:', err);
      }

      try {
        const tagsRes = await sellerService.getTags();
        if (tagsRes.success) tagsData = tagsRes.data;
      } catch (err) {
        console.log('Tags error:', err);
      }

      setBrands(brandsData);
      setCategories(categoriesData);
      setColors(colorsData);
      setSizes(sizesData);
      setTags(tagsData);

    } catch (error) {
      console.log('LoadInitialData error:', error);
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Form validasyonu
      if (!product.name.trim()) {
        throw new Error('Product name is required');
      }
      if (!product.price || Number(product.price) <= 0) {
        throw new Error('Valid price is required');
      }
      if (!product.brand) {
        throw new Error('Brand is required');
      }
      if (!product.images || product.images.length === 0) {
        throw new Error('At least one image is required');
      }

      console.log('Submitting product:', product);

      const response = await sellerService.addProduct({
        ...product,
        price: Number(product.price),
        countInStock: Number(product.countInStock),
        discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined
      });

      if (response.success) {
        Alert.alert('Success', 'Product added successfully');
        navigation.goBack();
      } else {
        throw new Error(response.error || 'Failed to add product');
      }

    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Error adding product');
      Alert.alert('Error', err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme fonksiyonları
  const filteredBrands = useMemo(() => {
    const filtered = brands.filter(brand => 
      brand.name.toLowerCase().includes(brandSearch.toLowerCase().trim())
    );
    if (brandSearch.trim() && filtered.length === 0) {
      return [{ _id: 'new', name: `${brandSearch} - إضافة جديدة`, isNew: true }];
    }
    return filtered;
  }, [brands, brandSearch]);

  const filteredTags = useMemo(() => {
    const filtered = tags.filter(tag => 
      tag.name.toLowerCase().includes(tagSearch.toLowerCase().trim())
    );
    if (tagSearch.trim() && filtered.length === 0) {
      return [{ _id: 'new', name: `${tagSearch} - إضافة جديدة`, isNew: true }];
    }
    return filtered;
  }, [tags, tagSearch]);

  const filteredSizes = useMemo(() => {
    const filtered = sizes.filter(size => 
      size.name.toLowerCase().includes(sizeSearch.toLowerCase().trim())
    );
    if (sizeSearch.trim() && filtered.length === 0) {
      return [{ _id: 'new', name: `${sizeSearch} - إضافة جديدة`, isNew: true }];
    }
    return filtered;
  }, [sizes, sizeSearch]);

  const filteredColors = useMemo(() => {
    if (!colorSearchText) return colors;
    
    const searchText = colorSearchText.toLowerCase().trim();
    return colors.filter(color => 
      (color.name?.toLowerCase().includes(searchText) || 
       color.arabicName?.includes(searchText) || 
       color.code?.toLowerCase().includes(searchText))
    );
  }, [colors, colorSearchText]);

  // Rengin açık mı koyu mu olduğunu kontrol eden yardımcı fonksiyon
  const isLightColor = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 128;
  };

  // Renk seçme fonksiyonu
  const handleColorSelect = (color) => {
    if (product.colors.includes(color._id)) {
      setProduct(prev => ({
        ...prev,
        colors: prev.colors.filter(id => id !== color._id)
      }));
    } else {
      setProduct(prev => ({
        ...prev,
        colors: [...prev.colors, color._id]
      }));
    }
  };

  // Yeni öğe ekleme fonksiyonları
  const handleAddNewBrand = async (name) => {
    try {
      setLoading(true);
      const response = await sellerService.addBrand(name);
      if (response.success) {
        const newBrand = response.data;
        setBrands([...brands, newBrand]);
        setProduct(prev => ({ ...prev, brand: newBrand._id }));
        setBrandSearch('');
      }
    } catch (error) {
      console.error('Brand ekleme hatası:', error);
      Alert.alert('خطأ', 'فشل في إضافة الماركة الجديدة');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewTag = async (name) => {
    try {
      setLoading(true);
      const response = await sellerService.addTag(name);
      if (response.success) {
        const newTag = response.data;
        setTags([...tags, newTag]);
        setProduct(prev => ({ ...prev, tags: [...prev.tags, newTag._id] }));
        setTagSearch('');
      }
    } catch (error) {
      console.error('Tag ekleme hatası:', error);
      Alert.alert('خطأ', 'فشل في إضافة العلامة الجديدة');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewSize = async (name) => {
    try {
      setLoading(true);
      const response = await sellerService.addSize(name);
      if (response.success) {
        const newSize = response.data;
        setSizes([...sizes, newSize]);
        setProduct(prev => ({ ...prev, sizes: [...prev.sizes, newSize._id] }));
        setSizeSearch('');
      }
    } catch (error) {
      console.error('Size ekleme hatası:', error);
      Alert.alert('خطأ', 'فشل في إضافة المقاس الجديد');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setProduct(prev => ({
          ...prev,
          images: [...prev.images, result.assets[0].uri]
        }));
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الصورة');
    }
  };

  const removeImage = (index) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Kategori seçim fonksiyonunu güncelle
  const handleCategorySelect = (category) => {
    console.log('Selecting category:', category);
    
    setProduct(prev => {
      const updatedCategories = prev.categories.includes(category._id)
        ? prev.categories.filter(id => id !== category._id)
        : [...prev.categories, category._id];
      
      // Seçili kategorinin alt kategorilerini bul
      const subcats = getSubcategoriesForCategory(category._id);
      console.log('Found subcategories for category:', subcats);
      
      // Eğer kategori kaldırıldıysa, onun alt kategorilerini de kaldır
      const updatedSubcategories = prev.subcategories.filter(subId => {
        const subcat = categories.find(c => c._id === subId);
        if (!subcat) return false;
        
        // Alt kategorinin parent'ı hala seçili kategoriler arasında mı kontrol et
        const parentId = subcat.parent?._id || subcat.parent;
        return updatedCategories.includes(parentId);
      });

      return {
        ...prev,
        categories: updatedCategories,
        subcategories: updatedSubcategories
      };
    });
  };

  // Alt kategori seçim fonksiyonunu güncelle
  const handleSubcategorySelect = (subcategory) => {
    console.log('Selecting subcategory:', subcategory);
    
    // Parent ID'yi doğru şekilde al
    const parentId = subcategory.parent?._id || subcategory.parent;
    console.log('Parent ID:', parentId);
    console.log('Current categories:', product.categories);
    
    // Parent kategorinin seçili olup olmadığını kontrol et
    if (!product.categories.includes(parentId)) {
      console.log('Parent category not selected, parent ID:', parentId);
      Alert.alert('تنبيه', 'يجب اختيار الفئة الرئيسية أولاً');
      return;
    }

    setProduct(prev => {
      const updatedSubcategories = prev.subcategories.includes(subcategory._id)
        ? prev.subcategories.filter(id => id !== subcategory._id)
        : [...prev.subcategories, subcategory._id];
      
      console.log('Updated subcategories:', updatedSubcategories);
      
      return {
        ...prev,
        subcategories: updatedSubcategories
      };
    });
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadInitialData}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loadingData) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#3d4785" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="اسم المنتج"
            value={product.name}
            onChangeText={(text) => setProduct(prev => ({ ...prev, name: text }))}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="وصف المنتج"
            multiline
            numberOfLines={4}
            value={product.description}
            onChangeText={(text) => setProduct(prev => ({ ...prev, description: text }))}
          />

          {/* Fiyat ve İndirimli Fiyat yan yana */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>السعر الأصلي</Text>
              <TextInput
                style={styles.input}
                value={product.price}
                onChangeText={(text) => setProduct(prev => ({ ...prev, price: text }))}
                keyboardType="numeric"
                placeholder="السعر"
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>سعر التخفيض</Text>
              <TextInput
                style={styles.input}
                value={product.discountPrice}
                onChangeText={(text) => setProduct(prev => ({ ...prev, discountPrice: text }))}
                keyboardType="numeric"
                placeholder="سعر التخفيض (اختياري)"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>الكمية المتوفرة</Text>
            <TextInput
              style={styles.input}
              placeholder="الكمية المتوفرة"
              keyboardType="number-pad"
              value={product.countInStock}
              onChangeText={(text) => {
                // Sadece sayıları kabul et
                const numericValue = text.replace(/[^0-9]/g, '');
                
                // Boş değer veya 0 girilirse 1 olarak ayarla
                if (!numericValue || numericValue === '0') {
                  setProduct(prev => ({ ...prev, countInStock: '1' }));
                  return;
                }

                setProduct(prev => ({ ...prev, countInStock: numericValue }));
              }}
            />
          </View>

          {/* Ana Kategoriler */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {mainCategories.map((category) => (
                <TouchableOpacity
                  key={category._id}
                  style={[
                    styles.categoryOption,
                    product.categories.includes(category._id) && styles.selectedOption
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  {category.image && (
                    <Image
                      source={{ uri: category.image }}
                      style={styles.categoryImage}
                    />
                  )}
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Alt Kategoriler */}
          {product.categories.length > 0 && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Alt Kategoriler</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {product.categories.map(categoryId => {
                  const subcategories = getSubcategoriesForCategory(categoryId);
                  return subcategories.map((subcat) => (
                    <TouchableOpacity
                      key={subcat._id}
                      style={[
                        styles.categoryOption,
                        product.subcategories.includes(subcat._id) && styles.selectedOption
                      ]}
                      onPress={() => handleSubcategorySelect(subcat)}
                    >
                      {subcat.image && (
                        <Image
                          source={{ uri: subcat.image }}
                          style={styles.categoryImage}
                        />
                      )}
                      <Text style={styles.categoryName}>{subcat.name}</Text>
                    </TouchableOpacity>
                  ));
                })}
              </ScrollView>
            </View>
          )}

          {/* Markalar */}
          <View style={styles.selectContainer}>
            <Text style={styles.selectLabel}>الماركة</Text>
            <Searchbar
              placeholder="بحث عن ماركة"
              onChangeText={setBrandSearch}
              value={brandSearch}
              style={styles.searchBar}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredBrands.map(brand => (
                <TouchableOpacity
                  key={brand._id}
                  style={[
                    styles.selectItem,
                    product.brand === brand._id && styles.selectedItem,
                    brand.isNew && styles.newItem
                  ]}
                  onPress={() => {
                    if (brand.isNew) {
                      handleAddNewBrand(brandSearch.trim());
                    } else {
                      setProduct(prev => ({ ...prev, brand: brand._id }));
                    }
                  }}
                >
                  <Text style={[
                    styles.selectItemText,
                    product.brand === brand._id && styles.selectedItemText,
                    brand.isNew && styles.newItemText
                  ]}>
                    {brand.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Renkler */}
          <View style={styles.selectContainer}>
            <Text style={styles.selectLabel}>الألوان</Text>
            <Searchbar
              placeholder="ابحث عن لون..."
              onChangeText={setColorSearchText}
              value={colorSearchText}
              style={styles.searchInput}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.colorGrid}>
                {filteredColors.map((color) => (
                  <TouchableOpacity
                    key={color._id}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color.code },
                      product.colors.includes(color._id) && styles.selectedColorOption
                    ]}
                    onPress={() => handleColorSelect(color)}
                  >
                    {product.colors.includes(color._id) && (
                      <FontAwesome 
                        name="check" 
                        size={20} 
                        color={isLightColor(color.code) ? '#000' : '#fff'} 
                      />
                    )}
                    <Text style={[
                      styles.colorName,
                      { color: isLightColor(color.code) ? '#000' : '#fff' }
                    ]}>
                      {color.arabicName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Bedenler */}
          <View style={styles.selectContainer}>
            <Text style={styles.selectLabel}>المقاسات</Text>
            <Searchbar
              placeholder="بحث عن مقاس"
              onChangeText={setSizeSearch}
              value={sizeSearch}
              style={styles.searchBar}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredSizes.map(size => (
                <TouchableOpacity
                  key={size._id}
                  style={[
                    styles.selectItem,
                    product.sizes.includes(size._id) && styles.selectedItem,
                    size.isNew && styles.newItem
                  ]}
                  onPress={() => {
                    if (size.isNew) {
                      handleAddNewSize(sizeSearch.trim());
                    } else {
                      const newSizes = product.sizes.includes(size._id)
                        ? product.sizes.filter(id => id !== size._id)
                        : [...product.sizes, size._id];
                      setProduct(prev => ({ ...prev, sizes: newSizes }));
                    }
                  }}
                >
                  <Text style={[
                    styles.selectItemText,
                    product.sizes.includes(size._id) && styles.selectedItemText,
                    size.isNew && styles.newItemText
                  ]}>
                    {size.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Etiketler */}
          <View style={styles.selectContainer}>
            <Text style={styles.selectLabel}>العلامات</Text>
            <Searchbar
              placeholder="بحث عن علامة"
              onChangeText={setTagSearch}
              value={tagSearch}
              style={styles.searchBar}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredTags.map(tag => (
                <TouchableOpacity
                  key={tag._id}
                  style={[
                    styles.selectItem,
                    product.tags.includes(tag._id) && styles.selectedItem,
                    tag.isNew && styles.newItem
                  ]}
                  onPress={() => {
                    if (tag.isNew) {
                      handleAddNewTag(tagSearch.trim());
                    } else {
                      const newTags = product.tags.includes(tag._id)
                        ? product.tags.filter(id => id !== tag._id)
                        : [...product.tags, tag._id];
                      setProduct(prev => ({ ...prev, tags: newTags }));
                    }
                  }}
                >
                  <Text style={[
                    styles.selectItemText,
                    product.tags.includes(tag._id) && styles.selectedItemText,
                    tag.isNew && styles.newItemText
                  ]}>
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <FontAwesome name="camera" size={20} color="#fff" />
            <Text style={styles.imageButtonText}>إضافة صورة</Text>
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
            {product.images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <FontAwesome name="times" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>إضافة المنتج</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showColorPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { height: '80%' }]}>
            <Text style={styles.modalTitle}>إضافة لون جديد</Text>
            
            <TextInput
              style={styles.input}
              placeholder="اسم اللون"
              value={newColorName}
              onChangeText={setNewColorName}
            />

            <View style={styles.colorPickerContainer}>
              <ScrollView>
                <View style={styles.colorGrid}>
                  {COLORS.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && styles.selectedColorOption
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <FontAwesome name="check" size={20} color={isLightColor(color) ? '#000' : '#fff'} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.colorPreviewContainer}>
              <Text style={styles.colorPreviewText}>اللون المختار:</Text>
              <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
              <Text style={styles.colorCode}>{selectedColor}</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowColorPicker(false);
                  setNewColorName('');
                  setSelectedColor('#000000');
                }}
              >
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  handleAddColor();
                }}
              >
                <Text style={styles.modalButtonText}>إضافة</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  form: {
    padding: 20
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  imageButton: {
    flexDirection: 'row',
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15
  },
  imageButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold'
  },
  imageList: {
    flexDirection: 'row',
    marginBottom: 15
  },
  imageContainer: {
    marginRight: 10,
    position: 'relative'
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#f44336',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold'
  },
  disabledButton: {
    opacity: 0.7
  },
  selectContainer: {
    marginBottom: 15
  },
  selectLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  selectItem: {
    padding: 10,
    borderWidth: 2,
    borderColor: '#3d4785',
    borderRadius: 5,
    marginRight: 5
  },
  selectedItem: {
    backgroundColor: '#3d4785'
  },
  selectItemText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  addNewItem: {
    padding: 10,
    borderWidth: 2,
    borderColor: '#3d4785',
    borderRadius: 5,
    marginRight: 5
  },
  addNewItemText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  colorItem: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#3d4785',
    borderRadius: 20,
    marginRight: 5
  },
  selectedColorItem: {
    backgroundColor: '#3d4785'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '90%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#3d4785',
    flex: 1,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#f44336'
  },
  confirmButton: {
    backgroundColor: '#4CAF50'
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  colorPickerContainer: {
    height: 300,
    marginVertical: 15
  },
  colorPreviewContainer: {
    alignItems: 'center',
    marginVertical: 15
  },
  colorPreviewText: {
    fontSize: 16,
    marginBottom: 5
  },
  colorPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#ddd',
    marginVertical: 10
  },
  colorCode: {
    fontSize: 14,
    color: '#666'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: '#f44336',
    marginBottom: 20
  },
  retryButton: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#3d4785',
    alignItems: 'center'
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  searchBar: {
    marginBottom: 10,
    backgroundColor: '#fff',
    elevation: 0,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  selectedItemText: {
    color: '#fff'
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    alignItems: 'center'
  },
  colorOption: {
    width: 80,
    height: 80,
    borderRadius: 40,
    margin: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedColorOption: {
    borderColor: '#000',
    borderWidth: 3,
    transform: [{ scale: 1.1 }]
  },
  colorName: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4
  },
  searchInput: {
    marginBottom: 10,
    backgroundColor: '#fff',
    elevation: 0,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  newItem: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  newItemText: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 15
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15
  },
  categoryOption: {
    marginRight: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    minWidth: 100,
  },
  selectedOption: {
    borderColor: '#3d4785',
    backgroundColor: '#f0f2ff',
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AddProductScreen; 