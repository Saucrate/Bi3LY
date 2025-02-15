import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { homeService } from '../services/homeService';

const { width } = Dimensions.get('window');

const CategoriesScreen = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await homeService.getCategories();
      if (response.success) {
        setCategories(response.data);
        if (response.data.length > 0) {
          setSelectedCategory(response.data[0]);
        }
      } else {
        setError('حدث خطأ في تحميل التصنيفات');
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ في تحميل التصنيفات');
      console.error('خطأ في تحميل التصنيفات:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
  };

  const handleSubCategoryPress = (subCategory) => {
    navigation.navigate('CategoryProducts', {
      categoryId: subCategory._id,
      categoryName: subCategory.name
    });
  };

  const renderMainCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.mainCategoryItem,
        selectedCategory?._id === item._id && styles.selectedMainCategory
      ]}
      onPress={() => handleCategoryPress(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.mainCategoryImage}
        defaultSource={require('../assets/placeholder.jpeg')}
      />
      <Text style={[
        styles.mainCategoryText,
        selectedCategory?._id === item._id && styles.selectedMainCategoryText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderSubCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.subCategoryItem}
      onPress={() => handleSubCategoryPress(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.subCategoryImage}
        defaultSource={require('../assets/placeholder.jpeg')}
      />
      <View style={styles.subCategoryContent}>
        <Text style={styles.subCategoryName}>{item.name}</Text>
        <Text style={styles.productCount}>
          {item.productCount || 0} منتج
        </Text>
      </View>
      <AntDesign name="left" size={20} color="#666" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3d4785" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Ana Kategoriler */}
      <View style={styles.mainCategoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderMainCategory}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.mainCategoriesList}
        />
      </View>

      {/* Alt Kategoriler */}
      {selectedCategory && (
        <View style={styles.subCategoriesContainer}>
          <Text style={styles.subCategoriesTitle}>
            {selectedCategory.name}
          </Text>
          <FlatList
            data={selectedCategory.subCategories}
            renderItem={renderSubCategory}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            style={styles.subCategoriesList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mainCategoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mainCategoriesList: {
    paddingHorizontal: 10,
  },
  mainCategoryItem: {
    alignItems: 'center',
    marginHorizontal: 10,
    width: 80,
  },
  selectedMainCategory: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    padding: 5,
  },
  mainCategoryImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  mainCategoryText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  selectedMainCategoryText: {
    color: '#3d4785',
    fontWeight: 'bold',
  },
  subCategoriesContainer: {
    flex: 1,
    padding: 15,
  },
  subCategoriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'right',
  },
  subCategoriesList: {
    flex: 1,
  },
  subCategoryItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  subCategoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 15,
  },
  subCategoryContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  subCategoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'right',
  },
  productCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
    elevation: 2,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CategoriesScreen; 