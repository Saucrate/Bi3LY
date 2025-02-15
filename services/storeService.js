import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

const STORE_API_URL = `${API_URL}/api/stores`;

// Axios instance oluştur
const api = axios.create({
  baseURL: STORE_API_URL
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
    console.error('Store service error:', error.response?.data || error);
    return Promise.reject(error.response?.data || error);
  }
);

class StoreService {
  // Mağaza detaylarını getir
  async getStoreDetails(storeId) {
    try {
      console.log('Fetching store details for:', storeId);
      const response = await api.get(`/${storeId}`);
      console.log('Store details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get store details error:', error);
      throw error;
    }
  }

  // Mağaza ürünlerini getir
  async getStoreProducts(storeId, options = {}) {
    try {
      const { 
        sortBy = 'popular',
        category,
        minPrice,
        maxPrice,
        minRating,
        inStock,
        search,
        page = 1,
        limit = 20
      } = options;

      const queryParams = new URLSearchParams();
      
      if (sortBy) queryParams.append('sortBy', sortBy);
      if (category) queryParams.append('category', category);
      if (minPrice) queryParams.append('minPrice', minPrice);
      if (maxPrice) queryParams.append('maxPrice', maxPrice);
      if (minRating) queryParams.append('minRating', minRating);
      if (inStock) queryParams.append('inStock', inStock);
      if (search) queryParams.append('search', search);
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);

      const response = await api.get(`/${storeId}/products?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get store products error:', error);
      throw error;
    }
  }

  // Mağazayı takip et/takibi bırak
  async toggleFollowStore(storeId) {
    try {
      console.log('Toggling follow for store:', storeId);
      const response = await api.post(`/${storeId}/follow`);
      console.log('Toggle follow response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Toggle follow store error:', error);
      throw error;
    }
  }

  // Mağaza istatistiklerini getir
  async getStoreStats(storeId) {
    try {
      const response = await api.get(`/${storeId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Get store stats error:', error);
      throw error;
    }
  }

  // Mağaza kategorilerini getir
  async getStoreCategories(storeId) {
    try {
      const response = await api.get(`/${storeId}/categories`);
      return response.data;
    } catch (error) {
      console.error('Get store categories error:', error);
      throw error;
    }
  }

  // Mağaza yorumlarını getir
  async getStoreReviews(storeId, page = 1, limit = 10) {
    try {
      const response = await api.get(`/${storeId}/reviews?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get store reviews error:', error);
      throw error;
    }
  }

  // Mağazaya yorum yap
  async addStoreReview(storeId, review) {
    try {
      const response = await api.post(`/${storeId}/reviews`, review);
      return response.data;
    } catch (error) {
      console.error('Add store review error:', error);
      throw error;
    }
  }
}

export const storeService = new StoreService(); 