import axios from 'axios';
import toast from 'react-hot-toast';

// const API_BASE_URL = process.env.REACT_APP_API_URL;
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  getUsers: (params) => api.get('/auth/users', { params }),
  inviteUser: (userData) => api.post('/auth/invite', userData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout'),
};

// Notes API calls
export const notesAPI = {
  createNote: (noteData) => api.post('/notes', noteData),
  getNotes: (params) => api.get('/notes', { params }),
  getNoteById: (id) => api.get(`/notes/${id}`),
  updateNote: (id, noteData) => api.put(`/notes/${id}`, noteData),
  deleteNote: (id) => api.delete(`/notes/${id}`),
};

// Subscription API calls
export const subscriptionAPI = {
  getPlans: () => api.get('/subscription/plans'),
  getMySubscription: () => api.get('/subscription'),
  createOrder: (slug, paymentData) => api.post(`/subscription/tenants/${slug}/upgrade`, paymentData),
  verifyPayment: (paymentData) => api.post('/subscription/verify-payment', paymentData),
  getPaymentHistory: (params) => api.get('/subscription/payments', { params }),
  cancelSubscription: () => api.post('/subscription/cancel'),
};

export default api;