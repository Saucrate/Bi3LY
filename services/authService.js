import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Expo development IP adresi
const API_URL = 'http://192.168.100.35:5000/api/auth';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL
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
  async (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz veya süresi dolmuş
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userId');
      // Login sayfasına yönlendir
      // Bu kısmı navigation ile yapmak gerekiyor
    }
    return Promise.reject(error);
  }
);

// Token'ı AsyncStorage'a kaydetme
const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

// Kullanıcı girişi
const login = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });

    if (response.data.success && response.data.token) {
      // Token'ı kaydet
      await AsyncStorage.setItem('token', response.data.token);
      
      // Kullanıcı bilgilerini kaydet
      if (response.data.user) {
        const { _id, role, isSellerVerified } = response.data.user;
        
        await AsyncStorage.setItem('userId', _id);
        await AsyncStorage.setItem('userRole', role);
        
        // Sadece geçerli bir dizi varsa availableRoles'u kaydet
        const availableRoles = ['client', role].filter(
          (value, index, self) => self.indexOf(value) === index
        );
        if (availableRoles.length > 0) {
          await AsyncStorage.setItem('availableRoles', JSON.stringify(availableRoles));
        }
      }
    }

    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error.response?.data || error;
  }
};

// Kullanıcı kaydı
const register = async (userData) => {
  try {
    console.log('Sending to API:', userData); // Debug için
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    console.error('Auth service register error:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Email doğrulama
const verifyEmail = async (email, code) => {
  try {
    const response = await api.post('/verify-email', {
      email,
      verificationCode: code
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'حدث خطأ في التحقق من البريد الإلكتروني';
  }
};

// Şifre sıfırlama emaili gönderme
const forgotPassword = async (email) => {
  try {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'حدث خطأ في إرسال رمز إعادة تعيين كلمة المرور';
  }
};

// Şifre sıfırlama
const resetPassword = async (email, code, newPassword) => {
  try {
    const response = await api.post('/reset-password', {
      email,
      verificationCode: code,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'حدث خطأ في إعادة تعيين كلمة المرور';
  }
};

// Email doğrulama kodu gönderme
const sendVerificationCode = async (email) => {
  try {
    const response = await api.post('/send-verification', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'حدث خطأ في إرسال رمز التحقق';
  }
};

// Logout işlemi
const logout = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      // Token yoksa sadece local temizlik yap
      await AsyncStorage.multiRemove([
        'token',
        'userId',
        'activeRole',
        'availableRoles'
      ]);
      return { success: true };
    }

    // Token varsa backend'e bildir
    const response = await api.post('/logout');
    
    // Local storage'ı temizle
    await AsyncStorage.multiRemove([
      'token',
      'userId',
      'activeRole',
      'availableRoles'
    ]);
    
    return response.data;
  } catch (error) {
    // Hata olsa bile local storage'ı temizle
    await AsyncStorage.multiRemove([
      'token',
      'userId',
      'activeRole',
      'availableRoles'
    ]);
    throw error.response?.data || error;
  }
};

// Token kontrolü
const checkAuth = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      return false;
    }

    // Token'ın geçerliliğini backend'den kontrol et
    const response = await api.get('/check-auth');
    return response.data.success;
  } catch (error) {
    console.error('Token check error:', error);
    return false;
  }
};

export const authService = {
  login,
  register,
  verifyEmail,
  forgotPassword,
  resetPassword,
  sendVerificationCode,
  logout,
  checkAuth
}; 