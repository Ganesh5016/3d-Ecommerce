import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 15000,
});

// Request interceptor — attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('luxe_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token expiry
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('luxe_refresh_token');
        const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/auth/refresh-token`, { refreshToken });
        localStorage.setItem('luxe_token', data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return API(originalRequest);
      } catch {
        localStorage.removeItem('luxe_token');
        localStorage.removeItem('luxe_refresh_token');
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status !== 401) toast.error(message);
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  verifyEmail: (data) => API.post('/auth/verify-email', data),
  resendOTP: (data) => API.post('/auth/resend-otp', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (token, data) => API.post(`/auth/reset-password/${token}`, data),
};

// Products
export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getOne: (id) => API.get(`/products/${id}`),
  getFeatured: () => API.get('/products/featured'),
  getCategories: () => API.get('/products/categories'),
  create: (data) => API.post('/products', data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
};

// Orders
export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getMyOrders: (params) => API.get('/orders/my-orders', { params }),
  getOne: (id) => API.get(`/orders/${id}`),
  cancel: (id, data) => API.put(`/orders/${id}/cancel`, data),
};

// Cart
export const cartAPI = {
  get: () => API.get('/cart'),
  add: (data) => API.post('/cart/add', data),
  update: (data) => API.put('/cart/update', data),
  clear: () => API.delete('/cart/clear'),
};

// Wishlist
export const wishlistAPI = {
  get: () => API.get('/wishlist'),
  toggle: (productId) => API.post(`/wishlist/toggle/${productId}`),
};

// Reviews
export const reviewAPI = {
  create: (data) => API.post('/reviews', data),
  getByProduct: (productId) => API.get(`/reviews/product/${productId}`),
  delete: (id) => API.delete(`/reviews/${id}`),
};

// Admin
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  toggleUser: (id) => API.put(`/admin/users/${id}/toggle`),
  getOrders: (params) => API.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => API.put(`/orders/${id}/status`, data),
};

// AI
export const aiAPI = {
  search: (q) => API.get('/ai/search', { params: { q } }),
  recommendations: (params) => API.get('/ai/recommendations', { params }),
  chat: (data) => API.post('/ai/chat', data),
};

// Payments
export const paymentAPI = {
  createIntent: (data) => API.post('/payments/create-payment-intent', data),
  confirm: (data) => API.post('/payments/confirm', data),
};

// Users
export const userAPI = {
  updateProfile: (data) => API.put('/users/profile', data),
  changePassword: (data) => API.put('/users/change-password', data),
  addAddress: (data) => API.post('/users/addresses', data),
  deleteAddress: (id) => API.delete(`/users/addresses/${id}`),
};

export default API;
