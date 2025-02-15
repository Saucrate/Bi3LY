import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_ENDPOINTS } from './config';

class CartService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}${API_ENDPOINTS.cart}`
    });

    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async getCart() {
    try {
      console.log('getCart - making request');
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('getCart - no token, getting from local storage');
        const localCart = await AsyncStorage.getItem('cart');
        return { success: true, data: { items: localCart ? JSON.parse(localCart) : [] } };
      }

      const response = await this.api.get('/');
      console.log('getCart - response:', response.data);
      
      // Sync with local storage
      if (response.data.success) {
        await AsyncStorage.setItem('cart', JSON.stringify(response.data.data.items));
      }
      
      return response.data;
    } catch (error) {
      console.error('Get cart error:', error.response?.data || error);
      const localCart = await AsyncStorage.getItem('cart');
      return { success: true, data: { items: localCart ? JSON.parse(localCart) : [] } };
    }
  }

  async addToCart(productId, quantity = 1) {
    try {
      console.log('addToCart - starting with productId:', productId, 'quantity:', quantity);
      const token = await AsyncStorage.getItem('token');
      console.log('addToCart - token:', token ? 'exists' : 'not found');
      
      if (token) {
        console.log('addToCart - making API request');
        const response = await this.api.post('/add', { productId, quantity });
        console.log('addToCart - API response:', response.data);
        
        // API yanıtı başarılı olmasa bile devam et
        const cart = await this.getCart();
        await AsyncStorage.setItem('cart', JSON.stringify(cart.data.items));
        return response.data;
      } else {
        console.log('addToCart - handling locally');
        const localCart = await AsyncStorage.getItem('cart');
        let cartItems = localCart ? JSON.parse(localCart) : [];
        
        const existingItem = cartItems.find(item => 
          item.product === productId || item.product._id === productId
        );
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cartItems.push({ 
            product: productId, 
            quantity,
            _id: new Date().getTime().toString() // Geçici ID
          });
        }
        
        console.log('addToCart - updated cart:', cartItems);
        await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
        return { success: true, data: { items: cartItems } };
      }
    } catch (error) {
      console.error('Add to cart error:', error.response?.data || error);
      // Hata durumunda local storage'ı güncelle
      const localCart = await AsyncStorage.getItem('cart');
      let cartItems = localCart ? JSON.parse(localCart) : [];
      
      const existingItem = cartItems.find(item => 
        item.product === productId || item.product._id === productId
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cartItems.push({ 
          product: productId, 
          quantity,
          _id: new Date().getTime().toString()
        });
      }
      
      await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
      return { success: true, data: { items: cartItems } };
    }
  }

  async updateCartItem(itemId, quantity) {
    try {
      console.log('updateCartItem - itemId:', itemId, 'quantity:', quantity);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('updateCartItem - no token, updating local storage');
        const localCart = await AsyncStorage.getItem('cart');
        let cartItems = localCart ? JSON.parse(localCart) : [];
        
        cartItems = cartItems.map(item => 
          item.product === itemId ? { ...item, quantity } : item
        );
        
        await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
        return { success: true, data: { items: cartItems } };
      }

      const response = await this.api.put('/update', { itemId, quantity });
      console.log('updateCartItem - response:', response.data);
      
      if (response.data.success) {
        await AsyncStorage.setItem('cart', JSON.stringify(response.data.data.items));
      }
      
      return response.data;
    } catch (error) {
      console.error('Update cart item error:', error.response?.data || error);
      throw error;
    }
  }

  async removeFromCart(itemId) {
    try {
      console.log('removeFromCart - itemId:', itemId);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('removeFromCart - no token, removing from local storage');
        const localCart = await AsyncStorage.getItem('cart');
        let cartItems = localCart ? JSON.parse(localCart) : [];
        
        cartItems = cartItems.filter(item => item.product !== itemId);
        
        await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
        return { success: true, data: { items: cartItems } };
      }

      const response = await this.api.delete(`/remove/${itemId}`);
      console.log('removeFromCart - response:', response.data);
      
      if (response.data.success) {
        await AsyncStorage.setItem('cart', JSON.stringify(response.data.data.items));
      }
      
      return response.data;
    } catch (error) {
      console.error('Remove from cart error:', error.response?.data || error);
      throw error;
    }
  }

  async applyCoupon(couponCode) {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}${API_ENDPOINTS.cart}/apply-coupon`,
        { couponCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Apply coupon error:', error);
      throw error;
    }
  }

  async clearCart() {
    try {
      console.log('clearCart - executing');
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('clearCart - no token, clearing local storage');
        await AsyncStorage.removeItem('cart');
        return { success: true, message: 'Cart cleared from local storage' };
      }

      const response = await this.api.delete('/clear');
      console.log('clearCart - response:', response.data);
      
      if (response.data.success) {
        await AsyncStorage.removeItem('cart');
      }
      
      return response.data;
    } catch (error) {
      console.error('Clear cart error:', error.response?.data || error);
      throw error;
    }
  }

  async syncCart() {
    try {
      console.log('syncCart - starting sync');
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const localCart = await AsyncStorage.getItem('cart');
        if (localCart) {
          const cartItems = JSON.parse(localCart);
          for (const item of cartItems) {
            await this.addToCart(item.product, item.quantity);
          }
          await AsyncStorage.removeItem('cart');
        }
      }
    } catch (error) {
      console.error('Sync cart error:', error);
    }
  }
}

export const cartService = new CartService(); 