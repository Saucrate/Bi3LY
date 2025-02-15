import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { sellerService } from '../services/sellerService';
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

const EditProductScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Rengin açık mı koyu mu olduğunu kontrol eden yardımcı fonksiyon
  const isLightColor = (color) => {
    if (!color) return true; // Renk yoksa varsayılan olarak açık kabul et
    
    try {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Eğer geçersiz değerler varsa varsayılan olarak açık kabul et
      if (isNaN(r) || isNaN(g) || isNaN(b)) return true;
      
      const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return brightness > 128;
    } catch (error) {
      console.log('Error calculating color brightness:', error);
      return true; // Hata durumunda varsayılan olarak açık kabul et
    }
  };

  // Form verisi
  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    price: product.price?.toString() || '',
    discountPrice: product.discountPrice?.toString() || '',
    countInStock: product.countInStock?.toString() || '',
    images: product.images || [],
    brand: product.brand?._id || '',
    categories: product.categories?.map(cat => cat._id) || [],
    subcategories: product.subcategories?.map(sub => sub._id) || [],
    colors: product.colors?.map(color => color._id) || [],
    sizes: product.sizes?.map(size => size._id) || [],
    tags: product.tags?.map(tag => tag._id) || [],
    status: product.status || 'pending'
  });

  // Referans verileri
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [tags, setTags] = useState([]);
  
  // Arama state'leri
  const [brandSearch, setBrandSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [subcategorySearch, setSubcategorySearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [sizeSearch, setSizeSearch] = useState('');
  const [colorSearchText, setColorSearchText] = useState('');
  
  // Kategori yönetimi için state'ler
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  
  // Filtreleme için useMemo hooks'ları
  const filteredBrands = useMemo(() => {
    const filtered = brands.filter(brand => 
      brand.name.toLowerCase().includes(brandSearch.toLowerCase().trim())
    );
    if (brandSearch.trim() && filtered.length === 0) {
      return [{ _id: 'new', name: `${brandSearch} - إضافة جديدة`, isNew: true }];
    }
    return filtered;
  }, [brands, brandSearch]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories.filter(cat => !cat.parentCategory);
    const searchText = categorySearch.toLowerCase().trim();
    return categories.filter(cat => 
      !cat.parentCategory && cat.name.toLowerCase().includes(searchText)
    );
  }, [categories, categorySearch]);

  const filteredSubcategories = useMemo(() => {
    if (!formData.categories.length) return [];
    
    const subCats = categories.filter(cat => 
      cat.parentCategory && formData.categories.includes(cat.parentCategory)
    );

    if (!subcategorySearch) return subCats;
    
    const searchText = subcategorySearch.toLowerCase().trim();
    return subCats.filter(cat => 
      cat.name.toLowerCase().includes(searchText)
    );
  }, [categories, formData.categories, subcategorySearch]);

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
      color.name?.toLowerCase().includes(searchText) || 
      color.code?.toLowerCase().includes(searchText)
    );
  }, [colors, colorSearchText]);

  // Renk seçici için state'ler
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [newColorName, setNewColorName] = useState('');

  // Yeni renk ekleme fonksiyonu
  const handleAddColor = async () => {
    try {
      if (!newColorName || !selectedColor) {
        Alert.alert('خطأ', 'يرجى إدخال اسم اللون واختيار لون');
        return;
      }

      const response = await sellerService.addColor({
        name: newColorName,
        code: selectedColor
      });

      if (response.success) {
        setColors(prev => [...prev, response.data]);
        setShowColorPicker(false);
        setNewColorName('');
        setSelectedColor('#000000');
      }
    } catch (error) {
      Alert.alert('خطأ', error.response?.data?.error || 'حدث خطأ في إضافة اللون');
    }
  };

  const handleAddNewBrand = async (name) => {
    try {
      if (!name) {
        Alert.alert('خطأ', 'يرجى إدخال اسم الماركة');
        return;
      }

      const response = await sellerService.addBrand(name);
      console.log('Brand add response:', response);

      if (response.success) {
        setBrands(prev => [...prev, response.data]);
        setFormData(prev => ({ ...prev, brand: response.data._id }));
        setBrandSearch('');
        Alert.alert('نجاح', 'تمت إضافة الماركة بنجاح');
      }
    } catch (error) {
      console.error('Add brand error:', error);
      Alert.alert('خطأ', error.response?.data?.error || 'حدث خطأ في إضافة الماركة');
    }
  };

  const handleAddNewSize = async (name) => {
    try {
      if (!name) {
        Alert.alert('خطأ', 'يرجى إدخال اسم المقاس');
        return;
      }

      const response = await sellerService.addSize(name);
      console.log('Size add response:', response);

      if (response.success) {
        setSizes(prev => [...prev, response.data]);
        setFormData(prev => ({
          ...prev,
          sizes: [...prev.sizes, response.data._id]
        }));
        setSizeSearch('');
        Alert.alert('نجاح', 'تمت إضافة المقاس بنجاح');
      }
    } catch (error) {
      console.error('Add size error:', error);
      Alert.alert('خطأ', error.response?.data?.error || 'حدث خطأ في إضافة المقاس');
    }
  };

  const handleAddNewTag = async (name) => {
    try {
      if (!name) {
        Alert.alert('خطأ', 'يرجى إدخال اسم العلامة');
        return;
      }

      const response = await sellerService.addTag(name);
      console.log('Tag add response:', response);

      if (response.success) {
        setTags(prev => [...prev, response.data]);
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, response.data._id]
        }));
        setTagSearch('');
        Alert.alert('نجاح', 'تمت إضافة العلامة بنجاح');
      }
    } catch (error) {
      console.error('Add tag error:', error);
      Alert.alert('خطأ', error.response?.data?.error || 'حدث خطأ في إضافة العلامة');
    }
  };

  useEffect(() => {
    console.log('EditProductScreen mounted');
    console.log('Editing product:', product);
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      console.log('Loading initial data...');
      setLoadingData(true);
      setError(null);

      const [brandsRes, categoriesRes, colorsRes, sizesRes, tagsRes] = await Promise.all([
        sellerService.getBrands(),
        sellerService.getCategories(),
        sellerService.getColors(),
        sellerService.getSizes(),
        sellerService.getTags()
      ]);

      // Verileri state'e kaydet
      if (brandsRes.success) setBrands(brandsRes.data);
      if (categoriesRes.success) {
        const allCategories = categoriesRes.data;
        setCategories(allCategories);

        // Mevcut ürünün kategorilerini ayarla
        if (product.categories?.length > 0) {
          const categoryIds = product.categories.map(cat => 
            typeof cat === 'object' ? cat._id : cat
          );
          
          // Alt kategorileri ayarla
          const subcategoryIds = product.subcategories?.map(sub => 
            typeof sub === 'object' ? sub._id : sub
          ) || [];

          setFormData(prev => ({
            ...prev,
            categories: categoryIds,
            subcategories: subcategoryIds
          }));
        }
      }
      if (colorsRes.success) setColors(colorsRes.data);
      if (sizesRes.success) setSizes(sizesRes.data);
      if (tagsRes.success) {
        setTags(tagsRes.data);
        
        // Mevcut etiketleri ayarla
        if (product.tags?.length > 0) {
          console.log('Setting tags:', product.tags.map(tag => tag._id));
          setFormData(prev => ({
            ...prev,
            tags: product.tags.map(tag => tag._id)
          }));
        }
      }

      // Form verilerini güncelle
      setFormData(prev => ({
        ...prev,
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        discountPrice: product.discountPrice?.toString() || '',
        countInStock: product.countInStock?.toString() || '',
        images: product.images || [],
        brand: product.brand?._id || '',
        colors: product.colors?.map(color => color._id) || [],
        sizes: product.sizes?.map(size => size._id) || [],
        subcategories: product.subcategories?.map(sub => sub._id) || [], // Alt kategorileri tekrar ayarla
        tags: product.tags?.map(tag => tag._id) || [], // Etiketleri tekrar ayarla
        status: product.status || 'pending'
      }));

      console.log('All data loaded successfully');
      console.log('Final formData:', formData);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        maxWidth: 1024,
        maxHeight: 1024
      });

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, result.assets[0].uri]
        }));
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في اختيار الصورة');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();

      // Temel alanları ekle
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('countInStock', formData.countInStock);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('discountPrice', formData.discountPrice || '');

      // Eğer ürün durumu "pending" değilse, "pending" olarak ayarla
      if (product.status !== 'pending') {
        formDataToSend.append('status', 'pending');
      } else {
        formDataToSend.append('status', product.status);
      }

      // Array verilerini doğru formatta ekle
      formData.categories.forEach((categoryId, index) => {
        formDataToSend.append(`categories[${index}]`, categoryId);
      });

      formData.subcategories.forEach((subcategoryId, index) => {
        formDataToSend.append(`subcategories[${index}]`, subcategoryId);
      });

      formData.colors.forEach((colorId, index) => {
        formDataToSend.append(`colors[${index}]`, colorId);
      });

      formData.sizes.forEach((sizeId, index) => {
        formDataToSend.append(`sizes[${index}]`, sizeId);
      });

      formData.tags.forEach((tagId, index) => {
        formDataToSend.append(`tags[${index}]`, tagId);
      });

      // Mevcut resimleri ekle
      const existingImages = formData.images.filter(img => img.startsWith('http'));
      existingImages.forEach((img, index) => {
        formDataToSend.append(`existingImages[${index}]`, img);
      });

      // Yeni resimleri ekle
      const newImages = formData.images.filter(img => !img.startsWith('http'));
      newImages.forEach((image, index) => {
        const imageName = image.split('/').pop();
        const match = /\.(\w+)$/.exec(imageName);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formDataToSend.append(`images[${index}]`, {
          uri: image,
          type,
          name: imageName
        });
      });

      console.log('Updating product with status:', product.status !== 'pending' ? 'pending' : product.status);
      const response = await sellerService.updateProduct(product._id, formDataToSend);

      if (response.success) {
        Alert.alert('نجاح', 'تم تحديث المنتج بنجاح');
        navigation.goBack();
      } else {
        setError(response.error || 'حدث خطأ أثناء تحديث المنتج');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error.message || 'حدث خطأ أثناء تحديث المنتج');
    } finally {
      setLoading(false);
    }
  };

  // Alt kategorileri izleyen useEffect'i güncelleyelim
  useEffect(() => {
    if (selectedCategory) {
      console.log('Selected Category:', selectedCategory);
      
      // Alt kategorileri bul
      const subCats = categories.filter(cat => 
        cat.parent && 
        (cat.parent._id === selectedCategory._id || 
         cat.parent === selectedCategory._id)
      );
      
      console.log('Found subcategories:', subCats);
      setAvailableSubcategories(subCats);

      // Mevcut seçili alt kategorileri koru
      if (formData.subcategories.length > 0) {
        const validSubcategories = formData.subcategories.filter(subId => 
          subCats.some(cat => cat._id === subId)
        );
        
        if (validSubcategories.length !== formData.subcategories.length) {
          setFormData(prev => ({
            ...prev,
            subcategories: validSubcategories
          }));
        }
      }
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedCategory, categories]);

  // Kategori seçim fonksiyonları
  const handleCategorySelect = (category) => {
    console.log('Selecting category:', category);
    
    setFormData(prev => {
      const isSelected = prev.categories.includes(category._id);
      
      if (isSelected) {
        // Kategori zaten seçiliyse, kaldır
        const updatedCategories = prev.categories.filter(id => id !== category._id);
        // İlgili alt kategorileri de kaldır
        const updatedSubcategories = prev.subcategories.filter(subId => {
          const subCategory = categories.find(cat => cat._id === subId);
          return !subCategory || subCategory.parent !== category._id;
        });
        
        return {
          ...prev,
          categories: updatedCategories,
          subcategories: updatedSubcategories
        };
      } else {
        // Yeni kategori ekle
        return {
          ...prev,
          categories: [...prev.categories, category._id]
        };
      }
    });
  };

  const handleSubcategorySelect = (subcategory) => {
    console.log('Selecting subcategory:', subcategory);
    
    // Eğer alt kategorinin ana kategorisi seçili değilse, seçilemez
    const parentCategory = categories.find(cat => 
      cat._id === subcategory.parent || 
      cat._id === subcategory.parent?._id
    );
    
    if (!parentCategory || !formData.categories.includes(parentCategory._id)) {
      Alert.alert('تنبيه', 'يجب اختيار الفئة الرئيسية أولاً');
      return;
    }

    setFormData(prev => {
      const isSelected = prev.subcategories.includes(subcategory._id);
      return {
        ...prev,
        subcategories: isSelected
          ? prev.subcategories.filter(id => id !== subcategory._id)
          : [...prev.subcategories, subcategory._id]
      };
    });
  };

  // Tags bölümünü güncelleyelim
  const renderTagsSection = () => (
    <View style={styles.selectContainer}>
      <Text style={styles.selectLabel}>العلامات</Text>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="بحث عن علامة"
          onChangeText={setTagSearch}
          value={tagSearch}
          style={[styles.searchBar, { flex: 1 }]}
        />
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filteredTags.map(tag => (
          <TouchableOpacity
            key={tag._id}
            style={[
              styles.selectItem,
              formData.tags.includes(tag._id) && styles.selectedItem,
              tag.isNew && styles.newItem
            ]}
            onPress={() => {
              if (tag.isNew) {
                handleAddNewTag(tagSearch.trim());
              } else {
                setFormData(prev => ({
                  ...prev,
                  tags: prev.tags.includes(tag._id)
                    ? prev.tags.filter(id => id !== tag._id)
                    : [...prev.tags, tag._id]
                }));
              }
            }}
          >
            <Text style={[
              styles.selectItemText,
              formData.tags.includes(tag._id) && styles.selectedItemText,
              tag.isNew && styles.newItemText
            ]}>
              {tag.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loadingData) {
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
          <TouchableOpacity style={styles.retryButton} onPress={loadInitialData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
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
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="وصف المنتج"
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          />

          {/* Fiyat ve İndirimli Fiyat yan yana */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>السعر الأصلي</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                keyboardType="numeric"
                placeholder="السعر"
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>سعر التخفيض</Text>
              <TextInput
                style={styles.input}
                value={formData.discountPrice}
                onChangeText={(text) => setFormData(prev => ({ ...prev, discountPrice: text }))}
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
              value={formData.countInStock}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, '');
                if (!numericValue || numericValue === '0') {
                  setFormData(prev => ({ ...prev, countInStock: '1' }));
                  return;
                }
                setFormData(prev => ({ ...prev, countInStock: numericValue }));
              }}
            />
          </View>

          {/* Ana Kategoriler */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories
                .filter(cat => !cat.parent)
                .map((category) => (
                  <TouchableOpacity
                    key={category._id}
                    style={[
                      styles.categoryOption,
                      formData.categories.includes(category._id) && styles.selectedOption
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
          {formData.categories.length > 0 && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Subcategories</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories
                  .filter(cat => 
                    cat.parent && 
                    formData.categories.some(selectedCatId => {
                      const parentId = typeof cat.parent === 'object' ? cat.parent._id : cat.parent;
                      return selectedCatId === parentId;
                    })
                  )
                  .map((subcat) => (
                    <TouchableOpacity
                      key={subcat._id}
                      style={[
                        styles.categoryOption,
                        formData.subcategories.includes(subcat._id) && styles.selectedOption
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
                  ))}
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
                    formData.brand === brand._id && styles.selectedItem,
                    brand.isNew && styles.newItem
                  ]}
                  onPress={() => {
                    if (brand.isNew) {
                      handleAddNewBrand(brandSearch.trim());
                    } else {
                      setFormData(prev => ({ ...prev, brand: brand._id }));
                    }
                  }}
                >
                  <Text style={[
                    styles.selectItemText,
                    formData.brand === brand._id && styles.selectedItemText,
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
                      formData.colors.includes(color._id) && styles.selectedColorOption
                    ]}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        colors: prev.colors.includes(color._id)
                          ? prev.colors.filter(id => id !== color._id)
                          : [...prev.colors, color._id]
                      }));
                    }}
                  >
                    {formData.colors.includes(color._id) && (
                      <FontAwesome 
                        name="check" 
                        size={20} 
                        color={isLightColor(color.code) ? '#000' : '#fff'} 
                      />
                    )}
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
                    formData.sizes.includes(size._id) && styles.selectedItem,
                    size.isNew && styles.newItem
                  ]}
                  onPress={() => {
                    if (size.isNew) {
                      handleAddNewSize(sizeSearch.trim());
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        sizes: prev.sizes.includes(size._id)
                          ? prev.sizes.filter(id => id !== size._id)
                          : [...prev.sizes, size._id]
                      }));
                    }
                  }}
                >
                  <Text style={[
                    styles.selectItemText,
                    formData.sizes.includes(size._id) && styles.selectedItemText,
                    size.isNew && styles.newItemText
                  ]}>
                    {size.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Etiketler */}
          {renderTagsSection()}

          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <FontAwesome name="camera" size={20} color="#fff" />
            <Text style={styles.imageButtonText}>إضافة صورة</Text>
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
            {formData.images.map((image, index) => (
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
            onPress={handleUpdateProduct}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>تحديث المنتج</Text>
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
    flex: 1,
    marginRight: 10,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default EditProductScreen; 