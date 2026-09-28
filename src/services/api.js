import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('payroll_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking /api/auth/me during initial load
      if (!error.config.url.includes('/auth/me') && !error.config.url.includes('/auth/login')) {
        localStorage.removeItem('payroll_token');
        localStorage.removeItem('payroll_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
