import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_ENDPOINTS } from './config';

class FavoriteService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}${API_ENDPOINTS.favorites}`
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

  async getFavorites() {
    try {
      console.log('getFavorites - starting');
      const token = await AsyncStorage.getItem('token');
      console.log('getFavorites - token:', token ? 'exists' : 'not found');

      if (!token) {
        const localFavorites = await AsyncStorage.getItem('favorites');
        console.log('getFavorites - loading from local storage:', localFavorites);
        return { 
          success: true, 
          data: localFavorites ? JSON.parse(localFavorites) : [] 
        };
      }

      console.log('getFavorites - making API request');
      const response = await this.api.get('/');
      console.log('getFavorites - API response:', response.data);

      // Sync with local storage
      if (response.data.success) {
        await AsyncStorage.setItem('favorites', JSON.stringify(response.data.data));
      }

      return response.data;
    } catch (error) {
      console.error('getFavorites error:', error.response?.data || error);
      const localFavorites = await AsyncStorage.getItem('favorites');
      return { 
        success: true, 
        data: localFavorites ? JSON.parse(localFavorites) : [] 
      };
    }
  }

  async toggleFavorite(productId) {
    try {
      console.log('toggleFavorite - starting with productId:', productId);
      const token = await AsyncStorage.getItem('token');
      console.log('toggleFavorite - token:', token ? 'exists' : 'not found');
      
      if (token) {
        // API çağrısı
        console.log('toggleFavorite - making API request');
        const response = await this.api.post(`/toggle/${productId}`);
        console.log('toggleFavorite - API response:', response.data);
        
        // API yanıtı başarılı olmasa bile devam et
        const favorites = await this.getFavorites();
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites.data));
        return response.data;
      } else {
        // Local storage işlemi
        console.log('toggleFavorite - handling locally');
        const localFavorites = await AsyncStorage.getItem('favorites');
        let favorites = localFavorites ? JSON.parse(localFavorites) : [];
        
        const index = favorites.findIndex(f => f._id === productId || f.id === productId);
        if (index > -1) {
          favorites.splice(index, 1);
        } else {
          favorites.push({ _id: productId });
        }
        
        console.log('toggleFavorite - updated favorites:', favorites);
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
        return { 
          success: true, 
          data: { 
            isFavorite: index === -1,
            favorites 
          } 
        };
      }
    } catch (error) {
      console.error('Toggle favorite error:', error.response?.data || error);
      // Hata durumunda local storage'ı güncelle
      const localFavorites = await AsyncStorage.getItem('favorites');
      let favorites = localFavorites ? JSON.parse(localFavorites) : [];
      
      const index = favorites.findIndex(f => f._id === productId || f.id === productId);
      if (index > -1) {
        favorites.splice(index, 1);
      } else {
        favorites.push({ _id: productId });
      }
      
      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      return { 
        success: true, 
        data: { 
          isFavorite: index === -1,
          favorites 
        } 
      };
    }
  }

  async checkIsFavorite(productId) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        const localFavorites = await AsyncStorage.getItem('favorites');
        if (!localFavorites) return false;
        const favorites = JSON.parse(localFavorites);
        return favorites.some(item => (item._id || item.id) === productId);
      }

      const response = await axios.get(
        `${API_URL}${API_ENDPOINTS.favorites}/check/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // API yanıtını local storage ile senkronize et
      if (response.data.success) {
        const favorites = await this.getFavorites();
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites.data));
      }

      return response.data.isFavorite;
    } catch (error) {
      console.error('Check favorite error:', error);
      // Hata durumunda local storage'dan kontrol et
      const localFavorites = await AsyncStorage.getItem('favorites');
      if (!localFavorites) return false;
      const favorites = JSON.parse(localFavorites);
      return favorites.some(item => (item._id || item.id) === productId);
    }
  }

  async clearFavorites() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // API'den temizle
        const response = await axios.delete(
          `${API_URL}${API_ENDPOINTS.favorites}/clear`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          await AsyncStorage.removeItem('favorites');
        }
        return response.data;
      } else {
        // Sadece local storage'ı temizle
        await AsyncStorage.removeItem('favorites');
        return { success: true, message: 'Favorites cleared from local storage' };
      }
    } catch (error) {
      console.error('Clear favorites error:', error);
      throw error;
    }
  }

  // Favorileri senkronize et (login/logout durumlarında kullanılabilir)
  async syncFavorites() {
    try {
      console.log('syncFavorites - starting sync');
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const localFavorites = await AsyncStorage.getItem('favorites');
        if (localFavorites) {
          const favorites = JSON.parse(localFavorites);
          for (const favorite of favorites) {
            await this.toggleFavorite(favorite._id || favorite.id);
          }
          await AsyncStorage.removeItem('favorites');
        }
      }
    } catch (error) {
      console.error('syncFavorites error:', error);
    }
  }
}

export const favoriteService = new FavoriteService(); 