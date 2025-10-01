// API Configuration
const getApiBaseUrl = () => {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
  
  if (isDevelopment) {
    return 'http://localhost:5001';
  } else {
    // Production: Frontend and backend are served from the same URL
    // API calls will be made to the same domain
    return window.location.origin;
  }
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  VERIFY_EMAIL: '/api/auth/verify-email',
  RESEND_VERIFICATION: '/api/auth/resend-verification',
  GET_CURRENT_USER: '/api/auth/me',
  
  // Products
  PRODUCTS: '/api/products',
  PRODUCT_BY_ID: (id) => `/api/products/${id}`,
  
  // Categories
  CATEGORIES: '/api/categories',
  CATEGORY_BY_ID: (id) => `/api/categories/${id}`,
  
  // Orders
  ORDERS: '/api/orders',
  MY_ORDERS: '/api/orders/my-orders',
  ORDER_BY_ID: (id) => `/api/orders/${id}`,
  ORDER_STATUS: (id) => `/api/orders/${id}/status`,
  ORDERS_BY_STATUS: (status) => `/api/orders?status=${status}`,
  
  // Settings
  SETTINGS: '/api/settings',
  EXCHANGE_RATES: '/api/settings/exchange-rates',
  MIN_ORDER_AMOUNT: '/api/settings/min-order-amount',
  
  // Upload
  UPLOAD: '/api/upload',
  
  // Meat Types
  MEAT_TYPES: '/api/meat-types',
  MEAT_TYPE_BY_ID: (id) => `/api/meat-types/${id}`,
  
  // WhatsApp
  WHATSAPP_TEST: '/api/whatsapp/test',
  
  // Users (Admin)
  USERS: '/api/users',
  BAN_USER: (id) => `/api/users/${id}/ban`,
  UNBAN_USER: (id) => `/api/users/${id}/unban`
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  if (typeof endpoint === 'function') {
    throw new Error('buildApiUrl requires a string endpoint, not a function. Use the endpoint function directly.');
  }
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to build full API URLs with parameters
export const buildApiUrlWithParams = (endpointFunction, ...params) => {
  const endpoint = endpointFunction(...params);
  return `${API_BASE_URL}${endpoint}`;
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  buildApiUrl,
  buildApiUrlWithParams
};
