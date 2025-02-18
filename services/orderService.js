import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_ENDPOINTS } from './config';

class OrderService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}${API_ENDPOINTS.orders}`
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

  async createOrder(orderData) {
    try {
      console.log('Creating order with data:', orderData);
      const response = await this.api.post('/', orderData);
      console.log('Order created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create order error:', error.response?.data || error);
      throw error;
    }
  }

  async getUserOrders() {
    try {
      console.log('Getting user orders');
      const response = await this.api.get('/');
      console.log('User orders retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get user orders error:', error.response?.data || error);
      throw error;
    }
  }

  async getOrderById(orderId) {
    try {
      console.log('Getting order details for ID:', orderId);
      const response = await this.api.get(`/${orderId}`);
      console.log('Order details retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get order details error:', error.response?.data || error);
      throw error;
    }
  }

  async cancelOrder(orderId) {
    try {
      console.log('Cancelling order:', orderId);
      const response = await this.api.put(`/${orderId}/cancel`);
      console.log('Order cancelled:', response.data);
      return response.data;
    } catch (error) {
      console.error('Cancel order error:', error.response?.data || error);
      throw error;
    }
  }
}

export const orderService = new OrderService(); 