import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, FlatList, TouchableOpacity, TextInput, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import { AntDesign } from '@expo/vector-icons';

const HomeScreen = () => {
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

  const renderBrandItem = ({ item }) => (
    <TouchableOpacity
      style={styles.brandItem}
      onPress={() => navigation.navigate('BrandProducts', { brandId: item.id, brandName: item.name })}
    >
      <Image source={{ uri: item.logo }} style={styles.brandLogo} />
      <Text style={styles.brandName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderBrandGridItem = ({ item }) => (
    <View style={styles.brandGridItem}>
      <Image source={{ uri: item.logo }} style={styles.brandGridLogo} />
      <Text style={styles.brandGridName}>{item.name}</Text>
    </View>
  );

  const handleAddToCart = () => {
    // Add to cart logic
    // Do not close the modal
  };

  const filteredProducts = products.filter(product =>
    product.name.includes(searchQuery) || product.category.includes(searchQuery)
  );

  const renderFavoriteProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.favoriteCard}
      onPress={() => navigation.navigate('ProductDetailScreen', { productId: item.id, productName: item.name })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.favoriteIconContainer}>
        <AntDesign name="heart" size={16} color="#FF69B4" />
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
      </View>
    </TouchableOpacity>
  );

  const renderSuggestedProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestedCard}
      onPress={() => navigation.navigate('ProductDetailScreen', { productId: item.id, productName: item.name })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.suggestedIconContainer}>
        <AntDesign name="bulb1" size={16} color="#FFA500" />
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
      </View>
    </TouchableOpacity>
  );

  const followedStores = [
    { id: '1', name: 'متجر الأجهزة الإلكترونية', type: 'إلكترونيات', rating: 4.6, followers: 1300, image: 'https://i.postimg.cc/3x3QzSGq/gadget-store.jpg', logo: 'https://i.postimg.cc/3x3QzSGq/gadget-logo.jpg' },
    { id: '2', name: 'متجر الأزياء', type: 'أزياء', rating: 4.7, followers: 1500, image: 'https://i.postimg.cc/3x3QzSGq/fashion-store.jpg', logo: 'https://i.postimg.cc/3x3QzSGq/fashion-logo.jpg' },
    { id: '3', name: 'متجر الأدوات المنزلية', type: 'أدوات منزلية', rating: 4.3, followers: 900, image: 'https://i.postimg.cc/3x3QzSGq/home-store.jpg', logo: 'https://i.postimg.cc/3x3QzSGq/home-logo.jpg' },
    { id: '4', name: 'متجر الألعاب', type: 'ألعاب', rating: 4.8, followers: 1100, image: 'https://i.postimg.cc/3x3QzSGq/games-store.jpg', logo: 'https://i.postimg.cc/3x3QzSGq/games-logo.jpg' },
    { id: '5', name: 'متجر الكتب', type: 'كتب', rating: 4.6, followers: 800, image: 'https://i.postimg.cc/3x3QzSGq/books-store.jpg', logo: 'https://i.postimg.cc/3x3QzSGq/books-logo.jpg' },
  ];

  const suggestedProducts = [
    {
      id: '1',
      name: "ساعة ذكية",
      category: "أجهزة رصد",
      price: '499 MRU',
      rating: 4.5,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/13.webp",
    },
    {
      id: '2',
      name: "لابتوب ألعاب",
      category: "أجهزة الكمبيوتر المحمولة",
      price: '1599 MRU',
      rating: 4.8,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/14.webp",
    },
    {
      id: '3',
      name: "هاتف سامسونج",
      category: "هواتف ذكية",
      price: '799 MRU',
      rating: 4.8,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/6.webp",
    },
    {
      id: '4',
      name: "سماعات آبل",
      category: "إكسسوارات",
      price: '299 MRU',
      rating: 4.9,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/8.webp",
    },
    {
      id: '5',
      name: "كاميرا كانون",
      category: "كاميرات",
      price: '999 MRU',
      rating: 4.7,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/18.webp",
    },
  ];

  const followedProducts = [
    {
      id: '1',
      name: "لابتوب ألعاب",
      category: "أجهزة الكمبيوتر المحمولة",
      price: '1599 MRU',
      rating: 4.8,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/14.webp",
    },
    {
      id: '2',
      name: "هاتف سامسونج",
      category: "هواتف ذكية",
      price: '799 MRU',
      rating: 4.8,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/6.webp",
    },
    {
      id: '3',
      name: "سماعات آبل",
      category: "إكسسوارات",
      price: '299 MRU',
      rating: 4.9,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/8.webp",
    },
    {
      id: '4',
      name: "كاميرا كانون",
      category: "كاميرات",
      price: '999 MRU',
      rating: 4.7,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/18.webp",
    },
    {
      id: '5',
      name: "ساعة ذكية",
      category: "أجهزة رصد",
      price: '499 MRU',
      rating: 4.5,
      image: "https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/13.webp",
    },
  ];

  const renderSubcategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.subcategoryItem}
      onPress={() => navigation.navigate('SubcategoryProducts', { subcategoryId: item.id, subcategoryName: item.name })}
    >
      <View style={styles.subcategoryImageContainer}>
        <Image source={{ uri: item.image }} style={styles.subcategoryImage} />
      </View>
      <Text style={styles.subcategoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity style={styles.bannerContainer} onPress={() => Linking.openURL('#sellers')}>
        <Image source={{ uri: 'https://i.postimg.cc/t403yfn9/home2.jpg' }} style={styles.bannerImage} />
      </TouchableOpacity>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for products or categories"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>الفئات</Text>
      </View>
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
      />

      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>المتاجر المميزة</Text>
      </View>
      <FlatList
        data={specialStores}
        renderItem={renderStore}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.storeList}
      />

      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>المنتجات الخاصة</Text>
      </View>
      <FlatList
        data={specialProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.productList}
      />

      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>منتجات التخفيض</Text>
      </View>
      <FlatList
        data={remiseProducts}
        renderItem={renderRemiseProduct}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.productList}
      />

      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>المتاجر الأكثر مبيعًا</Text>
      </View>
      <FlatList
        data={mostSoldStores}
        renderItem={renderStore}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.storeList}
      />

      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>المنتجات الأكثر مبيعًا</Text>
      </View>
      <FlatList
        data={mostSoldProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.productList}
      />

      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>الفئات الفرعية</Text>
      </View>
      <FlatList
        data={subcategories}
        renderItem={renderSubcategoryItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.subcategoryList}
      />

      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>المتاجر المتابعة</Text>
      </View>
      <FlatList
        data={followedStores}
        renderItem={renderStore}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.storeList}
      />

      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>المنتجات المتابعة</Text>
      </View>
      <FlatList
        data={followedProducts}
        renderItem={renderFavoriteProduct}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.productList}
      />

      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>المنتجات المقترحة</Text>
      </View>
      <FlatList
        data={suggestedProducts}
        renderItem={renderSuggestedProduct}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.productList}
      />

      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>جميع العلامات التجارية</Text>
      </View>
      <FlatList
        data={brands}
        renderItem={renderBrandGridItem}
        keyExtractor={(item) => item.id}
        numColumns={1}
        key={(numColumns) => `numColumns-${numColumns}`}
        style={styles.brandGrid}
      />
      <View style={{ height: 100 }} /> {/* Extra space for bottom navigation */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modalContent}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={300}
        animationOutTiming={300}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        backdropTransitionOutTiming={0}
        backdropOpacity={0.5}
      >
        <View style={styles.modalInnerContent}>
          {selectedProduct && (
            <>
              <Image source={{ uri: selectedProduct.image }} style={styles.modalImage} />
              <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
              <Text style={styles.modalProductDescription}>{selectedProduct.category}</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Icon name="remove-circle-outline" size={30} color="#ff6347" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                  <Icon name="add-circle-outline" size={30} color="#1E90FF" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                <Icon name="cart-outline" size={20} color="#fff" />
                <Text style={styles.addToCartText}>إضافة إلى السلة</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 100, // Ensure content is not obscured by bottom navigation
  },
  bannerContainer: {
    marginBottom: 20,
  },
  bannerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 20,
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  categoryList: {
    paddingLeft: 10,
    marginBottom: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  categoryImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3d4785',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#f5f5f5',
  },
  categoryImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  categoryText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  storeList: {
    paddingLeft: 10,
    marginBottom: 20,
    marginLeft: 10,
  },
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 15,
    width: 250,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  storeImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  storeInfo: {
    padding: 10,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'left',
  },
  storeType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    textAlign: 'left',
  },
  storeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  storeRatingText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
  },
  storeFollowers: {
    fontSize: 12,
    color: '#999',
    textAlign: 'left',
  },
  storeLogo: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  productList: {
    paddingLeft: 10,
    marginBottom: 20,
    marginLeft: 10,
  },
  card: {
    backgroundColor: '#fff',
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
  productImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 10,
  },
  productName: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
    textAlign: 'left',
    
  },
  priceText: {
    fontSize: 14,
    color: '#3d4785',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'left',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  modalInnerContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalProductName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalProductDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4e73df',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  addToCartText: {
    color: '#fff',
    marginLeft: 5,
  },
  remiseCard: {
    backgroundColor: '#FFD700', // Shiny gold background
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
  remiseIconContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 2,
  },
  brandList: {
    paddingLeft: 10,
    marginBottom: 20,
  },
  brandItem: {
    alignItems: 'center',
    marginRight: 15,
    width: 80,
  },
  brandLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 5,
  },
  brandName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  brandGrid: {
    marginBottom: 20,
  },
  brandGridItem: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  brandGridLogo: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
  },
  brandGridName: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    paddingVertical: 10,
  },
  favoriteCard: {
    backgroundColor: '#FFB6C1', // Light pink background
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
  favoriteIconContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 2,
  },
  suggestedCard: {
    backgroundColor: '#FFDAB9', // Light orange background
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
  suggestedIconContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Aligns the title to the left
    marginLeft: 10,
  },
  subcategoryItem: {
    marginRight: 15,
    alignItems: 'center',
  },
  subcategoryImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 5,
  },
  subcategoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  subcategoryText: {
    fontSize: 14,
    color: '#333',
  },
  subcategoryList: {
    paddingLeft: 10,
    marginBottom: 20,
  },
});

export default HomeScreen; 