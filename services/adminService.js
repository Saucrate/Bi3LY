import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.100.219:5000/api/admin';

// Basit axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000 // 60 saniye
});

// Basit request interceptor
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// İstatistikleri getir
const getStatistics = async () => {
  try {
    const response = await api.get('/statistics');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Satıcıları getir
const getSellers = async () => {
  try {
    const response = await api.get('/sellers');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Satıcı detaylarını getir
const getSellerDetails = async (sellerId) => {
  try {
    const response = await api.get(`/sellers/${sellerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Satıcı durumunu güncelle
const updateSellerStatus = async (sellerId, status) => {
  try {
    const response = await api.put(`/sellers/${sellerId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Kullanıcı listesini getir
const getUsers = async (filter = '') => {
  try {
    const response = await api.get(`/users?filter=${filter}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Kullanıcı durumunu güncelle (engelleme/engel kaldırma)
const updateUserStatus = async (userId, status, reason = '') => {
  try {
    const response = await api.put(`/users/${userId}/status`, {
      status,
      reason
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Talepleri getir
const getPendingRequests = async () => {
  try {
    const response = await api.get('/requests', {
      timeout: 10000, // 10 saniye yeterli olmalı
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

// İstek durumunu güncelle
const updateRequestStatus = async (requestId, status, reason = '') => {
  try {
    console.log('Updating request status:', { requestId, status, reason });
    const response = await api.put(`/requests/${requestId}/status`, {
      status,
      reason
    });
    console.log('Update request response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating request status:', error);
    if (error.response?.status === 404) {
      throw new Error('Request not found');
    }
    throw error.response?.data || error;
  }
};

// Satıcı istatistiklerini getir
const getSellerStats = async (sellerId) => {
  try {
    const response = await api.get(`/sellers/${sellerId}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Kullanıcı detaylarını getir
const getUserDetails = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Kullanıcı istatistiklerini getir
const getUserStats = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Admin profilini getir
const getAdminProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Admin profilini güncelle
const updateAdminProfile = async (profileData) => {
  try {
    const response = await api.put('/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Admin şifresini güncelle
const updateAdminPassword = async (passwordData) => {
  try {
    const response = await api.put('/profile/password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Aylık hedefi güncelle
const updateMonthlyTarget = async (target) => {
  try {
    const response = await api.put('/statistics/target', { target });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Kategorileri getir
const getCategories = async () => {
  try {
    console.log('Fetching categories from admin service...');
    const response = await api.get('/categories', {
      timeout: 60000 // 60 saniye timeout
    });
    console.log('Categories API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('getCategories error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error.response?.data || {
      success: false,
      error: 'Failed to load categories'
    };
  }
};

// Kategori ekle
const addCategory = async (formData) => {
  try {
    const response = await api.post('/categories', formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Kategori güncelle
const updateCategory = async (id, formData) => {
  try {
    const response = await api.put(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Kategori sil
const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Ürün onaylama fonksiyonu
const approveProduct = async (productId) => {
  try {
    console.log('Approving product:', productId);
    const response = await api.put(`/products/${productId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving product:', error);
    throw error.response?.data || error;
  }
};

// Ürün reddetme fonksiyonu
const rejectProduct = async (productId, reason) => {
  try {
    console.log('Rejecting product:', { productId, reason });
    const response = await api.put(`/products/${productId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting product:', error);
    throw error.response?.data || error;
  }
};

// Bekleyen ürünleri getir
const getPendingProducts = async () => {
  try {
    const response = await api.get('/products/pending');
    return response.data;
  } catch (error) {
    console.error('Error getting pending products:', error);
    throw error.response?.data || error;
  }
};

export const adminService = {
  getStatistics,
  getSellers,
  getSellerDetails,
  updateSellerStatus,
  getUsers,
  updateUserStatus,
  getPendingRequests,
  updateRequestStatus,
  getSellerStats,
  getUserDetails,
  getUserStats,
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
  updateMonthlyTarget,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  approveProduct,
  rejectProduct,
  getPendingProducts
}; 