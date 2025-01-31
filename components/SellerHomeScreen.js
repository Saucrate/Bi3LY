import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, FlatList, TouchableOpacity, TextInput, Linking, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import { AntDesign } from '@expo/vector-icons';

const SellerHomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState({});

  // Sample data for categories, products, special stores, most sold products, most sold stores, and special products
  const categories = [
    { id: '1', name: 'مجموعات الملابس', image: 'https://i.postimg.cc/Xqmwr12c/clothing.webp' },
    { id: '2', name: 'أحذية الربيع', image: 'https://i.postimg.cc/8CmBZH5N/shoes.webp' },
    { id: '3', name: 'إكسسوارات', image: 'https://i.postimg.cc/MHv7KJYp/access.webp' },
    { id: '4', name: 'أجهزة إلكترونية', image: 'https://hisense.fr/wp-content/uploads/2023/07/40A5K-EURO-1.jpg' },
    { id: '5', name: 'أثاث', image: 'https://khamsat.hsoubcdn.com/images/services/4097828/d95a4bc7851d91a88e4616c5d86bde40.jpg' },
  ];

  const products = [
    {
      id: '1',
      name: "دفتر HP",
      category: "أجهزة الكمبيوتر المحمولة",
      oldPrice: '1099 MRU',
      price: '999 MRU',
      available: 6,
      rating: 5,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/4.webp",
    },
    {
      id: '2',
      name: "HP Envy",
      category: "أجهزة الكمبيوتر المحمولة",
      oldPrice: '1199 MRU',
      price: '1099 MRU',
      available: 7,
      rating: 4,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/7.webp",
    },
    {
      id: '3',
      name: "توشيبا B77",
      category: "أجهزة الكمبيوتر المحمولة",
      oldPrice: '1399 MRU',
      price: '1299 MRU',
      available: 5,
      rating: 4.5,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/5.webp",
    },
    {
      id: '4',
      name: "ماك بوك برو",
      category: "أجهزة الكمبيوتر المحمولة",
      oldPrice: '1599 MRU',
      price: '1499 MRU',
      available: 4,
      rating: 4.8,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/15.webp",
    },
    {
      id: '5',
      name: "ديل انسبايرون",
      category: "أجهزة الكمبيوتر المحمولة",
      oldPrice: '1299 MRU',
      price: '1199 MRU',
      available: 3,
      rating: 4.6,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/16.webp",
    },
    {
      id: '6',
      name: "لينوفو ثينك باد",
      category: "أجهزة الكمبيوتر المحمولة",
      oldPrice: '1399 MRU',
      price: '1299 MRU',
      available: 5,
      rating: 4.7,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/17.webp",
    },
  ];

  const specialStores = [
    { id: '1', name: 'متجر الإلكترونيات', type: 'إلكترونيات', rating: 4.5, followers: 1200, image: 'https://i.postimg.cc/3x3QzSGq/electronics-store.jpg', logo: 'https://i.postimg.cc/3x3QzSGq/electronics-logo.jpg' },
    { id: '2', name: 'متجر الأزياء', type: 'أزياء', rating: 4.7, followers: 1500, image: 'https://i.postimg.cc/3x3QzSGq/fashion-store.jpg', logo: 'https://i.postimg.cc/3x3QzSGq/fashion-logo.jpg' },
    { id: '3', name: 'متجر الأدوات المنزلية', type: 'أدوات منزلية', rating: 4.3, followers: 900, image: 'https://i.postimg.cc/3x3QzSGq/home-store.jpg', logo: 'https://i.postimg.cc/3x3QzSGq/home-logo.jpg' },
    { id: '4', name: 'متجر الألعاب', type: 'ألعاب', rating: 4.8, followers: 1100, image: 'https://i.postimg.cc/3x3QzSGq/games-store.jpg', logo: 'https://i.postimg.cc/3x3QzSGq/games-logo.jpg' },
    { id: '5', name: 'متجر الكتب', type: 'كتب', rating: 4.6, followers: 800, image: 'https://i.postimg.cc/3x3QzSGq/books-store.jpg', logo: 'https://i.postimg.cc/3x3QzSGq/books-logo.jpg' },
    { id: '6', name: 'متجر الأجهزة الرياضية', type: 'رياضة', rating: 4.4, followers: 1000, image: 'https://i.postimg.cc/3x3QzSGq/sports-store.jpg', logo: 'https://i.postimg.cc/3x3QzSGq/sports-logo.jpg' },
  ];

  const mostSoldProducts = [
    {
      id: '4',
      name: "هاتف سامسونج",
      category: "هواتف ذكية",
      price: '799 MRU',
      rating: 4.8,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/6.webp",
    },
    {
      id: '5',
      name: "سماعات آبل",
      category: "إكسسوارات",
      price: '299 MRU',
      rating: 4.9,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/8.webp",
    },
    {
      id: '6',
      name: "كاميرا كانون",
      category: "كاميرات",
      price: '999 MRU',
      rating: 4.7,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/18.webp",
    },
    {
      id: '7',
      name: "ساعة ذكية",
      category: "أجهزة رصد",
      price: '499 MRU',
      rating: 4.5,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/13.webp",
    },
    {
      id: '8',
      name: "لابتوب ألعاب",
      category: "أجهزة الكمبيوتر المحمولة",
      price: '1599 MRU',
      rating: 4.8,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/14.webp",
    },
  ];

  const mostSoldStores = [
    { id: '4', name: 'متجر الهواتف', type: 'هواتف', rating: 4.9, followers: 2000, image: 'https://i.postimg.cc/3x3QzSGq/mobile-store.jpg', logo: 'https://i.postimg.cc/3x3QzSGq/mobile-logo.jpg' },
    { id: '5', name: 'متجر الإكسسوارات', type: 'إكسسوارات', rating: 4.8, followers: 1800, image: 'https://i.postimg.cc/3x3QzSGq/accessories-store.jpg', logo: 'https://i.postimg.cc/3x3QzSGq/accessories-logo.jpg' },
    { id: '6', name: 'متجر الكاميرات', type: 'كاميرات', rating: 4.7, followers: 1500, image: 'https://i.postimg.cc/3x3QzSGq/camera-store.jpg', logo: 'https://i.postimg.cc/3x3QzSGq/camera-logo.jpg' },
    { id: '7', name: 'متجر الساعات', type: 'ساعات', rating: 4.6, followers: 1400, image: 'https://i.postimg.cc/3x3QzSGq/watch-store.jpg', logo: 'https://i.postimg.cc/3x3QzSGq/watch-logo.jpg' },
    { id: '8', name: 'متجر الألعاب', type: 'ألعاب', rating: 4.5, followers: 1300, image: 'https://i.postimg.cc/3x3QzSGq/games-store.jpg', logo: 'https://i.postimg.cc/3x3QzSGq/games-logo.jpg' },
  ];

  const specialProducts = [
    {
      id: '1',
      name: "لابتوب خاص",
      category: "أجهزة الكمبيوتر المحمولة",
      price: '1499 MRU',
      rating: 4.9,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/9.webp",
    },
    {
      id: '2',
      name: "سماعات خاصة",
      category: "إكسسوارات",
      price: '399 MRU',
      rating: 4.7,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/10.webp",
    },
    {
      id: '3',
      name: "هاتف خاص",
      category: "هواتف ذكية",
      price: '999 MRU',
      rating: 4.8,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/19.webp",
    },
    {
      id: '4',
      name: "كاميرا خاصة",
      category: "كاميرات",
      price: '1199 MRU',
      rating: 4.6,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/20.webp",
    },
    {
      id: '5',
      name: "ساعة خاصة",
      category: "أجهزة رصد",
      price: '499 MRU',
      rating: 4.5,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/21.webp",
    },
  ];

  const remiseProducts = [
    {
      id: '1',
      name: "لابتوب مخفض السعر",
      category: "أجهزة الكمبيوتر المحمولة",
      price: '899 MRU',
      rating: 4.7,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/11.webp",
    },
    {
      id: '2',
      name: "سماعات مخفضة السعر",
      category: "إكسسوارات",
      price: '199 MRU',
      rating: 4.6,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/12.webp",
    },
    {
      id: '3',
      name: "هاتف مخفض السعر",
      category: "هواتف ذكية",
      price: '699 MRU',
      rating: 4.5,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/8.webp",
    },
    {
      id: '4',
      name: "كاميرا مخفضة السعر",
      category: "كاميرات",
      price: '899 MRU',
      rating: 4.4,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/15.webp",
    },
    {
      id: '5',
      name: "ساعة مخفضة السعر",
      category: "أجهزة رصد",
      price: '299 MRU',
      rating: 4.3,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/20.webp",
    },
  ];

  const brands = [
    { id: '1', name: 'Nike', logo: 'https://i.postimg.cc/3x3QzSGq/nike-logo.jpg' },
    { id: '2', name: 'Adidas', logo: 'https://i.postimg.cc/3x3QzSGq/adidas-logo.jpg' },
    { id: '3', name: 'Apple', logo: 'https://i.postimg.cc/3x3QzSGq/apple-logo.jpg' },
    { id: '4', name: 'Samsung', logo: 'https://i.postimg.cc/3x3QzSGq/samsung-logo.jpg' },
    { id: '5', name: 'Sony', logo: 'https://i.postimg.cc/3x3QzSGq/sony-logo.jpg' },
  ];

  const subcategories = [
    { id: '1', name: 'ملابس رجالية', image: 'https://i.postimg.cc/3x3QzSGq/mens-clothing.jpg' },
    { id: '2', name: 'ملابس نسائية', image: 'https://i.postimg.cc/3x3QzSGq/womens-clothing.jpg' },
    { id: '3', name: 'أحذية رياضية', image: 'https://i.postimg.cc/3x3QzSGq/sports-shoes.jpg' },
    { id: '4', name: 'حقائب', image: 'https://i.postimg.cc/3x3QzSGq/bags.jpg' },
    { id: '5', name: 'ساعات', image: 'https://i.postimg.cc/3x3QzSGq/watches.jpg' },
  ];

  const toggleFavorite = (productId) => {
    setFavorites((prevFavorites) => ({
      ...prevFavorites,
      [productId]: !prevFavorites[productId],
    }));
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => navigation.navigate('CategoryProducts', { categoryId: item.id, categoryName: item.name })}
    >
      <View style={styles.categoryImageContainer}>
        <Image source={{ uri: item.image }} style={styles.categoryImage} />
      </View>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetailScreen', { productId: item.id, productName: item.name })}
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
          {item.rating % 1 !== 0 && <AntDesign name="starhalf" size={12} color="#FFD700" />}
        </View>
        <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
          <AntDesign
            name={favorites[item.id] ? "heart" : "hearto"}
            size={16}
            color={favorites[item.id] ? "#FF0000" : "#333"}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderStore = ({ item }) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => navigation.navigate('StoreDetails', { storeId: item.id, storeName: item.name })}
    >
      <Image source={{ uri: item.image }} style={styles.storeImage} />
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.name}</Text>
        <Text style={styles.storeType}>{item.type}</Text>
        <View style={styles.storeRating}>
          <AntDesign name="star" size={12} color="#FFD700" />
          <Text style={styles.storeRatingText}>{item.rating}</Text>
        </View>
        <Text style={styles.storeFollowers}>{item.followers} Followers</Text>
      </View>
      <Image source={{ uri: item.logo }} style={styles.storeLogo} />
    </TouchableOpacity>
  );

  const renderRemiseProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.remiseCard}
      onPress={() => navigation.navigate('ProductDetailScreen', { productId: item.id, productName: item.name })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.remiseIconContainer}>
        <AntDesign name="tag" size={16} color="#FFD700" />
      </View>
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
          {item.rating % 1 !== 0 && <AntDesign name="starhalf" size={12} color="#FFD700" />}
        </View>
        <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
          <AntDesign
            name={favorites[item.id] ? "heart" : "hearto"}
            size={16}
            color={favorites[item.id] ? "#FF0000" : "#333"}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن المنتجات..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Icon name="search" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>الفئات</Text>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />

        <Text style={styles.sectionTitle}>المنتجات الأكثر مبيعًا</Text>
        <FlatList
          data={mostSoldProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
        />

        <Text style={styles.sectionTitle}>المتاجر الأكثر مبيعًا</Text>
        <FlatList
          data={mostSoldStores}
          renderItem={renderStore}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storeList}
        />

        <Text style={styles.sectionTitle}>المنتجات الخاصة</Text>
        <FlatList
          data={specialProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
        />

        <Text style={styles.sectionTitle}>المنتجات المخفضة</Text>
        <FlatList
          data={remiseProducts}
          renderItem={renderRemiseProduct}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
        />

        <Text style={styles.sectionTitle}>الماركات</Text>
        <FlatList
          data={brands}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.brandItem}>
              <Image source={{ uri: item.logo }} style={styles.brandLogo} />
              <Text style={styles.brandName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandList}
        />

        <Text style={styles.sectionTitle}>الفئات الفرعية</Text>
        <FlatList
          data={subcategories}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.subcategoryItem}>
              <Image source={{ uri: item.image }} style={styles.subcategoryImage} />
              <Text style={styles.subcategoryName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subcategoryList}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingBottom: 40, // Increase padding to the bottom
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingBottom: 40, // Increase padding to the bottom
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    margin: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 10,
    marginTop: 20,
  },
  categoryList: {
    paddingHorizontal: 10,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 10,
  },
  categoryImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 5,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  productList: {
    paddingHorizontal: 10,
  },
  card: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: 100,
  },
  cardContent: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  priceText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  storeList: {
    paddingHorizontal: 10,
  },
  storeCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    marginBottom: 10,
  },
  storeImage: {
    width: '100%',
    height: 100,
  },
  storeInfo: {
    padding: 10,
  },
  storeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  storeType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  storeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  storeRatingText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 5,
  },
  storeFollowers: {
    fontSize: 12,
    color: '#666',
  },
  storeLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  remiseCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    marginBottom: 10,
  },
  remiseIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
  },
  brandList: {
    paddingHorizontal: 10,
  },
  brandItem: {
    alignItems: 'center',
    marginRight: 10,
  },
  brandLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
  },
  brandName: {
    fontSize: 14,
    color: '#333',
  },
  subcategoryList: {
    paddingHorizontal: 10,
  },
  subcategoryItem: {
    alignItems: 'center',
    marginRight: 10,
  },
  subcategoryImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
  },
  subcategoryName: {
    fontSize: 14,
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 40,
  },
});

export default SellerHomeScreen;