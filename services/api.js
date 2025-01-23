// services/api.js
const API_BASE_URL = 'https://geolink.pythonanywhere.com/api';

// Helper for API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// API request utility
const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  return handleResponse(response);
};

// User API service
export const userApi = {
  login: (phone_number) => 
    apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ phone_number }),
    }),

  updateProfile: (userData) => 
    apiRequest('/user/update', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
};

// Orders API service
export const orderApi = {
  createOrder: (orderData) => 
    apiRequest('/order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  getUserOrders: (phone_number) => 
    apiRequest(`/orders?phone_number=${encodeURIComponent(phone_number)}`),

  getOrderDetails: (orderId, phone_number) => 
    apiRequest(`/order/${orderId}?phone_number=${encodeURIComponent(phone_number)}`),
};

// Local storage service
export const storageService = {
  keys: {
    USER: 'user_info',
    CART: 'cart_items',
    AUTH: 'auth_token',
  },

  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  },

  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },

  clearAll: () => {
    try {
      Object.values(storageService.keys).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};