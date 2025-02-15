import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.100.35:5000/api/requests';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000
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

export const requestService = {
  // Talep oluştur
  createRequest: async (requestData) => {
    try {
      console.log('Creating request with data:', requestData); // Debug için

      const response = await api.post('/', {
        type: requestData.type,
        store: requestData.store,
        description: requestData.description,
        amount: requestData.amount || undefined,
        duration: requestData.duration || undefined,
        product: requestData.product || undefined,
        images: requestData.images || []
      });

      console.log('Request creation response:', response.data); // Debug için
      return response.data;
    } catch (error) {
      console.error('Create request error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  // Talepleri getir
  getRequests: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('Get requests error:', error);
      throw error.response?.data || error;
    }
  },

  // Talep detayını getir
  getRequestById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get request detail error:', error);
      throw error.response?.data || error;
    }
  },

  // Talep durumunu güncelle
  updateRequestStatus: async (id, status, reason = '') => {
    try {
      console.log('Updating request status:', { id, status, reason });
      const token = await AsyncStorage.getItem('token');
      
      const endpoint = `http://192.168.100.35:5000/api/admin/requests/${id}/status`;
      const requestBody = { 
        status,
        rejectReason: reason 
      };
      
      console.log('Making request to:', endpoint);
      const response = await axios.put(
        endpoint,
        requestBody,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Update request response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update request status error:', error);
      throw error.response?.data || error;
    }
  },

  // Sponsorluk talebi oluştur
  createSponsorshipRequest: async (data) => {
    try {
      const response = await api.post('/sponsorship', data);
      return response.data;
    } catch (error) {
      console.error('Create sponsorship request error:', error);
      throw error.response?.data || error;
    }
  },

  // Mavi rozet talebi oluştur
  createBlueBadgeRequest: async (data) => {
    try {
      const response = await api.post('/blue-badge', data);
      return response.data;
    } catch (error) {
      console.error('Create blue badge request error:', error);
      throw error.response?.data || error;
    }
  },

  // Şikayet talebi oluştur
  createComplaintRequest: async (data) => {
    try {
      const response = await api.post('/complaint', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Create complaint request error:', error);
      throw error.response?.data || error;
    }
  }
}; 