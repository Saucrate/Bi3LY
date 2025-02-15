import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, I18nManager, FlatList, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { productService } from '../services/productService';

I18nManager.forceRTL(true); // Force right-to-left layout

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId, productData } = route.params;
  const [product, setProduct] = useState(productData || null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProductDetails();
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading product details for ID:', productId);

      const [productDetails, similar] = await Promise.all([
        productService.getProductDetails(productId),
        productService.getSimilarProducts(productId)
      ]);
      
      if (!productDetails?.data) {
        throw new Error('Product details not found');
      }

      const product = productDetails.data;

      console.log('Product Details:', {
        id: product._id,
        name: product.name,
        price: product.price,
        colors: product.colors?.length,
        sizes: product.sizes?.length,
        brand: product.brand?.name
      });

      setProduct(product);
      setSimilarProducts(similar?.data || []);
      
      if (product.sizes?.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors?.length > 0) {
        setSelectedColor(product.colors[0]);
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      setError(error.message || 'Error loading product details');
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل تفاصيل المنتج');
    } finally {
      setLoading(false);
    }
  };

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewContainer}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.userImage }} style={styles.userImage} />
        <Text style={styles.reviewUser}>{item.user}</Text>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <View style={styles.ratingContainer}>
        {Array.from({ length: 5 }, (_, index) => (
          <AntDesign
            key={index}
            name={index < item.rating ? "star" : "staro"}
            size={16}
            color="#FFD700"
          />
        ))}
      </View>
    </View>
  );

  const renderQuantitySelector = () => (
    <View style={styles.quantityContainer}>
      <Text style={styles.sectionTitle}>الكمية</Text>
      <View style={styles.quantityControls}>
        <TouchableOpacity 
          style={styles.quantityButton} 
          onPress={decreaseQuantity}
        >
          <AntDesign name="minus" size={20} color="#3d4785" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantity}</Text>
        <TouchableOpacity 
          style={styles.quantityButton} 
          onPress={increaseQuantity}
        >
          <AntDesign name="plus" size={20} color="#3d4785" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProductDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.sectionTitle}>تفاصيل المنتج</Text>
      {product?.brand?.name && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>العلامة التجارية:</Text>
          <Text style={styles.detailValue}>{product.brand.name}</Text>
        </View>
      )}
      {product?.categories?.map((category) => (
        <View key={category._id} style={styles.detailRow}>
          <Text style={styles.detailLabel}>الفئة:</Text>
          <Text style={styles.detailValue}>{category.name}</Text>
        </View>
      ))}
      {product?.subcategories?.map((sub) => (
        <View key={sub._id} style={styles.detailRow}>
          <Text style={styles.detailLabel}>الفئة الفرعية:</Text>
          <Text style={styles.detailValue}>{sub.name}</Text>
        </View>
      ))}
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>الوصف:</Text>
        <Text style={styles.detailValue}>{product?.description}</Text>
      </View>
    </View>
  );

  const renderSizes = () => {
    if (!product?.sizes?.length) return null;
    
    console.log('Rendering sizes:', product.sizes);

    return (
      <View style={[styles.sizesContainer, styles.sectionSpacing]}>
        <Text style={styles.sectionTitle}>المقاسات المتوفرة</Text>
        <View style={styles.sizeList}>
          {product.sizes.map((size) => {
            console.log('Size item:', size);
            return (
              <TouchableOpacity 
                key={size._id}
                style={[
                  styles.sizeButton,
                  selectedSize?._id === size._id && styles.selectedSizeButton
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[
                  styles.sizeText,
                  selectedSize?._id === size._id && styles.selectedSizeText
                ]}>
                  {size.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderColors = () => {
    if (!product?.colors?.length) return null;

    console.log('Rendering colors:', product.colors);

    return (
      <View style={[styles.colorsContainer, styles.sectionSpacing]}>
        <Text style={styles.sectionTitle}>الألوان المتوفرة</Text>
        <View style={styles.colorList}>
          {product.colors.map((color) => {
            console.log('Color item:', color);
            return (
              <TouchableOpacity 
                key={color._id}
                style={[
                  styles.colorButton,
                  { backgroundColor: color.code },
                  selectedColor?._id === color._id && styles.selectedColorButton
                ]}
                onPress={() => setSelectedColor(color)}
              />
            );
          })}
        </View>
      </View>
    );
  };

  const renderSimilarProducts = () => (
    <View style={styles.similarContainer}>
      <Text style={styles.sectionTitle}>منتجات مشابهة</Text>
      <FlatList
        horizontal
        data={similarProducts}
        keyExtractor={item => item._id ? item._id.toString() : Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.similarCard}>
            <Image source={{ uri: item.images[0] }} style={styles.similarImage} />
            <View style={styles.similarDetails}>
              <Text style={styles.similarName}>{item.name}</Text>
              <Text style={styles.similarPrice}>{item.price} MRU</Text>
              <Text style={styles.similarBrand}>{item.brand?.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderReviews = () => {
    if (!product?.reviews?.length) return null;

    return (
      <View style={styles.reviewsContainer}>
        <Text style={styles.sectionTitle}>التقييمات والتعليقات</Text>
        <FlatList
          data={product.reviews}
          keyExtractor={item => item._id ? item._id.toString() : Math.random().toString()}
          renderItem={({ item }) => (
            <View style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Image 
                  source={{ uri: item.user.profileImage || 'https://via.placeholder.com/50' }} 
                  style={styles.reviewerImage} 
                />
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewerName}>{item.user.name}</Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesome
                        key={star}
                        name={star <= item.rating ? 'star' : 'star-o'}
                        size={16}
                        color="#FFD700"
                      />
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.reviewComment}>{item.comment}</Text>
            </View>
          )}
        />
      </View>
    );
  };

  const renderImageSlider = () => {
    if (!product?.images?.length) return null;

    return (
      <View style={styles.imageSliderContainer}>
        <FlatList
          data={product.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const slideIndex = Math.floor(
              Math.floor(event.nativeEvent.contentOffset.x) /
              Math.floor(event.nativeEvent.layoutMeasurement.width)
            );
            setActiveImageIndex(slideIndex);
          }}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.productImage}
              resizeMode="cover"
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <View style={styles.pagination}>
          {product.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeImageIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3d4785" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderImageSlider()}
        <View style={styles.detailsContainer}>
          <Text style={styles.productCategory}>{product?.category?.name}</Text>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
              <AntDesign
                name={isFavorite ? "heart" : "hearto"}
                size={24}
                color={isFavorite ? "#FF0000" : "#333"}
              />
            </TouchableOpacity>
            <Text style={styles.productName}>{product?.name}</Text>
          </View>
          <View style={styles.priceContainer}>
            {product?.discountPrice ? (
              <>
                <Text style={styles.originalPrice}>{product.price} MRU</Text>
                <Text style={styles.discountPrice}>{product.discountPrice} MRU</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountPercentage}>
                    {Math.round((1 - product.discountPrice / product.price) * 100)}% خصم
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.price}>{product.price} MRU</Text>
            )}
          </View>

          {/* Color Selection */}
          {renderColors()}

          {/* Size Selection */}
          {renderSizes()}

          {/* Quantity Selection */}
          {renderQuantitySelector()}

          {/* Product Details */}
          {renderProductDetails()}

          
          {renderReviews()}

          {/* Similar Products Section */}
          {renderSimilarProducts()}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.addToCartButton}>
        <Text style={styles.addToCartText}>أضف إلى السلة</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 100, // Ensure content doesn't overlap with the fixed button
  },
  imageSliderContainer: {
    height: width * 0.8,
    position: 'relative',
  },
  productImage: {
    width: width,
    height: width * 0.8,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  productCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 5,
    textAlign: 'right',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'right',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
  },
  originalPrice: {
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'line-through',
  },
  discountPrice: {
    fontSize: 24,
    color: '#e53935',
    fontWeight: 'bold',
  },
  discountBadge: {
    backgroundColor: '#e53935',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountPercentage: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  colorContainer: {
    flexDirection: 'row-reverse',
    marginBottom: 15,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  selectedColorCircle: {
    borderColor: '#3d4785',
  },
  sizeContainer: {
    flexDirection: 'row-reverse',
    marginBottom: 15,
  },
  sizeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  sizeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 8,
    marginVertical: 8,
    backgroundColor: '#fff',
    minWidth: 60,
    alignItems: 'center',
  },
  sizeText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  quantityContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
  },
  productDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'right',
  },
  additionalInfo: {
    marginVertical: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    textAlign: 'right',
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#3d4785',
    paddingVertical: 20, // Increased padding for a more prominent button
    paddingHorizontal: 15, // Added horizontal padding
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewsSection: {
    marginTop: 20,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  reviewContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
  },
  reviewHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 5,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    textAlign: 'right',
  },
  ratingContainer: {
    flexDirection: 'row-reverse',
  },
  similarSection: {
    marginTop: 20,
  },
  similarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
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
    padding: 10,
    alignItems: 'center',
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
  similarPrice: {
    fontSize: 14,
    color: '#3d4785',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  similarList: {
    paddingLeft: 16,
  },
  adminActionsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    marginHorizontal: 15,
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  adminButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: '45%',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#4caf50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  detailRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'right',
  },
  sizesContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  colorsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  colorButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  similarContainer: {
    marginTop: 20,
  },
  similarBrand: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  selectedSizeButton: {
    borderColor: '#3d4785',
    backgroundColor: '#3d4785',
  },
  selectedSizeText: {
    color: '#fff',
  },
  selectedColorButton: {
    borderWidth: 3,
    borderColor: '#3d4785',
  },
  reviewsContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  reviewItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  reviewInfo: {
    flexDirection: 'column',
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionSpacing: {
    marginVertical: 15,
  },
  colorList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});

export default ProductDetailScreen;