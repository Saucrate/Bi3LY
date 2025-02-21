import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://192.168.100.219:5000';

// Axios örneği oluşturma
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye
});

const registerUser = async (name, email, password) => {
  try {
    const response = await api.post('/api/auth/register', {
      name,
      email,
      password,
    });
    console.log('User registered:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error.message);
    throw error;
  }
};

const loginUser = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    console.log('User logged in:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error logging in user:', error.message);
    throw error;
  }
};

const updateUserProfile = async (token, name, email, password) => {
  try {
    const response = await api.put(
      '/api/users/profile',
      { name, email, password },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log('User profile updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error.message);
    throw error;
  }
};

export { registerUser, loginUser, updateUserProfile };
