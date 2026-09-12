import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const API_URL = `${API}/api/auth/`;

const register = async (name, email, password) => {
  const response = await axios.post(API_URL + 'register', {
    name,
    email,
    password,
  });
  if (response.data.token) {
    localStorage.setItem('userToken', JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (email, password) => {
  const response = await axios.post(API_URL + 'login', {
    email,
    password,
  });
  if (response.data.token) {
    localStorage.setItem('userToken', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('userToken');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('userToken'));
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService;
