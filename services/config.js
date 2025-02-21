// API URL tanımı - kendi IP adresinizle değiştirin
export const API_URL = 'http://192.168.100.219:5000';

// API endpoints
export const API_ENDPOINTS = {
  auth: '/api/auth',
  home: '/api/home',
  products: '/api/products',
  categories: '/api/categories',
  cart: '/api/cart',
  favorites: '/api/favorites',
  orders: '/api/orders',
  profile: '/api/users/profile'
};

// Axios default config
export const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 saniye
}; 