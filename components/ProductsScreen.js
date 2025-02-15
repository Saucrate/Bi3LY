import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Button, RefreshControl } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { sellerService } from '../services/sellerService';

const ProductsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {  productName, productImage, productPrice, productDescription } = route.params;
  const [loading, setLoading] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleAddToCart = () => {
    console.log(`Added ${quantity} of ${productName} to cart.`);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Ürünleri yükleme fonksiyonu
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await sellerService.getStoreProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.refreshProducts) {
        loadProducts();
        // Parametreyi sıfırla
        navigation.setParams({ refreshProducts: false });
      }
    }, [route.params?.refreshProducts])
  );

  // Component mount olduğunda ilk yükleme
  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProducts().finally(() => setRefreshing(false));
  }, []);

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.card}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
          <AntDesign name="arrowleft" size={24} color="#3d4785" />
          <Text style={styles.goBackText}>رجوع</Text>
        </TouchableOpacity>
        <Image source={{ uri: productImage }} style={styles.productImage} />
        <View style={styles.aboutProduct}>
          <Text style={styles.productTitle}>{productName}</Text>
          <Text style={styles.productSubtitle}>{productDescription}</Text>
        </View>
        <View style={styles.stats}>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>السعر</Text>
            <Text style={styles.priceText}>{productPrice} MRU</Text>
          </View>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
            <AntDesign name={isFavorite ? "heart" : "hearto"} size={24} color="#3d4785" />
          </TouchableOpacity>
          <View style={styles.quantityContainer}>
            <Button title="-" onPress={() => setQuantity(Math.max(1, quantity - 1))} />
            <Text style={styles.quantityText}>{quantity}</Text>
            <Button title="+" onPress={() => setQuantity(quantity + 1)} />
          </View>
          <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
            <Text style={styles.cartButtonText}>أضف إلى السلة</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'hsl(218, 50%, 91%)',
    paddingVertical: 20,
  },
  card: {
    width: 350,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  goBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  goBackText: {
    fontSize: 16,
    color: '#3d4785',
    marginLeft: 5,
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  aboutProduct: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3d4785',
    textAlign: 'right',
  },
  productSubtitle: {
    fontSize: 16,
    color: '#3d4785',
    textAlign: 'right',
  },
  stats: {
    marginTop: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  priceText: {
    fontSize: 16,
    color: '#333',
  },
  actionsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  favoriteButton: {
    marginBottom: 20,
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
  cartButton: {
    backgroundColor: '#3d4785',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProductsScreen; 