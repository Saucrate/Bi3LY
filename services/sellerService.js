import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.100.219:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,  // 10 saniye timeout
  timeoutErrorMessage: 'Request timeout - please check your connection'
});

// Retry logic ekleyelim
api.interceptors.response.use(undefined, async (error) => {
  if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
    const config = error.config;
    
    // Retry sadece GET istekleri için
    if (!config || !config.retry || config.method !== 'get') {
      return Promise.reject(error);
    }

    config.retry -= 1;
    
    // Delay before retrying
    const delayRetry = new Promise(resolve => {
      setTimeout(resolve, 1000); // 1 saniye bekle
    });

    return delayRetry.then(() => api(config));
  }
  return Promise.reject(error);
});

// Request interceptor'da retry sayısını ekle
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Her istek için 3 retry hakkı
    config.retry = 3;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Store operations
const getStoreProfile = async () => {
  try {
    const response = await api.get('/seller/profile');
    console.log('Store profile response:', response.data);
    
    if (response.data.success && response.data.data.store) {
      // Store bilgilerini AsyncStorage'a kaydet
      await AsyncStorage.setItem('store', JSON.stringify(response.data.data.store));
      return {
        success: true,
        data: response.data.data.store
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Get store profile error:', error);
    throw error.response?.data || error;
  }
};

const updateStoreProfile = async (formData) => {
  try {
    const response = await api.put('/seller/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating store profile:', error);
    throw error.response?.data || error;
  }
};

// Store statistics
const getStoreStats = async () => {
  try {
    const response = await api.get('/seller/stats');
    return response.data;
  } catch (error) {
    console.error('Error getting store stats:', error);
    throw error.response?.data || error;
  }
};

// Product operations
const getStoreProducts = async () => {
  try {
    const response = await api.get('/seller/products');
    return response.data;
  } catch (error) {
    console.error('Error getting store products:', error);
    throw error.response?.data || error;
  }
};

const getProductDetails = async (productId) => {
  try {
    console.log('Fetching product details for:', productId);
    
    const response = await api.get(`/seller/products/${productId}`);
    console.log('Product details response:', response.data);
    
    // Ürün verilerini düzenle
    const product = response.data.data;
    
    // Arrays'leri düzgün formata çevir
    product.categories = product.categories?.map(cat => cat._id || cat) || [];
    product.subcategories = product.subcategories?.map(sub => sub._id || sub) || [];
    product.colors = product.colors?.map(color => color._id || color) || [];
    product.sizes = product.sizes?.map(size => size._id || size) || [];
    product.tags = product.tags?.map(tag => tag._id || tag) || [];
    
    return {
      success: true,
      data: product
    };
  } catch (error) {
    console.error('Error getting product details:', error);
    throw error.response?.data || error;
  }
};

const addProduct = async (productData) => {
  try {
    console.log('Adding new product:', productData);
    
    // Gerekli alanların kontrolü
    if (!productData.name || !productData.price || !productData.brand) {
      throw new Error('Name, price and brand are required');
    }

    // FormData oluştur
    const formData = new FormData();

    // Temel bilgileri ekle
    formData.append('name', productData.name);
    formData.append('description', productData.description || 'No description');
    formData.append('price', productData.price.toString());
    formData.append('countInStock', productData.countInStock.toString());
    formData.append('brand', productData.brand);
    
    if (productData.discountPrice) {
      formData.append('discountPrice', productData.discountPrice.toString());
    }

    // Array verileri için
    if (Array.isArray(productData.categories)) {
      formData.append('categories', JSON.stringify(productData.categories));
    }
    
    if (Array.isArray(productData.subcategories)) {
      formData.append('subcategories', JSON.stringify(productData.subcategories));
    }
    
    if (Array.isArray(productData.colors)) {
      formData.append('colors', JSON.stringify(productData.colors));
    }
    
    if (Array.isArray(productData.sizes)) {
      formData.append('sizes', JSON.stringify(productData.sizes));
    }
    
    if (Array.isArray(productData.tags)) {
      formData.append('tags', JSON.stringify(productData.tags));
    }

    // Resimleri ekle
    if (Array.isArray(productData.images) && productData.images.length > 0) {
      for (const uri of productData.images) {
        const name = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(name);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('images', {
          uri,
          type,
          name
        });
      }
    }

    // Debug için FormData içeriğini göster
    console.log('FormData contents:', Object.fromEntries(formData._parts));

    const response = await api.post('/seller/products', formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error.response?.data || error;
  }
};

const updateProduct = async (productId, productData) => {
  try {
    console.log('Updating product:', productId);
    
    // FormData oluştur
    const formData = new FormData();

    // Temel alanları ekle
    const basicFields = ['name', 'description', 'price', 'countInStock', 'brand', 'discountPrice'];
    basicFields.forEach(field => {
      const value = productData.get(field);
      if (value) {
        formData.append(field, value);
      }
    });

    // Array verilerini ekle
    const arrayFields = ['categories', 'subcategories', 'colors', 'sizes', 'tags'];
    arrayFields.forEach(field => {
      const values = productData.getAll(`${field}[]`) || productData.getAll(field);
      if (values?.length > 0) {
        values.forEach(value => {
          formData.append(`${field}[]`, value);
        });
      }
    });

    // Mevcut resimleri ekle
    const existingImages = productData.getAll('existingImages[]') || productData.getAll('existingImages');
    if (existingImages?.length > 0) {
      existingImages.forEach((img, index) => {
        formData.append(`existingImages[]`, img);
      });
    }

    // Yeni resimleri ekle
    const newImages = productData.getAll('images');
    if (newImages?.length > 0) {
      newImages.forEach((image, index) => {
        if (image && image.uri) {
          formData.append('images', image);
        }
      });
    }

    // Status'u ekle
    const status = productData.get('status');
    if (status) {
      formData.append('status', status);
    }

    console.log('FormData prepared:', Object.fromEntries(formData._parts));

    const response = await api.put(`/seller/products/${productId}`, formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error.response?.data || error;
  }
};

const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/seller/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error.response?.data || error;
  }
};

// Statistics operations
const getDetailedStats = async () => {
  try {
    const response = await api.get('/statistics/seller');
    
    // Backend'den gelen veriyi frontend'in beklediği formata dönüştür
    const formattedData = {
      basicStats: {
        productsCount: response.data?.counts?.products || 0,
        customersCount: response.data?.counts?.orders || 0,
        followersCount: response.data?.counts?.followers || 0,
        rating: response.data?.counts?.rating || 0,
        soldProductsCount: response.data?.counts?.soldProducts || 0,
        favoritesCount: response.data?.counts?.favorites || 0
      },
      monthlyStats: response.data?.sales?.monthly?.map(item => ({
        _id: item._id.month,
        count: item.total,
        total: item.total,
        ordersCount: item.ordersCount || 0,
        rating: item.rating || 0
      })) || [],
      topProducts: response.data?.topProducts || [],
      topCustomers: response.data?.topCustomers || [],
      comparison: {
        currentMonth: {
          sales: response.data?.sales?.currentMonth?.total || 0,
          customers: response.data?.sales?.currentMonth?.customers || 0,
          rewards: response.data?.sales?.currentMonth?.rewards || 0
        },
        lastMonth: {
          sales: response.data?.sales?.lastMonth?.total || 0,
          customers: response.data?.sales?.lastMonth?.customers || 0,
          rewards: response.data?.sales?.lastMonth?.rewards || 0
        }
      },
      pendingOrders: response.data?.orderStatusStats?.find(s => s._id === 'pending')?.count || 0
    };

    return {
      success: true,
      data: formattedData
    };
  } catch (error) {
    console.error('Error getting statistics:', error);
    throw error.response?.data || error;
  }
};

// Orders operations
const getOrders = async () => {
  try {
    const response = await api.get('/seller/orders');
    return response.data;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error.response?.data || error;
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error.response?.data || error;
  }
};

// Yeni marka ekle
const addBrand = async (name) => {
  try {
    console.log('Adding new brand:', name);
    const response = await api.post('/seller/brands', { name });
    return response.data;
  } catch (error) {
    console.error('Error adding brand:', error);
    throw error.response?.data || error;
  }
};

// Yeni beden ekle
const addSize = async (name) => {
  try {
    console.log('Adding new size:', name);
    const response = await api.post('/seller/sizes', { name });
    return response.data;
  } catch (error) {
    console.error('Error adding size:', error);
    throw error.response?.data || error;
  }
};

// Yeni etiket ekle
const addTag = async (name) => {
  try {
    console.log('Adding new tag:', name);
    const response = await api.post('/seller/tags', { name });
    return response.data;
  } catch (error) {
    console.error('Error adding tag:', error);
    throw error.response?.data || error;
  }
};

// Metadata operations
const getBrands = async () => {
  try {
    console.log('Fetching brands...');
    const response = await api.get('/seller/brands');
    console.log('Brands API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting brands:', error);
    throw error.response?.data || error;
  }
};

const getCategories = async () => {
  try {
    console.log('Fetching categories...');
    const response = await api.get('/seller/categories');
    console.log('Categories raw response:', response.data);
    
    // Kategorileri hiyerarşik olarak düzenle
    const categories = response.data.data;
    const mainCategories = categories.filter(cat => !cat.parent);
    
    // Alt kategorileri ana kategorilere ekle
    mainCategories.forEach(mainCat => {
      mainCat.subCategories = categories.filter(cat => 
        cat.parent && cat.parent.toString() === mainCat._id.toString()
      );
    });

    console.log('Processed categories:', mainCategories);
    
    return {
      success: true,
      data: categories // Tüm kategorileri gönder
    };
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error.response?.data || error;
  }
};

const getColors = async () => {
  try {
    console.log('Fetching colors...');
    const response = await api.get('/seller/colors');
    console.log('Colors API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting colors:', error);
    throw error.response?.data || error;
  }
};

const getSizes = async () => {
  try {
    console.log('Fetching sizes...');
    const response = await api.get('/seller/sizes');
    console.log('Sizes API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting sizes:', error);
    throw error.response?.data || error;
  }
};

const getTags = async () => {
  try {
    console.log('Fetching tags...');
    const response = await api.get('/seller/tags');
    console.log('Tags API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting tags:', error);
    throw error.response?.data || error;
  }
};

// Sponsorluk talebi oluştur
const createSponsorshipRequest = async (requestData) => {
  try {
    console.log('Creating sponsorship request:', requestData);
    
    const formData = new FormData();
    
    // Temel bilgileri ekle
    formData.append('type', requestData.type); // STORE_SPONSORSHIP veya PRODUCT_SPONSORSHIP
    formData.append('amount', requestData.amount.toString());
    formData.append('duration', requestData.duration.toString());
    formData.append('description', requestData.description || 'No description');
    
    if (requestData.store) {
      formData.append('store', requestData.store);
    }
    
    if (requestData.product) {
      formData.append('product', requestData.product);
    }

    // Varsa resimleri ekle
    if (Array.isArray(requestData.images) && requestData.images.length > 0) {
      requestData.images.forEach((image, index) => {
        const name = image.split('/').pop();
        const match = /\.(\w+)$/.exec(name);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('images', {
          uri: image,
          type,
          name
        });
      });
    }

    const response = await api.post('/seller/requests', formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating sponsorship request:', error);
    throw error.response?.data || error;
  }
};

// Talep durumunu kontrol et
const checkRequestStatus = async (requestId) => {
  try {
    const response = await api.get(`/seller/requests/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking request status:', error);
    throw error.response?.data || error;
  }
};

// Talepleri listele
const getRequests = async () => {
  try {
    const response = await api.get('/seller/requests');
    return response.data;
  } catch (error) {
    console.error('Error getting requests:', error);
    throw error.response?.data || error;
  }
};

export const sellerService = {
  // Store operations
  getStoreProfile,
  updateStoreProfile,
  getStoreStats,
  
  // Product operations
  getStoreProducts,
  getProductDetails,
  addProduct,
  updateProduct,
  deleteProduct,
  
  // Statistics operations
  getDetailedStats,
  
  // Orders operations
  getOrders,
  updateOrderStatus,
  
  // Metadata operations
  addBrand,
  addSize,
  addTag,
  getBrands,
  getCategories,
  getColors,
  getSizes,
  getTags,
  
  // Sponsorluk talebi oluştur
  createSponsorshipRequest,
  checkRequestStatus,
  getRequests
};
