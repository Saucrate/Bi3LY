import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, I18nManager, FlatList } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

I18nManager.forceRTL(true); // Force right-to-left layout

const ProductDetailScreen = ({ route }) => {
  const { productId, productName, productImage, productPrice, productDescription, productCategory } = route.params;

  const sizes = ['38', '40', '42', '44'];
  const colors = ['#0000FF', '#FFFF00', '#FF0000']; // Blue, Yellow, Red

  const [selectedSize, setSelectedSize] = React.useState(sizes[0]);
  const [selectedColor, setSelectedColor] = React.useState(colors[0]);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);

  const reviews = [
    { id: '1', user: 'User1', comment: 'منتج رائع!', rating: 5, userImage: 'https://via.placeholder.com/50' },
    { id: '2', user: 'User2', comment: 'جودة جيدة ولكن السعر مرتفع.', rating: 4, userImage: 'https://via.placeholder.com/50' },
    { id: '3', user: 'User3', comment: 'لم يعجبني.', rating: 2, userImage: 'https://via.placeholder.com/50' },
  ];

  const similarProducts = [
    { id: '1', name: 'حذاء رياضي', price: '45.00 MRU', image: 'https://i.postimg.cc/8CmBZH5N/shoes.webp' },
    { id: '2', name: 'سترة شتوية', price: '55.00 MRU', image: 'https://i.postimg.cc/76X9ZV8m/Screenshot_from_2022-06-03_18-45-12.png' },
    { id: '3', name: 'قميص صيفي', price: '25.00 MRU', image: 'https://i.postimg.cc/j2FhzSjf/bs2.png' },
    { id: '4', name: 'نظارات شمسية', price: '30.00 MRU', image: 'https://i.postimg.cc/3x3QzSGq/sunglasses.jpg' },
  ];

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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: productImage }} style={styles.productImage} />
        <View style={styles.detailsContainer}>
          <Text style={styles.productCategory}>{productCategory}</Text>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
              <AntDesign
                name={isFavorite ? "heart" : "hearto"}
                size={24}
                color={isFavorite ? "#FF0000" : "#333"}
              />
            </TouchableOpacity>
            <Text style={styles.productName}>{productName}</Text>
          </View>
          <Text style={styles.productPrice}>{productPrice}</Text>

          {/* Color Selection */}
          <View style={styles.colorContainer}>
            {colors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColorCircle,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>

          {/* Size Selection */}
          <View style={styles.sizeContainer}>
            {sizes.map((size, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.sizeButton,
                  { borderColor: selectedSize === size ? '#3d4785' : '#ddd' },
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={styles.sizeText}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quantity Selection */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>الكمية:</Text>
            <TouchableOpacity onPress={decreaseQuantity} style={styles.quantityButton}>
              <AntDesign name="minus" size={20} color="#3d4785" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity onPress={increaseQuantity} style={styles.quantityButton}>
              <AntDesign name="plus" size={20} color="#3d4785" />
            </TouchableOpacity>
          </View>

          {/* Product Description */}
          <Text style={styles.productDescription}>{productDescription}</Text>

          {/* Additional Descriptions */}
          <View style={styles.additionalInfo}>
            <Text style={styles.infoTitle}>تفاصيل المنتج</Text>
            <Text style={styles.infoText}>- جاكيت رياضي بسحاب</Text>
            <Text style={styles.infoText}>- ياقة كلاسيكية</Text>
            <Text style={styles.infoText}>- جيب على الصدر</Text>
            <Text style={styles.infoText}>- أكمام طويلة</Text>
            <Text style={styles.infoText}>- إغلاق بسحاب أمامي</Text>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <Text style={styles.reviewsTitle}>التعليقات والتقييمات</Text>
            <FlatList
              data={reviews}
              renderItem={renderReview}
              keyExtractor={(item) => item.id}
            />
          </View>

          {/* Similar Products Section */}
          <View style={styles.similarSection}>
            <Text style={styles.similarTitle}>منتجات مشابهة</Text>
            <FlatList
              data={similarProducts}
              renderItem={renderSimilarProduct}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarList}
            />
          </View>
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
  productImage: {
    width: '100%',
    height: 350,
    resizeMode: 'cover',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
  productPrice: {
    fontSize: 22,
    color: '#3d4785',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
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
  sizeButton: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  sizeText: {
    color: '#333',
  },
  quantityContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginVertical: 15,
  },
  quantityLabel: {
    fontSize: 16,
    marginLeft: 10,
  },
  quantityButton: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
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
});

export default ProductDetailScreen;