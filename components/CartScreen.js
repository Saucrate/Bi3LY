import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons'; // Ensure you have this icon library installed
import { SafeAreaView } from 'react-native-safe-area-context';

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([
    { id: '1', name: 'جاكيت شتوي للرجال والنساء', price: 1156, quantity: 1, image: 'https://mdbootstrap.com/img/bootstrap-ecommerce/items/11.webp' },
    { id: '2', name: 'تي شيرت قطن للرجال', price: 44.8, quantity: 1, image: 'https://mdbootstrap.com/img/bootstrap-ecommerce/items/12.webp' },
    { id: '3', name: 'بليزر سوت جاكيت للرجال', price: 1156, quantity: 1, image: 'https://mdbootstrap.com/img/bootstrap-ecommerce/items/13.webp' },
  ]);

  const increaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.cartImage} />
      <View style={styles.cartDetails}>
        <Text style={styles.cartName}>{item.name}</Text>
        <Text style={styles.cartDescription}>الوصف: لون، حجم</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.cartPrice}>MRU {item.price * item.quantity}</Text>
          <Text style={styles.cartPricePerItem}>MRU {item.price} / لكل قطعة</Text>
        </View>
        <View style={styles.actionsContainer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={() => decreaseQuantity(item.id)}>
              <AntDesign name="minuscircleo" size={24} color="#3d4785" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => increaseQuantity(item.id)}>
              <AntDesign name="pluscircleo" size={24} color="#3d4785" />
            </TouchableOpacity>
          </View>
          <View style={styles.iconContainer}>
            <TouchableOpacity style={styles.iconButton}>
              <FontAwesome name="heart-o" size={24} color="#3b71ca" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.iconButton}>
              <Text style={styles.removeText}>إزالة</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cartList}
      />
      <View style={styles.summaryContainer}>
        <View style={styles.couponContainer}>
          <Text style={styles.couponLabel}>هل لديك قسيمة؟</Text>
          <View style={styles.couponInputContainer}>
            <TextInput style={styles.couponInput} placeholder="رمز القسيمة" />
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>تطبيق</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.totalContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>السعر الإجمالي:</Text>
            <Text style={styles.totalValue}>MRU {calculateTotal()}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>الخصم:</Text>
            <Text style={styles.discountValue}>-MRU 60.00</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>الضريبة:</Text>
            <Text style={styles.totalValue}>MRU 14.00</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>السعر الكلي:</Text>
            <Text style={styles.finalTotalValue}>MRU {calculateTotal() - 60 + 14}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.purchaseButton}>
          <Text style={styles.purchaseButtonText}>إتمام الشراء</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>العودة إلى المتجر</Text>
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'hsl(218, 50%, 91%)',
    padding: 16,
  },
  cartList: {
    paddingBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 10,
  },
  cartImage: {
    width: 96,
    height: 96,
    borderRadius: 10,
  },
  cartDetails: {
    flex: 1,
    paddingLeft: 10,
  },
  cartName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cartDescription: {
    fontSize: 12,
    color: '#666',
    marginVertical: 5,
  },
  priceContainer: {
    marginVertical: 5,
  },
  cartPrice: {
    fontSize: 14,
    color: '#333',
  },
  cartPricePerItem: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginHorizontal: 5,
  },
  removeText: {
    color: 'red',
    fontSize: 14,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    // marginTop: ,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  couponContainer: {
    marginBottom: 16,
  },
  couponLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#3d4785',
    padding: 10,
    borderRadius: 5,
    // marginBottom: 10,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  totalContainer: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    // marginBottom: ,
  },
  totalValue: {
    fontSize: 14,
  },
  discountValue: {
    fontSize: 14,
    color: 'green',
  },
  finalTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  purchaseButton: {
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 30,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
  },
});

export default CartScreen; 