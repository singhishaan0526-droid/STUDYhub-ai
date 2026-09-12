import axios from 'axios';
import authService from './authService';

const API = import.meta.env.VITE_API_URL;
const BASE_URL = `${API}/api`;

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = authService.getCurrentUser()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
