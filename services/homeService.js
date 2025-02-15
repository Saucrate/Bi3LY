import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

// API URL tanımı
const HOME_API_URL = `${API_URL}/api/home`;

// Axios instance oluştur
const api = axios.create({
  baseURL: HOME_API_URL
});

// Request interceptor
api.interceptors.request.use(
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Home service error:', error.response?.data || error);
    return Promise.reject(error.response?.data || error);
  }
);

class HomeService {
  // Ana sayfa verilerini getir
  async getHomeData() {
    try {
      console.log('=== Get Home Data Request ===');
      const token = await AsyncStorage.getItem('token');
      console.log('Token Status:', token ? 'Present' : 'Not Present');
      
      const response = await api.get('/');
      console.log('Response Status:', response.status);
      console.log('Data Structure:', {
        success: response.data.success,
        categories: response.data.data?.categories || {},
        personalized: response.data.data?.personalized || {}
      });
      console.log('=== End Home Data Request ===');
      
      return response.data;
    } catch (error) {
      console.error('Home Data Error:', error);
      throw error;
    }
  }

  // Kullanıcı aktivitesini takip et
  async trackActivity(type, itemId) {
    try {
      const response = await api.post('/track', { type, itemId });
      return response.data;
    } catch (error) {
      console.error('Track activity error:', error);
      throw error;
    }
  }

  // Kullanıcı aktivite özetini getir
  async getActivitySummary() {
    try {
      const response = await api.get('/activity-summary');
      return response.data;
    } catch (error) {
      console.error('Get activity summary error:', error);
      throw error;
    }
  }

  // Kullanıcı tercihlerini güncelle
  async updatePreferences(preferences) {
    try {
      const response = await api.put('/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }

  // Kategorileri getir
  async getCategories() {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  }

  // Özel mağazaları getir
  async getSpecialStores() {
    try {
      const response = await api.get('/special-stores');
      return response.data;
    } catch (error) {
      console.error('Get special stores error:', error);
      throw error;
    }
  }

  // Özel ürünleri getir
  async getSpecialProducts() {
    try {
      const response = await api.get('/special-products');
      return response.data;
    } catch (error) {
      console.error('Get special products error:', error);
      throw error;
    }
  }

  // İndirimli ürünleri getir
  async getDiscountedProducts() {
    try {
      const response = await api.get('/discounted-products');
      return response.data;
    } catch (error) {
      console.error('Get discounted products error:', error);
      throw error;
    }
  }

  // En çok satan mağazaları getir
  async getMostSoldStores() {
    try {
      const response = await api.get('/most-sold-stores');
      return response.data;
    } catch (error) {
      console.error('Get most sold stores error:', error);
      throw error;
    }
  }

  // En çok satan ürünleri getir
  async getMostSoldProducts() {
    try {
      const response = await api.get('/most-sold-products');
      return response.data;
    } catch (error) {
      console.error('Get most sold products error:', error);
      throw error;
    }
  }

  // Markaları getir
  async getBrands() {
    try {
      const response = await api.get('/brands');
      return response.data;
    } catch (error) {
      console.error('Get brands error:', error);
      throw error;
    }
  }

  // Kategori ürünlerini getir
  async getCategoryProducts(categoryId, options = {}) {
    try {
      console.log('Requesting category products with URL:', `${HOME_API_URL}/categories/${categoryId}/products`);
      const { sortBy, priceRange, rating, inStock, search } = options;
      const queryParams = new URLSearchParams();

      if (sortBy) queryParams.append('sortBy', sortBy);
      if (priceRange) {
        queryParams.append('minPrice', priceRange.min);
        queryParams.append('maxPrice', priceRange.max);
      }
      if (rating) queryParams.append('minRating', rating);
      if (inStock) queryParams.append('inStock', true);
      if (search) queryParams.append('search', search);

      const response = await api.get(`/categories/${categoryId}/products?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get category products error details:', error.response?.data || error);
      throw error;
    }
  }

  // Kategori detaylarını getir
  async getCategoryDetails(categoryId) {
    try {
      const response = await api.get(`/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Get category details error:', error);
      throw error;
    }
  }
}

export const homeService = new HomeService(); 