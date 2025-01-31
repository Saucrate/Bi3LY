import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ScrollView, Dimensions } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([
    { id: '1', name: 'أحذية إنجلترا', price: '37.24 MRU', image: 'https://i.postimg.cc/8CmBZH5N/shoes.webp' },
    { id: '2', name: 'جاكيت إنجلترا', price: '17.24 MRU', image: 'https://i.postimg.cc/76X9ZV8m/Screenshot_from_2022-06-03_18-45-12.png' },
    { id: '3', name: 'قميص إنجلترا', price: '27.24 MRU', image: 'https://i.postimg.cc/j2FhzSjf/bs2.png' },
    { id: '4', name: 'قبعة إنجلترا', price: '12.00 MRU', image: 'https://i.postimg.cc/3x3QzSGq/hat.jpg' },
  ]);

  const similarProducts = [
    { id: '1', name: 'حذاء رياضي', price: '45.00 MRU', image: 'https://i.postimg.cc/8CmBZH5N/shoes.webp' },
    { id: '2', name: 'سترة شتوية', price: '55.00 MRU', image: 'https://i.postimg.cc/76X9ZV8m/Screenshot_from_2022-06-03_18-45-12.png' },
    { id: '3', name: 'قميص صيفي', price: '25.00 MRU', image: 'https://i.postimg.cc/j2FhzSjf/bs2.png' },
    { id: '4', name: 'نظارات شمسية', price: '30.00 MRU', image: 'https://i.postimg.cc/3x3QzSGq/sunglasses.jpg' },
  ];

  const removeFavorite = (id) => {
    setFavorites((prevFavorites) => prevFavorites.filter(item => item.id !== id));
  };

  const renderFavoriteItem = ({ item }) => (
    <View style={styles.favoriteItem}>
      <Image source={{ uri: item.image }} style={styles.favoriteImage} />
      <View style={styles.favoriteDetails}>
        <Text style={styles.favoriteName}>{item.name}</Text>
        <Text style={styles.favoritePrice}>{item.price}</Text>
        <TouchableOpacity style={styles.buyNowButton}>
          <Text style={styles.buyNowText}>اشتر الآن</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => removeFavorite(item.id)} style={styles.removeButton}>
        <AntDesign name="delete" size={20} color="#FF0000" />
      </TouchableOpacity>
    </View>
  );

  const renderSimilarProduct = ({ item }) => (
    <View style={styles.similarCard}>
      <Image source={{ uri: item.image }} style={styles.similarImage} />
      <View style={styles.similarIconContainer}>
        <AntDesign name="like1" size={16} color="#FFA500" />
      </View>
      <View style={styles.similarDetails}>
        <Text style={styles.similarName}>{item.name}</Text>
        <Text style={styles.similarPrice}>{item.price}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require('../assets/banner.png')}
          style={styles.banner}
          resizeMode="cover"
        />
        <View>
          <FlatList
            data={favorites}
            renderItem={renderFavoriteItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.favoritesList}
          />
          <Text style={styles.sectionTitle}>منتجات مشابهة</Text>
          <FlatList
            data={similarProducts}
            renderItem={renderSimilarProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.similarList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'hsl(218, 50%, 91%)',
  },
  scrollContent: {
    paddingLeft: 10,
    paddingRight:10,
    paddingBottom: 100, // Extra space to avoid being obscured by the bottom bar
  },
  banner: {
    width: screenWidth - 32, // Full width minus padding
    height: 150, // Adjust height as needed
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: 'center', // Center the banner
  },
  favoritesList: {
    paddingBottom: 16,
  },
  favoriteItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  favoriteImage: {
    width: 100,
    height: 100,
  },
  favoriteDetails: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    
  },
  favoritePrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  buyNowButton: {
    backgroundColor: '#3d4785',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buyNowText: {
    color: '#fff',
    fontSize: 14,
  },
  removeButton: {
    padding: 10,
  },
  similarCard: {
    backgroundColor: '#FFDAB9', // Custom background color
    borderRadius: 10,
    marginRight: 15,
    width: 140,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  similarImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  similarIconContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 2,
  },
  similarDetails: {
    padding: 10,
  },
  similarName: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
    textAlign: 'left',
  },
  similarPrice: {
    fontSize: 14,
    color: '#3d4785',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginLeft: 16,
  },
  similarList: {
    paddingLeft: 16,
    marginBottom: 20,
  },
});

export default FavoritesScreen; 