import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // ignore
  }
  return config;
});

export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/api/auth/login', data),
  register: (data: any) => api.post('/api/auth/register', data),
  me: () => api.get('/api/auth/me'),
};

export const activityAPI = {
  upload: (data: any) => api.post('/api/activities', data),
  list: () => api.get('/api/activities'),
  get: (id: string) => api.get(`/api/activities/${id}`),
};

export const territoryAPI = {
  list: (params?: any) => api.get('/api/territories', { params }),
  get: (id: string) => api.get(`/api/territories/${id}`),
};

export const userAPI = {
  getProfile: (id: string) => api.get(`/api/users/${id}`),
  updateProfile: (data: any) => api.patch('/api/auth/me', data),
};

export const leaderboardAPI = {
  getGlobal: () => api.get('/api/leaderboard'),
};

export default api;
