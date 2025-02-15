import axios from 'axios';

const API_URL = 'http://192.168.100.35:5000/api/products';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000
});

export const productService = {
getProductDetails: async (productId) => {
  try {
    console.log('Fetching product details for ID:', productId);
    const response = await api.get(`/${productId}`);
    
    if (!response.data?.success || !response.data?.data) {
      throw new Error('Failed to fetch product details');
    }

    return response.data;
  } catch (error) {
    console.error('Error in getProductDetails:', error);
    throw error.response?.data || error;
  }
},

getSimilarProducts: async (productId) => {
  try {
    console.log('Fetching similar products for ID:', productId);
    const response = await api.get(`/${productId}/similar`, {
      timeout: 10000
    });
    
    if (!response.data?.success) {
      console.log('No similar products found');
      return { success: true, data: [] };
    }

    return response.data;
  } catch (error) {
    console.error('Error in getSimilarProducts:', error);
    return { success: true, data: [] };
  }
}
};