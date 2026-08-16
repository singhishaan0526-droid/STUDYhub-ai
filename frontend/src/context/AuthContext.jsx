import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import axios from 'axios';

export const AuthContext = createContext();

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api`,
});

API.interceptors.request.use((config) => {
  const token = authService.getCurrentUser()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = authService.getCurrentUser();
        if (!stored?.token) return;
        
        const { data } = await API.get('/auth/me');
        setUser({ ...data, token: stored.token });
      } catch (err) {
        authService.logout();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (!data?.token) throw new Error('Invalid login response');
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, API, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};