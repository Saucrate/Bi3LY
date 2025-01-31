import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const CategoryProductsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { categoryName } = route.params;
  const [searchQuery, setSearchQuery] = useState('');

  const subcategories = [
    { id: '1', name: 'أجهزة الكمبيوتر المحمولة', image: 'https://example.com/laptop-category.jpg' },
    { id: '2', name: 'أجهزة الكمبيوتر المكتبية', image: 'https://example.com/desktop-category.jpg' },
    { id: '3', name: 'ملحقات الكمبيوتر', image: 'https://example.com/accessories-category.jpg' },
  ];

  const products = [
    {
      id: '1',
      name: "حاسوب HP Notebook",
      category: "أجهزة الكمبيوتر المحمولة",
      oldPrice: '1099 MRU',
      price: '999 MRU',
      available: 6,
      rating: 5,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/4.webp",
    },
    {
      id: '2',
      name: "حاسوب HP Envy",
      category: "أجهزة الكمبيوتر المحمولة",
      oldPrice: '1199 MRU',
      price: '1099 MRU',
      available: 7,
      rating: 4,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/7.webp",
    },
    {
      id: '3',
      name: "حاسوب Toshiba B77",
      category: "أجهزة الكمبيوتر المحمولة",
      oldPrice: '1399 MRU',
      price: '1299 MRU',
      available: 5,
      rating: 4.5,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/5.webp",
    },
  ];

  const renderSubcategory = ({ item }) => (
    <TouchableOpacity
      style={styles.subcategoryCard}
      onPress={() => console.log(`Subcategory ${item.name} clicked`)}
    >
      <Image source={{ uri: item.image }} style={styles.subcategoryImage} />
      <Text style={styles.subcategoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetailScreen', {
        productId: item.id,
        productName: item.name,
        productImage: item.image,
        productPrice: item.price,
        productDescription: item.category,
      })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.cardContent}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.priceText}>{item.price}</Text>
        <View style={styles.ratingContainer}>
          {Array.from({ length: 5 }, (_, index) => (
            <AntDesign
              key={index}
              name={index < Math.floor(item.rating) ? "star" : "staro"}
              size={12}
              color="#FFD700"
            />
          ))}
          {item.rating % 1 !== 0 && <AntDesign name="star" size={12} color="#FFD700" />}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => console.log('Banner clicked')}>
        <Image source={require('../assets/banner.png')} style={styles.banner} />
      </TouchableOpacity>
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Text style={styles.categoryTitle}>{categoryName}</Text>
      <FlatList
        data={subcategories}
        renderItem={renderSubcategory}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subcategoryList}
      />
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'hsl(218, 50%, 91%)',
  },
  banner: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    marginBottom: 15,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 15,
  },
  subcategoryList: {
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  subcategoryCard: {
    alignItems: 'center',
    marginRight: 15,
  },
  subcategoryImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#3d4785',
    marginBottom: 5,
  },
  subcategoryText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 5,
    flex: 1,
    maxWidth: '48%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
    color: '#333',
    marginBottom: 5,
  },
  priceText: {
    fontSize: 16,
    color: '#3d4785',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default CategoryProductsScreen;