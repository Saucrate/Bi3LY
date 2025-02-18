import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

const CLIENT_API_URL = `${API_URL}/api/client`;

// Axios instance oluştur
const api = axios.create({
  baseURL: CLIENT_API_URL
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
    console.error('Client service error:', error.response?.data || error);
    return Promise.reject(error.response?.data || error);
  }
);

class ClientService {
  // Profil bilgilerini getir
  async getProfile() {
    try {
      console.log('Getting client profile data');
      const response = await api.get('/profile');
      console.log('Client profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get client profile error:', error);
      throw error;
    }
  }

  // Profil bilgilerini güncelle
  async updateProfile(data) {
    try {
      console.log('Updating client profile with data:', data);
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      // Tek bir endpoint kullan
      const response = await api.put('/profile', data, config);
      console.log('Profile update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update client profile error:', error);
      throw error;
    }
  }

  // Şifre değiştir
  async changePassword(data) {
    try {
      console.log('Changing password');
      const response = await api.put('/profile/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });
      console.log('Password change response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Adresleri getir
  async getAddresses() {
    try {
      console.log('Getting client addresses');
      const response = await api.get('/addresses');
      console.log('Client addresses response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get addresses error:', error);
      throw error;
    }
  }

  // Yeni adres ekle
  async addAddress(addressData) {
    try {
      console.log('Adding new address:', addressData);
      const response = await api.post('/addresses', addressData);
      console.log('Add address response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Add address error:', error);
      throw error;
    }
  }

  // Adres güncelle
  async updateAddress(addressId, addressData) {
    try {
      console.log('Updating address:', addressId, addressData);
      const response = await api.put(`/addresses/${addressId}`, addressData);
      console.log('Update address response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update address error:', error);
      throw error;
    }
  }

  // Adres sil
  async deleteAddress(addressId) {
    try {
      console.log('Deleting address:', addressId);
      const response = await api.delete(`/addresses/${addressId}`);
      console.log('Delete address response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Delete address error:', error);
      throw error;
    }
  }

  // Varsayılan adres ayarla
  async setDefaultAddress(addressId) {
    try {
      console.log('Setting default address:', addressId);
      const response = await api.put(`/addresses/${addressId}/set-default`);
      console.log('Set default address response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Set default address error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await AsyncStorage.multiRemove([
        'token',
        'userId',
        'activeRole',
        'availableRoles'
      ]);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}

export const clientService = new ClientService(); 